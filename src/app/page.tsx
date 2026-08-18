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
    <div className="min-h-screen flex flex-col bg-[#eaeaea] text-[#2e2e2e] selection:bg-[#5bb75b] selection:text-white font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-[#ced4da] bg-white sticky top-0 z-40 px-6 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[4px] bg-[#5bb75b] flex items-center justify-center shadow-sm">
              <Film className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-[#2e2e2e] uppercase font-sans">
                  SVG to MP4 <span className="text-[#5bb75b] font-normal">Studio</span>
                </h1>
                <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-[3px] bg-[#f8f9fa] text-[#6c757d] border border-[#ced4da]">
                  Utility Converter
                </span>
              </div>
              <p className="text-xs text-[#6c757d] font-sans">
                Convert animated SVGs (SMIL, CSS) into high quality H.264 MP4 & ProRes MOV files.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              size="lg"
              className="bg-[#5bb75b] hover:bg-[#449d44] text-white font-semibold shadow-sm border-0 rounded-[4px] transition-all duration-150 active:scale-95 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5bb75b]"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating ({progressState?.progress || 0}%)
                </>
              ) : (
                <>
                  <Video className="h-4 w-4 mr-2" />
                  Convert to MP4
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
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-[4px] border border-[#ced4da] shadow-sm">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-[#5bb75b]" />
              <span className="text-sm font-semibold text-[#2e2e2e] font-sans">SVG Code Editor</span>
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
                <SelectTrigger className="h-8 text-xs bg-white border-[#ced4da] w-[170px] text-[#2e2e2e] rounded-[3px] hover:border-[#5bb75b] focus:ring-[#5bb75b]">
                  <SelectValue placeholder="✨ Load Preset" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#ced4da] text-[#2e2e2e]">
                  {SVG_PRESETS.map((preset) => (
                    <SelectItem key={preset.name} value={preset.name} className="text-xs focus:bg-[#f8f9fa] focus:text-[#5bb75b]">
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
                className="h-8 text-xs bg-white border-[#ced4da] hover:bg-[#f8f9fa] hover:text-[#2e2e2e] text-[#2e2e2e] rounded-[4px] transition-all"
                onClick={() => document.getElementById("svg-upload-input")?.click()}
              >
                <UploadCloud className="h-3.5 w-3.5 mr-1 text-[#6c757d]" />
                Upload .SVG
              </Button>

              {/* Copy Code */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-[#6c757d] hover:text-[#2e2e2e] hover:bg-slate-100 rounded-[3px]"
                onClick={handleCopyCode}
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-[500px] rounded-[4px] border border-[#ced4da] overflow-hidden shadow-sm bg-[#1e1e1e] flex flex-col hover:shadow-1 transition-all">
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
          <div className="rounded-[4px] border border-[#ced4da] bg-white overflow-hidden shadow-sm flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#ced4da] bg-[#f8f9fa]">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-[#5bb75b]" />
                <span className="text-sm font-semibold text-[#2e2e2e] font-sans">Live Preview</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Background Pattern Switcher */}
                <div className="flex bg-slate-100 rounded-[3px] p-0.5 border border-[#ced4da]">
                  <button
                    onClick={() => setBgPattern("dark")}
                    className={`px-2 py-0.5 text-[11px] rounded-[3px] transition-all ${
                      bgPattern === "dark" ? "bg-[#5bb75b] text-white font-medium shadow-sm" : "text-slate-500 hover:text-[#2e2e2e]"
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setBgPattern("checker")}
                    className={`px-2 py-0.5 text-[11px] rounded-[3px] transition-all ${
                      bgPattern === "checker" ? "bg-[#5bb75b] text-white font-medium shadow-sm" : "text-slate-500 hover:text-[#2e2e2e]"
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setBgPattern("light")}
                    className={`px-2 py-0.5 text-[11px] rounded-[3px] transition-all ${
                      bgPattern === "light" ? "bg-[#5bb75b] text-white font-medium shadow-sm" : "text-slate-500 hover:text-[#2e2e2e]"
                    }`}
                  >
                    Light
                  </button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-[#6c757d] hover:text-[#2e2e2e] hover:bg-slate-200 rounded-[3px]"
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
          <div className="rounded-[4px] border border-[#ced4da] bg-white p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#ced4da] pb-3">
              <Sliders className="h-4 w-4 text-[#5bb75b]" />
              <h2 className="text-sm font-semibold text-[#2e2e2e] font-sans">Export Specifications</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Resolution */}
              <div className="space-y-1.5">
                <Label className="text-xs text-[#6c757d] font-sans">Resolution</Label>
                <Select value={resolution} onValueChange={(val) => val && setResolution(val)}>
                  <SelectTrigger className="bg-white border-[#ced4da] text-[#2e2e2e] text-xs rounded-[3px] hover:border-[#5bb75b]">
                    <SelectValue placeholder="Resolution" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#ced4da] text-[#2e2e2e]">
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
                <Label className="text-xs text-[#6c757d] font-sans">Frame Rate</Label>
                <Select value={fps} onValueChange={(val) => val && setFps(val)}>
                  <SelectTrigger className="bg-white border-[#ced4da] text-[#2e2e2e] text-xs rounded-[3px] hover:border-[#5bb75b]">
                    <SelectValue placeholder="FPS" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#ced4da] text-[#2e2e2e]">
                    <SelectItem value="24">24 FPS (Cinematic)</SelectItem>
                    <SelectItem value="30">30 FPS (Standard Video)</SelectItem>
                    <SelectItem value="60">60 FPS (Ultra Smooth)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Video Codec */}
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs text-[#6c757d] font-sans">Video Codec</Label>
                <Select value={codec} onValueChange={(val) => val && setCodec(val as any)}>
                  <SelectTrigger className="bg-white border-[#ced4da] text-[#2e2e2e] text-xs rounded-[3px] hover:border-[#5bb75b]">
                    <SelectValue placeholder="Codec" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#ced4da] text-[#2e2e2e]">
                    <SelectItem value="h264">H.264 (MP4) - Web & Mobile Friendly</SelectItem>
                    <SelectItem value="prores">Apple ProRes 422 HQ (MOV) - Best for Adobe Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Duration Slider */}
              <div className="sm:col-span-2 space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs text-[#6c757d]">
                  <span className="font-sans">Duration: <strong className="text-[#2e2e2e] text-sm font-semibold">{duration}s</strong></span>
                  <div className="flex gap-1">
                    {[5, 10, 15, 30].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => setDuration(sec.toString())}
                        className={`px-2 py-0.5 rounded-[3px] text-[11px] border transition-colors ${
                          duration === sec.toString()
                            ? "bg-[#5bb75b] border-[#5bb75b] text-white font-medium shadow-sm"
                            : "bg-white border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
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
                    className="flex-1 accent-[#5bb75b] cursor-pointer bg-slate-200 h-1.5 rounded-lg appearance-none"
                  />
                  <Input
                    type="number"
                    min="5"
                    max="60"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-16 h-8 text-xs bg-white border-[#ced4da] text-center text-[#2e2e2e] rounded-[3px] focus:border-[#5bb75b] focus:ring-[#5bb75b]"
                  />
                </div>
                <p className="text-[11px] text-[#6c757d] font-sans">
                  Adobe Stock / Shutterstock standard length requirement: 5s – 60s.
                </p>
              </div>
            </div>
          </div>

          {/* Render Progress Card (Shown when exporting) */}
          {isExporting && (
            <div className="rounded-[4px] border border-[#5bb75b]/20 bg-white p-5 shadow-sm animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#5bb75b]" />
                  <span className="text-sm font-semibold text-[#2e2e2e] font-sans">
                    {progressState?.stage || "Rendering Video..."}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-[#5bb75b]">
                  {progressState?.progress || 0}% • {elapsedTime}s
                </span>
              </div>

              {/* Glowing Progress Bar */}
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative p-0.5 border border-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#5bb75b] to-[#84c53c] transition-all duration-500 shadow-md shadow-[#5bb75b]/10"
                  style={{ width: `${Math.max(5, progressState?.progress || 0)}%` }}
                />
              </div>

              <p className="text-[11px] text-[#6c757d] mt-2.5 text-center font-sans">
                Rendering SVG frames with Remotion Headless Chrome & H.264 encoder...
              </p>
            </div>
          )}

          {/* Rendered Video Showcase */}
          {generatedVideoUrl && !isExporting && (
            <div className="rounded-[4px] border border-emerald-500/30 bg-white overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#ced4da] bg-[#f8f9fa]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-[#2e2e2e] font-sans">
                    Video Ready for Download
                  </span>
                </div>

                <a
                  href={generatedVideoUrl}
                  download={videoDetails?.codec === "prores" ? "stock-video-prores.mov" : "stock-video.mp4"}
                  className="inline-flex items-center justify-center h-8 px-4 rounded-[4px] bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition-all active:scale-95"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Download {videoDetails?.codec === "prores" ? "ProRes MOV" : "MP4"}
                </a>
              </div>

              <div className="p-4 bg-black flex flex-col items-center justify-center w-full">
                {videoDetails?.codec === "prores" ? (
                  <div className="h-[200px] w-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-[4px] bg-slate-50">
                    <AlertCircle className="h-8 w-8 text-amber-600 mb-2.5" />
                    <h3 className="text-xs font-semibold text-[#2e2e2e] mb-1 font-sans">ProRes Preview Unsupported in Browser</h3>
                    <p className="text-[10px] text-[#6c757d] max-w-xs leading-relaxed font-sans">
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
                    className="max-h-[280px] w-auto rounded-[4px] shadow-2xl border border-white/5 bg-black"
                  />
                )}

                {videoDetails && (
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[11px] text-slate-500 font-mono">
                    <span className="px-2 py-0.5 rounded-[3px] bg-slate-100 border border-[#ced4da] font-bold uppercase text-[#5bb75b]">
                      {videoDetails.codec || 'h264'}
                    </span>
                    <span className="px-2 py-0.5 rounded-[3px] bg-slate-100 border border-[#ced4da]">
                      {videoDetails.width}x{videoDetails.height}
                    </span>
                    <span className="px-2 py-0.5 rounded-[3px] bg-slate-100 border border-[#ced4da]">
                      {videoDetails.fps} FPS
                    </span>
                    <span className="px-2 py-0.5 rounded-[3px] bg-slate-100 border border-[#ced4da]">
                      {videoDetails.duration}s Duration
                    </span>
                    {videoDetails.fileSize && (
                      <span className="px-2 py-0.5 rounded-[3px] bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
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

