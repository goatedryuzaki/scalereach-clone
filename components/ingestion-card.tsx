'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useScaleReachStore } from '@/lib/state-store';

const PLATFORM_PATTERNS = [
  { id: 'youtube', name: 'YouTube', regex: /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]+/i },
  { id: 'twitch', name: 'Twitch VOD', regex: /^(https?:\/\/)?(www\.)?twitch\.tv\/videos\/[0-9]+/i },
  { id: 'kick', name: 'Kick', regex: /^(https?:\/\/)?(www\.)?kick\.com\/video\/[a-zA-Z0-9_-]+/i },
  { id: 'loom', name: 'Loom', regex: /^(https?:\/\/)?(www\.)?loom\.com\/share\/[a-zA-Z0-9]+/i },
  { id: 'drive', name: 'Google Drive', regex: /^(https?:\/\/)?drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+/i },
  { id: 'dropbox', name: 'Dropbox', regex: /^(https?:\/\/)?(www\.)?dropbox\.com\/s(cl)?\/[a-zA-Z0-9_-]+/i },
  { id: 'vimeo', name: 'Vimeo', regex: /^(https?:\/\/)?(www\.)?vimeo\.com\/[0-9]+/i },
  { id: 'twitter', name: 'Twitter / X', regex: /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/[0-9]+/i },
  { id: 'tiktok', name: 'TikTok', regex: /^(https?:\/\/)?(www\.)?tiktok\.com\/@[a-zA-Z0-9_.-]+\/video\/[0-9]+/i },
  { id: 'reddit', name: 'Reddit', regex: /^(https?:\/\/)?(www\.)?reddit\.com\/r\/[a-zA-Z0-9_]+\/comments\/[a-zA-Z0-9]+/i },
  { id: 'facebook', name: 'Facebook', regex: /^(https?:\/\/)?(www\.)?facebook\.com\/(watch\/?\?v=[0-9]+|[a-zA-Z0-9.]+\/videos\/[0-9]+)/i },
  { id: 'direct', name: 'Direct MP4/MOV', regex: /^https?:\/\/.+\.(mp4|mov|webm)(\?.*)?$/i },
];

