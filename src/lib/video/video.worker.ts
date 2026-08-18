import path from 'path';
import fs from 'fs';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { videoQueue, VideoJob, VideoJobResult } from './video.queue';

let cachedBundleLocation: string | null = null;
let bundlingPromise: Promise<string> | null = null;

async function getOrBuildBundle(): Promise<string> {
  if (cachedBundleLocation && fs.existsSync(cachedBundleLocation)) {
    return cachedBundleLocation;
  }

  if (bundlingPromise) {
    return bundlingPromise;
  }

  const entryPoint = path.resolve(process.cwd(), 'src/lib/video/remotion/index.ts');
  console.log('[Remotion] Bundling composition from entry point:', entryPoint);

  bundlingPromise = bundle({
    entryPoint,
    webpackOverride: (config) => config,
  }).then((loc) => {
    cachedBundleLocation = loc;
    bundlingPromise = null;
    return loc;
  }).catch((err) => {
    bundlingPromise = null;
    throw err;
  });

  return bundlingPromise;
}

export async function processVideoRender(job: VideoJob): Promise<VideoJobResult> {
  const { svgCode, fps = 30, duration = 5, width = 1920, height = 1080 } = job.data;
  
  console.log(`[Job ${job.id}] Starting SVG to MP4 render: ${width}x${height} @ ${fps}fps, ${duration}s`);
  await job.updateProgress(10, 'Preparing Remotion renderer...');

  const compositionId = 'SvgVideo';
  const outDir = path.resolve(process.cwd(), 'uploads');

  // Ensure uploads directory exists
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outputLocation = path.join(outDir, `video-${job.id}.mp4`);
  const durationInFrames = Math.max(1, Math.round(duration * fps));

  try {
    await job.updateProgress(20, 'Bundling video assets...');
    const bundleLocation = await getOrBuildBundle();

    await job.updateProgress(35, 'Configuring composition settings...');
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps: {
        svgCode,
        duration,
        fps,
        width,
        height,
      },
    });

    await job.updateProgress(40, 'Rendering video frames...');
    console.log(`[Job ${job.id}] Rendering ${durationInFrames} frames to ${outputLocation}...`);

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation,
      inputProps: {
        svgCode,
        duration,
        fps,
        width,
        height,
      },
      frameRange: [0, durationInFrames - 1],
      imageFormat: 'png',
      crf: 16,
      pixelFormat: 'yuv420p',
      onProgress: ({ progress }) => {
        // Map remotion progress (0.0 to 1.0) to (40% to 95%)
        const currentProgress = 40 + Math.floor(progress * 55);
        const percentStr = Math.round(progress * 100);
        job.updateProgress(currentProgress, `Rendering frames (${percentStr}%)...`);
      },
    });

    await job.updateProgress(95, 'Finalizing MP4 file...');

    // Calculate file size
    let formattedSize = '';
    if (fs.existsSync(outputLocation)) {
      const stats = fs.statSync(outputLocation);
      const mb = (stats.size / (1024 * 1024)).toFixed(2);
      formattedSize = `${mb} MB`;
    }

    const downloadUrl = `/api/video/download/${job.id}`;
    await job.updateProgress(100, 'Video ready!');
    console.log(`[Job ${job.id}] Render completed successfully: ${outputLocation} (${formattedSize})`);

    return {
      videoUrl: downloadUrl,
      duration,
      fps,
      width,
      height,
      fileSize: formattedSize,
    };
  } catch (error: any) {
    console.error(`[Job ${job.id}] Render error:`, error);
    throw error;
  }
}

// Register processor on singleton queue
videoQueue.registerProcessor(processVideoRender);
console.log('[Video Worker] Registered render processor.');

