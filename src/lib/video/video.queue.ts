import EventEmitter from 'events';

export type JobState = 'waiting' | 'active' | 'completed' | 'failed';

export interface VideoJobData {
  svgCode: string;
  fps: number;
  duration: number;
  width: number;
  height: number;
}

export interface VideoJobResult {
  videoUrl: string;
  duration?: number;
  fps?: number;
  width?: number;
  height?: number;
  fileSize?: string;
}

export interface VideoJob {
  id: string;
  data: VideoJobData;
  state: JobState;
  progress: number;
  stage: string;
  returnvalue: VideoJobResult | null;
  failedReason: string | null;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  getState: () => Promise<JobState>;
  updateProgress: (progress: number, stage?: string) => Promise<void>;
}

class VideoJobQueue extends EventEmitter {
  private jobs: Map<string, VideoJob> = new Map();
  private queue: string[] = [];
  private isProcessing = false;
  private processor: ((job: VideoJob) => Promise<VideoJobResult>) | null = null;

  constructor() {
    super();
    // Periodically clean up old completed/failed jobs older than 1 hour
    setInterval(() => {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      for (const [id, job] of this.jobs.entries()) {
        if ((job.state === 'completed' || job.state === 'failed') && job.createdAt < oneHourAgo) {
          this.jobs.delete(id);
        }
      }
    }, 15 * 60 * 1000);
  }

  public registerProcessor(processor: (job: VideoJob) => Promise<VideoJobResult>) {
    this.processor = processor;
    this.processNext();
  }

  public async add(name: string, data: VideoJobData): Promise<VideoJob> {
    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    const job: VideoJob = {
      id,
      data,
      state: 'waiting',
      progress: 0,
      stage: 'In Queue',
      returnvalue: null,
      failedReason: null,
      createdAt: Date.now(),
      getState: async () => job.state,
      updateProgress: async (progress: number, stage?: string) => {
        job.progress = Math.min(100, Math.max(0, progress));
        if (stage) job.stage = stage;
        this.emit('progress', { jobId: job.id, progress: job.progress, stage: job.stage });
      },
    };

    this.jobs.set(id, job);
    this.queue.push(id);
    this.emit('waiting', job);

    // Trigger processing
    setTimeout(() => this.processNext(), 10);

    return job;
  }

  public async getJob(id: string): Promise<VideoJob | null> {
    return this.jobs.get(id) || null;
  }

  private async processNext() {
    if (this.isProcessing || !this.processor || this.queue.length === 0) {
      return;
    }

    const jobId = this.queue.shift();
    if (!jobId) return;

    const job = this.jobs.get(jobId);
    if (!job) {
      this.processNext();
      return;
    }

    this.isProcessing = true;
    job.state = 'active';
    job.startedAt = Date.now();
    job.stage = 'Starting render process...';
    job.progress = 5;
    this.emit('active', job);

    try {
      const result = await this.processor(job);
      job.state = 'completed';
      job.progress = 100;
      job.stage = 'Completed';
      job.returnvalue = result;
      job.completedAt = Date.now();
      this.emit('completed', job);
    } catch (err: any) {
      job.state = 'failed';
      job.failedReason = err?.message || 'Video generation failed';
      job.stage = 'Failed';
      this.emit('failed', job, err);
      console.error(`[Job ${job.id}] Execution failed:`, err);
    } finally {
      this.isProcessing = false;
      this.processNext();
    }
  }
}

// Global singleton instance so it persists across API route invocations in dev and prod
const globalForQueue = globalThis as unknown as { videoJobQueue?: VideoJobQueue };
export const videoQueue = globalForQueue.videoJobQueue || new VideoJobQueue();
if (process.env.NODE_ENV !== 'production') {
  globalForQueue.videoJobQueue = videoQueue;
}

export const addVideoJob = async (jobData: VideoJobData) => {
  return await videoQueue.add('render', jobData);
};