export function IngestionCard() {
  const router = useRouter();
  const { setActiveVideo, addRecentVideo } = useScaleReachStore();

  const [url, setUrl] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    setError(null);

    const match = PLATFORM_PATTERNS.find((p) => p.regex.test(val.trim()));
    setDetectedPlatform(match ? match.name : null);
  };

  const handleSubmitUrl = () => {
    if (!url.trim()) {
      setError('Please paste a valid video URL from one of the supported platforms.');
      return;
    }

    const match = PLATFORM_PATTERNS.find((p) => p.regex.test(url.trim()));
    if (!match) {
      setError('Unsupported URL. Please provide a link from YouTube, Twitch, Kick, Loom, Drive, or direct MP4.');
      return;
    }

    setIsSubmitting(true);
    router.push(`/configure?url=${encodeURIComponent(url.trim())}`);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const validExts = ['.mp4', '.webm', '.mov'];
    const hasValidExt = validExts.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!validTypes.includes(file.type) && !hasValidExt) {
      setError('Invalid file type. Please upload MP4, WebM, or MOV video file.');
      return;
    }

    setSelectedFileName(file.name);
    setError(null);
    setUploadProgress(10);

    // Simulated local fast upload
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          const newVideo = {
            id: `upload-${Date.now()}`,
            title: file.name.replace(/\.[^/.]+$/, ''),
            duration: 240,
            sourceUrl: URL.createObjectURL(file),
            sourceType: 'upload' as const,
            status: 'completed' as const,
            progress: 100,
          };
          setActiveVideo(newVideo);
          addRecentVideo(newVideo);

          setTimeout(() => {
            router.push('/configure');
          }, 400);

          return 100;
        }
        return prev + 30;
      });
    }, 250);
  };

  const handleUseDemoVideo = (sampleUrl: string, sampleTitle: string) => {
    setUrl(sampleUrl);
    setDetectedPlatform('YouTube');
    const newVideo = {
      id: `demo-${Date.now()}`,
      title: sampleTitle,
      duration: 480,
      sourceUrl: sampleUrl,
      sourceType: 'url' as const,
      thumbnailUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=60',
      status: 'completed' as const,
      progress: 100,
    };
    setActiveVideo(newVideo);
    addRecentVideo(newVideo);
    router.push('/configure');
  };

  return (
    <div className="bg-[#13151F] border border-[#24283B] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* URL Input Bar */}
      <div className="mb-6 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Ingest from Video URL
          </label>
          {detectedPlatform && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md animate-fadeIn">
              <CheckCircle2 className="h-3 w-3" />
              <span>{detectedPlatform} Recognized</span>
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <LinkIcon className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={url}
              onChange={handleUrlChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitUrl()}
              placeholder="Paste YouTube, Twitch VOD, Kick, Loom, Drive, or direct MP4 link..."
              className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#090A0F] border border-[#24283B] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={handleSubmitUrl}
            disabled={isSubmitting}
            className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Ingesting...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Clips</span>
                <ArrowRight className="h-4 w-4 ml-0.5" />
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 12-Platform Validation Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[11px] text-slate-400">
          <span className="text-slate-500 font-medium">Platforms:</span>
          {PLATFORM_PATTERNS.map((p) => {
            const isMatch = detectedPlatform === p.name;
            return (
              <span
                key={p.id}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                  isMatch
                    ? 'bg-indigo-500 text-white border border-indigo-400 shadow-sm shadow-indigo-500/30'
                    : 'bg-[#161926] border border-[#24283B] text-slate-400 hover:border-slate-600'
                }`}
              >
                {p.name}
              </span>
            );
          })}
        </div>

        {/* Quick Demo Links */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <span>Try quick demo:</span>
          <button
            type="button"
            onClick={() => handleUseDemoVideo('https://www.youtube.com/watch?v=gCHSEGBp8ME', 'SaaS Growth & Retention Blueprint')}
            className="text-indigo-400 hover:underline hover:text-indigo-300 font-medium transition-colors"
          >
            Podcast Masterclass
          </button>
          <span>&bull;</span>
          <button
            type="button"
            onClick={() => handleUseDemoVideo('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Never Gonna Give You Up - High Energy')}
            className="text-indigo-400 hover:underline hover:text-indigo-300 font-medium transition-colors"
          >
            Music Video
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-6 z-10">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#24283B]" />
        </div>
        <span className="relative px-4 bg-[#13151F] text-xs uppercase tracking-wider text-slate-500 font-bold">
          Or upload local file
        </span>
      </div>

      {/* File Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all relative z-10 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-[#24283B] hover:border-indigo-500/40 bg-[#090A0F]/50 hover:bg-[#090A0F]/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={handleFileInputChange}
        />

        <div className="mx-auto h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-3 shadow-inner">
          {uploadProgress !== null ? (
            <FileVideo className="h-6 w-6 animate-pulse" />
          ) : (
            <Upload className="h-6 w-6" />
          )}
        </div>

        {uploadProgress !== null ? (
          <div className="max-w-md mx-auto">
            <p className="text-sm font-semibold text-white mb-2">
              Ingesting {selectedFileName}... {uploadProgress}%
            </p>
            <div className="w-full h-2 rounded-full bg-[#161926] overflow-hidden border border-[#24283B]">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Extracting audio stream for local Whisper speech-to-text...
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-200 mb-1">
              Drop your video file here, or{' '}
              <span className="text-indigo-400 underline underline-offset-4">browse</span>
            </p>
            <p className="text-xs text-slate-400">
              Supports MP4, WebM, QuickTime MOV up to 5GB (no file size limits in local mode)
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default IngestionCard;
