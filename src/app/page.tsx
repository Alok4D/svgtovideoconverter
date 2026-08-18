"use client";

import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Download,
  Play,
  Pause,
  RotateCcw,
  Video,
  Code2,
  Sparkles,
  UploadCloud,
  Check,
  Copy,
  Layers,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Film,
} from "lucide-react";
import { toast } from "sonner";

const SVG_PRESETS = [
  {
    name: "Glowing Neon Pulse",
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </radialGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="25" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bgGrad)" />
  
  <!-- Outer Rotating Ring -->
  <g transform="translate(960, 540)">
    <circle r="300" fill="none" stroke="#38bdf8" stroke-width="4" stroke-dasharray="20 40" opacity="0.6">
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite" />
    </circle>
    <circle r="220" fill="none" stroke="#a855f7" stroke-width="6" stroke-dasharray="60 30" opacity="0.8">
      <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="6s" repeatCount="indefinite" />
    </circle>
    
    <!-- Central Glowing Core -->
    <circle r="120" fill="#6366f1" filter="url(#glow)" opacity="0.9">
      <animate attributeName="r" values="110;140;110" dur="3s" repeatCount="indefinite" />
      <animate attributeName="fill" values="#6366f1;#ec4899;#38bdf8;#6366f1" dur="6s" repeatCount="indefinite" />
    </circle>
    
    <text y="10" font-family="sans-serif" font-size="28" fill="#ffffff" font-weight="900" letter-spacing="6" text-anchor="middle">
      MOTION LAB
    </text>
  </g>
</svg>`,
  },
  {
    name: "Stock Cyber Portal",
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#09090b" />
  <g transform="translate(960, 540)">
    <polygon points="0,-220 190,-110 190,110 0,220 -190,110 -190,-110" fill="none" stroke="#10b981" stroke-width="5">
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="10s" repeatCount="indefinite" />
    </polygon>
    <polygon points="0,-160 138,-80 138,80 0,160 -138,80 -138,-80" fill="none" stroke="#06b6d4" stroke-width="4">
      <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="7s" repeatCount="indefinite" />
    </polygon>
    <circle r="60" fill="#f43f5e">
      <animate attributeName="r" values="40;80;40" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
    </circle>
    <text y="340" font-family="sans-serif" font-size="24" fill="#a1a1aa" font-weight="600" letter-spacing="8" text-anchor="middle">
      FUTURISTIC ENERGY
    </text>
  </g>
</svg>`,
  },
  {
    name: "Modern Floating Waves",
    code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="50%" stop-color="#ef4444" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="#18181b" />
  
  <path fill="url(#waveGrad)" opacity="0.8">
    <animate attributeName="d" 
      values="
        M0,540 C480,400 960,680 1920,540 L1920,1080 L0,1080 Z;
        M0,540 C480,680 960,400 1920,540 L1920,1080 L0,1080 Z;
        M0,540 C480,400 960,680 1920,540 L1920,1080 L0,1080 Z
      " 
      dur="4s" 
      repeatCount="indefinite" 
    />
  </path>
  
  <text x="960" y="420" font-family="sans-serif" font-size="52" fill="#ffffff" font-weight="bold" text-anchor="middle" letter-spacing="4">
    ORGANIC FLOW
  </text>
</svg>`,
  },
];

export default function VideoConverterPage() {
  const [svgCode, setSvgCode] = useState(SVG_PRESETS[0].code);
  const [resolution, setResolution] = useState("3840x2160"); // 4K default
  const [fps, setFps] = useState("30");
  const [duration, setDuration] = useState("5");
  const [codec, setCodec] = useState<"h264" | "prores">("h264");
  const [isExporting, setIsExporting] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(true);
  const [bgPattern, setBgPattern] = useState<"dark" | "checker" | "light">("dark");
  const [copied, setCopied] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoDetails, setVideoDetails] = useState<{
    duration?: number;
    fps?: number;
    width?: number;
    height?: number;
    fileSize?: string;
    codec?: "h264" | "prores";
  } | null>(null);

  const [progressState, setProgressState] = useState<{
    stage: string;
    progress: number;
  } | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced preview key updater
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewKey((prev) => prev + 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [svgCode]);

  // Elapsed timer during export
  useEffect(() => {
    if (isExporting) {
      setElapsedTime(0);
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isExporting]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(svgCode);
    setCopied(true);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async () => {
    if (!svgCode.trim() || !svgCode.includes("<svg")) {
      toast.error("Invalid SVG", {
        description: "Please provide valid SVG code containing an <svg> element.",
      });
      return;
    }

    const parsedDuration = parseInt(duration, 10);
    if (isNaN(parsedDuration) || parsedDuration < 5 || parsedDuration > 60) {
      toast.error("Invalid Duration", {
        description: "Duration must be between 5 and 60 seconds (Stock Standard).",
      });
      return;
    }

    setIsExporting(true);
    setGeneratedVideoUrl(null);
    setVideoDetails(null);
    setProgressState({ stage: "Queueing rendering job...", progress: 5 });

    try {
      const [width, height] = resolution.split("x").map(Number);
      const res = await fetch("/api/video/convert-svg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          svgCode,
          fps: parseInt(fps, 10),
          duration: parsedDuration,
          width,
          height,
          codec,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to enqueue video render job");
      }

      const jobId = data.jobId;
      setProgressState({ stage: "Job queued. Preparing renderer...", progress: 10 });

      // Poll status
      pollIntervalRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/video/status/${jobId}`);
          if (!statusRes.ok) {
            throw new Error("Unable to retrieve job progress");
          }

          const statusData = await statusRes.json();

          if (statusData.state === "completed") {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setIsExporting(false);
            setProgressState(null);

            toast.success("Video Rendered Successfully!", {
              description: `Rendered ${width}x${height} MP4 ready for download.`,
            });

            if (statusData.result?.videoUrl) {
              setGeneratedVideoUrl(statusData.result.videoUrl);
              setVideoDetails(statusData.result);
            }
          } else if (statusData.state === "failed") {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setIsExporting(false);
            setProgressState(null);
            toast.error("Render Failed", {
              description: statusData.error || "An error occurred during rendering.",
            });
          } else {
            setProgressState({
              stage: statusData.stage || "Rendering frames...",
              progress: statusData.progress || 15,
            });
          }
        } catch (pollErr: any) {
          console.error("Polling error:", pollErr);
        }
      }, 1200);
    } catch (err: any) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setIsExporting(false);
      setProgressState(null);
      toast.error("Export Error", {
        description: err.message || "Could not start video export.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Film className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  SVG to Video Studio
                </h1>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  4K Remotion Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Transform animated SVGs into professional MP4 videos for Adobe Stock & Motion Graphics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              size="lg"
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-indigo-500/25 border-0 transition-all active:scale-95 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating MP4 ({progressState?.progress || 0}%)
                </>
              ) : (
                <>
                  <Video className="h-4 w-4 mr-2" />
                  Export MP4 Video
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Editor & Presets (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-semibold text-slate-200">SVG Code Editor</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Presets dropdown */}
              <Select
                onValueChange={(val) => {
                  const preset = SVG_PRESETS.find((p) => p.name === val);
                  if (preset) {
                    setSvgCode(preset.code);
                    toast.info(`Loaded "${preset.name}" preset`);
                  }
                }}
              >
                <SelectTrigger className="h-8 text-xs bg-slate-800/80 border-slate-700 w-[170px] text-slate-300">
                  <SelectValue placeholder="✨ Load Preset" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  {SVG_PRESETS.map((preset) => (
                    <SelectItem key={preset.name} value={preset.name} className="text-xs">
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Upload SVG */}
              <input
                type="file"
                accept=".svg"
                id="svg-upload-input"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    if (event.target?.result) {
                      setSvgCode(event.target.result as string);
                      toast.success("Uploaded SVG file successfully!");
                    }
                  };
                  reader.readAsText(file);
                  e.target.value = "";
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-300"
                onClick={() => document.getElementById("svg-upload-input")?.click()}
              >
                <UploadCloud className="h-3.5 w-3.5 mr-1 text-slate-400" />
                Upload .SVG
              </Button>

              {/* Copy Code */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-slate-400 hover:text-slate-200"
                onClick={handleCopyCode}
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-[500px] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl bg-[#1e1e1e] flex flex-col">
            <Editor
              height="100%"
              defaultLanguage="xml"
              theme="vs-dark"
              value={svgCode}
              onChange={(value) => setSvgCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                wordWrap: "on",
                formatOnPaste: true,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>
        </section>

        {/* Right Column: Live Preview, Settings & Render Progress (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          {/* Live SVG Preview */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl flex flex-col backdrop-blur-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/80">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-semibold text-slate-200">Live Preview</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Background Pattern Switcher */}
                <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700/60">
                  <button
                    onClick={() => setBgPattern("dark")}
                    className={`px-2 py-0.5 text-[11px] rounded ${
                      bgPattern === "dark" ? "bg-slate-700 text-white font-medium shadow-sm" : "text-slate-400"
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setBgPattern("checker")}
                    className={`px-2 py-0.5 text-[11px] rounded ${
                      bgPattern === "checker" ? "bg-slate-700 text-white font-medium shadow-sm" : "text-slate-400"
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setBgPattern("light")}
                    className={`px-2 py-0.5 text-[11px] rounded ${
                      bgPattern === "light" ? "bg-slate-700 text-white font-medium shadow-sm" : "text-slate-400"
                    }`}
                  >
                    Light
                  </button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-slate-200"
                  onClick={() => setPreviewKey((k) => k + 1)}
                  title="Restart Preview Animation"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Preview Frame */}
            <div
              className={`h-[280px] p-4 flex items-center justify-center relative overflow-hidden transition-all ${
                bgPattern === "checker"
                  ? "bg-slate-900"
                  : bgPattern === "light"
                  ? "bg-slate-200"
                  : "bg-black"
              }`}
              style={
                bgPattern === "checker"
                  ? {
                      backgroundImage:
                        "radial-gradient(circle, #334155 1px, transparent 1px)",
                      backgroundSize: "16px 16px",
                    }
                  : undefined
              }
            >
              <div
                key={previewKey}
                className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto transition-all"
                dangerouslySetInnerHTML={{ __html: svgCode }}
              />
            </div>
          </div>

          {/* Export Settings Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Sliders className="h-4 w-4 text-purple-400" />
              <h2 className="text-sm font-semibold text-slate-200">Export Specifications</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Resolution */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Resolution</Label>
                <Select value={resolution} onValueChange={(val) => val && setResolution(val)}>
                  <SelectTrigger className="bg-slate-800/80 border-slate-700 text-slate-200 text-xs">
                    <SelectValue placeholder="Resolution" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <SelectItem value="3840x2160">4K Ultra HD (3840x2160) - Best</SelectItem>
                    <SelectItem value="1920x1080">Full HD 1080p (1920x1080)</SelectItem>
                    <SelectItem value="1280x720">HD 720p (1280x720)</SelectItem>
                    <SelectItem value="1080x1080">1:1 Square (1080x1080)</SelectItem>
                    <SelectItem value="1080x1920">9:16 Vertical Story (1080x1920)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Frame Rate */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Frame Rate</Label>
                <Select value={fps} onValueChange={(val) => val && setFps(val)}>
                  <SelectTrigger className="bg-slate-800/80 border-slate-700 text-slate-200 text-xs">
                    <SelectValue placeholder="FPS" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <SelectItem value="24">24 FPS (Cinematic)</SelectItem>
                    <SelectItem value="30">30 FPS (Standard Video)</SelectItem>
                    <SelectItem value="60">60 FPS (Ultra Smooth)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Video Codec */}
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs text-slate-400">Video Codec</Label>
                <Select value={codec} onValueChange={(val) => val && setCodec(val as any)}>
                  <SelectTrigger className="bg-slate-800/80 border-slate-700 text-slate-200 text-xs">
                    <SelectValue placeholder="Codec" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <SelectItem value="h264">H.264 (MP4) - Web & Mobile Friendly</SelectItem>
                    <SelectItem value="prores">Apple ProRes 422 HQ (MOV) - Best for Adobe Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Duration Slider */}
              <div className="sm:col-span-2 space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Duration: <strong className="text-white text-sm">{duration}s</strong></span>
                  <div className="flex gap-1">
                    {[5, 10, 15, 30].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => setDuration(sec.toString())}
                        className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
                          duration === sec.toString()
                            ? "bg-indigo-600 border-indigo-500 text-white font-medium"
                            : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="flex-1 accent-indigo-500 cursor-pointer"
                  />
                  <Input
                    type="number"
                    min="5"
                    max="60"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-16 h-8 text-xs bg-slate-800/80 border-slate-700 text-center text-slate-200"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Adobe Stock / Shutterstock standard length requirement: 5s – 60s.
                </p>
              </div>
            </div>
          </div>

          {/* Render Progress Card (Shown when exporting) */}
          {isExporting && (
            <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/40 to-slate-900/90 p-5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                  <span className="text-sm font-semibold text-indigo-200">
                    {progressState?.stage || "Rendering Video..."}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-400">
                  {progressState?.progress || 0}% • {elapsedTime}s
                </span>
              </div>

              {/* Glowing Progress Bar */}
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden relative p-0.5 border border-slate-700/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 shadow-md shadow-indigo-500/50"
                  style={{ width: `${Math.max(5, progressState?.progress || 0)}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 mt-2.5 text-center">
                Rendering SVG frames with Remotion Headless Chrome & H.264 encoder...
              </p>
            </div>
          )}

          {/* Rendered Video Showcase */}
          {generatedVideoUrl && !isExporting && (
            <div className="rounded-2xl border border-emerald-500/40 bg-slate-900/90 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-300">
                    Video Ready for Download
                  </span>
                </div>

                <a
                  href={generatedVideoUrl}
                  download={videoDetails?.codec === "prores" ? "stock-video-prores.mov" : "stock-video.mp4"}
                  className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-600/20 transition-colors"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Download {videoDetails?.codec === "prores" ? "ProRes MOV" : "MP4"}
                </a>
              </div>

              <div className="p-4 bg-black flex flex-col items-center justify-center w-full">
                {videoDetails?.codec === "prores" ? (
                  <div className="h-[200px] w-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-lg bg-slate-950/40">
                    <AlertCircle className="h-8 w-8 text-amber-500 mb-2.5" />
                    <h3 className="text-xs font-semibold text-slate-200 mb-1">ProRes Preview Unsupported in Browser</h3>
                    <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                      Apple ProRes 422 is a professional production codec and cannot be played directly inside web browsers. Please download the file to view it.
                    </p>
                  </div>
                ) : (
                  <video
                    src={generatedVideoUrl}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="max-h-[280px] w-auto rounded-lg shadow-2xl border border-slate-800 bg-black"
                  />
                )}

                {videoDetails && (
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[11px] text-slate-400 font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-bold uppercase text-indigo-400">
                      {videoDetails.codec || 'h264'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {videoDetails.width}x{videoDetails.height}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {videoDetails.fps} FPS
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {videoDetails.duration}s Duration
                    </span>
                    {videoDetails.fileSize && (
                      <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-semibold">
                        {videoDetails.fileSize}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

