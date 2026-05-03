"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function EditorPage() {
  const [activeTab, setActiveTab] = useState("photo");
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(10);
  const [videoDuration, setVideoDuration] = useState(10);
  const [processing, setProcessing] = useState(false);
  const [trimmedVideo, setTrimmedVideo] = useState(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [activeEffect, setActiveEffect] = useState("none");
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
  });
  const [activeFilter, setActiveFilter] = useState("none");

  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const videoRef = useRef(null);
  const ffmpegRef = useRef(null);

  const beautyFilters = [
    { name: "None", value: "none", style: {} },
    { name: "Glow", value: "glow", style: { filter: "brightness(1.2) contrast(1.1) saturate(1.3)" } },
    { name: "Soft", value: "soft", style: { filter: "brightness(1.1) blur(0.5px) saturate(0.9)" } },
    { name: "Vivid", value: "vivid", style: { filter: "saturate(1.8) contrast(1.2)" } },
    { name: "Cool", value: "cool", style: { filter: "hue-rotate(30deg) saturate(1.2)" } },
    { name: "Warm", value: "warm", style: { filter: "sepia(0.3) saturate(1.4) brightness(1.1)" } },
    { name: "Drama", value: "drama", style: { filter: "contrast(1.5) brightness(0.9) saturate(1.3)" } },
    { name: "B&W", value: "bw", style: { filter: "grayscale(1) contrast(1.2)" } },
  ];

  const videoEffects = [
    { name: "None", value: "none", style: {} },
    { name: "Warm", value: "warm", style: { filter: "sepia(0.4) saturate(1.3)" } },
    { name: "Cool", value: "cool", style: { filter: "hue-rotate(30deg)" } },
    { name: "Drama", value: "drama", style: { filter: "contrast(1.5) brightness(0.85)" } },
    { name: "B&W", value: "bw", style: { filter: "grayscale(1)" } },
    { name: "Vivid", value: "vivid", style: { filter: "saturate(2) contrast(1.1)" } },
  ];

  const searchParams = useSearchParams();

  useEffect(() => {
    const editId = searchParams.get("editId");
    if (editId) {
      const gallery = JSON.parse(localStorage.getItem("glamai-gallery") || "[]");
      const item = gallery.find(g => g.id === Number(editId));
      if (item?.imageData) {
        setImage(item.imageData);
        setActiveFilter(item.filter);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const { FFmpeg } = await import("@ffmpeg/ffmpeg");
        const { toBlobURL } = await import("@ffmpeg/util");
        const ffmpeg = new FFmpeg();
        await ffmpeg.load({
          coreURL: await toBlobURL(
            "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
            "text/javascript"
          ),
          wasmURL: await toBlobURL(
            "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm",
            "application/wasm"
          ),
        });
        ffmpegRef.current = ffmpeg;
        setFfmpegLoaded(true);
      } catch (err) {
        console.log("FFmpeg load error:", err);
      }
    };
    loadFFmpeg();
  }, []);

  const getFilterStyle = () => {
    const selected = beautyFilters.find(f => f.value === activeFilter);
    if (selected && selected.style.filter) return { filter: selected.style.filter };
    return {
      filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px)`
    };
  };

  const getVideoEffectStyle = () => {
    const selected = videoEffects.find(f => f.value === activeEffect);
    return selected?.style || {};
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideo(URL.createObjectURL(file));
      setTrimmedVideo(null);
    }
  };

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      const dur = Math.floor(videoRef.current.duration);
      setVideoDuration(dur);
      setTrimEnd(dur);
    }
  };

  const saveToGallery = (imageDataUrl, filterName) => {
    try {
      const existing = JSON.parse(localStorage.getItem("glamai-gallery") || "[]");
      const newItem = {
        id: Date.now(),
        type: "photo",
        filter: filterName || "none",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        thumbnail: imageDataUrl,
        imageData: imageDataUrl,
      };
      const updated = [newItem, ...existing].slice(0, 20);
      localStorage.setItem("glamai-gallery", JSON.stringify(updated));
    } catch (err) {
      console.log("Gallery save error:", err);
    }
  };

  const handleDownload = () => {
    if (!image) return;
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.src = image;
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.filter = getFilterStyle().filter || "none";
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      saveToGallery(dataUrl, activeFilter);
      const link = document.createElement("a");
      link.download = "glam-ai-edited.png";
      link.href = dataUrl;
      link.click();
      alert("✅ Saved to Gallery!");
    };
  };

  const handleTrim = async () => {
    if (trimStart >= trimEnd) {
      alert("⚠️ Start point must be less than End point!");
      return;
    }
    if (!videoFile || !ffmpegLoaded || !ffmpegRef.current) {
      alert("Video processor loading... please wait!");
      return;
    }
    setProcessing(true);
    try {
      const { fetchFile } = await import("@ffmpeg/util");
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));
      await ffmpeg.exec([
        "-i", "input.mp4",
        "-ss", String(trimStart),
        "-to", String(trimEnd),
        "-c", "copy",
        "output.mp4"
      ]);
      const data = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([data.buffer], { type: "video/mp4" });
      setTrimmedVideo(URL.createObjectURL(blob));
    } catch (err) {
      alert("Trim failed: " + err.message);
    }
    setProcessing(false);
  };

  const handleVideoDownload = () => {
    if (!trimmedVideo) {
      alert("⚠️ Please trim video first!");
      return;
    }
    // Video thumbnail generate karo
  const videoEl = document.createElement("video");
  videoEl.src = video;
  videoEl.currentTime = 0.1;
  videoEl.muted = true;
  videoEl.crossOrigin = "anonymous";
videoEl.preload = "metadata";
  videoEl.onloadeddata = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoEl.videoWidth || 320;
    canvas.height = videoEl.videoHeight || 180;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    const thumbnail = canvas.toDataURL("image/png");
    try {
      const existing = JSON.parse(localStorage.getItem("glamai-gallery") || "[]");
      const newItem = {
        id: Date.now(),
        type: "video",
        filter: activeEffect || "none",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        thumbnail: thumbnail,
        imageData: null,
      };
      const updated = [newItem, ...existing].slice(0, 20);
      localStorage.setItem("glamai-gallery", JSON.stringify(updated));
    } catch (err) {
      console.log("Gallery save error:", err);
    }
    const a = document.createElement("a");
    a.href = trimmedVideo;
    a.download = "glam-ai-trimmed.mp4";
    a.click();
    alert("✅ Video saved to Gallery!");
  };
// Fallback agar thumbnail na bane
  videoEl.onerror = () => {
    try {
      const existing = JSON.parse(
        localStorage.getItem("glamai-gallery") || "[]"
      );
      const newItem = {
        id: Date.now(),
        type: "video",
        filter: activeEffect || "none",
        date: new Date().toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric"
        }),
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit", minute: "2-digit"
        }),
        thumbnail: null,
        imageData: null,
      };
      const updated = [newItem, ...existing].slice(0, 20);
      localStorage.setItem("glamai-gallery", JSON.stringify(updated));
    } catch (err) {
      console.log("Gallery save error:", err);
    }
    const a = document.createElement("a");
    a.href = trimmedVideo;
    a.download = "glam-ai-trimmed.mp4";
    a.click();
    alert("✅ Video saved to Gallery!");
  };

  videoEl.load();
};
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white pb-24">

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-4">
        <Link href="/"><button className="text-gray-400 text-sm">← Back</button></Link>
        <h1 className="text-white font-bold text-lg">Glam <span className="text-[#FFD700]">Editor</span></h1>
        <button
          onClick={activeTab === "photo" ? handleDownload : handleVideoDownload}
          className="bg-[#FFD700] text-black text-xs font-bold px-3 py-1.5 rounded-full">
          Export
        </button>
      </div>

      {/* Tab Switch */}
      <div className="flex mx-5 bg-[#1A1A1A] rounded-xl p-1 mb-4">
        <button onClick={() => setActiveTab("photo")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "photo" ? "bg-[#FFD700] text-black" : "text-gray-400"}`}>
          📸 Photo
        </button>
        <button onClick={() => setActiveTab("video")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "video" ? "bg-[#FFD700] text-black" : "text-gray-400"}`}>
          🎬 Video
        </button>
      </div>

      {/* PHOTO TAB */}
      {activeTab === "photo" && (
        <div>
          <div className="mx-5 mb-4">
            {!image ? (
              <div onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-[#333] rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-[#FFD700] transition-all">
                <div className="text-4xl mb-3">📸</div>
                <p className="text-gray-400 text-sm">Tap to upload photo</p>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden h-64">
                <img id="preview-image" src={image} alt="preview"
                  className="w-full h-full object-cover" style={getFilterStyle()} />
                <button onClick={() => setImage(null)}
                  className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                  Change
                </button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          {/* Beauty Filters */}
          <div className="px-5 mb-4">
            <p className="text-white text-sm font-semibold mb-3">✨ Beauty Filters</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {beautyFilters.map((f) => (
                <button key={f.value} onClick={() => setActiveFilter(f.value)} className="flex-shrink-0 flex flex-col items-center gap-1">
                  <div className={`w-14 h-14 rounded-xl border-2 transition-all bg-gradient-to-br from-[#FFD700] to-[#FF69B4] ${activeFilter === f.value ? "border-[#FFD700] scale-110" : "border-[#333]"}`} style={f.style} />
                  <span className="text-xs text-gray-400">{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Adjustments */}
          <div className="px-5 mb-4">
            <p className="text-white text-sm font-semibold mb-3">🎛️ Adjustments</p>
            <div className="bg-[#1A1A1A] rounded-2xl p-4 space-y-4">
              {[
                { label: "☀️ Brightness", key: "brightness", min: 50, max: 200 },
                { label: "🔲 Contrast", key: "contrast", min: 50, max: 200 },
                { label: "🎨 Saturation", key: "saturation", min: 0, max: 200 },
                { label: "💧 Blur", key: "blur", min: 0, max: 10 },
              ].map((item) => (
                <div key={item.key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400 text-xs">{item.label}</span>
                    <span className="text-[#FFD700] text-xs">{filters[item.key]}</span>
                  </div>
                  <input type="range" min={item.min} max={item.max} value={filters[item.key]}
                    onChange={(e) => { setActiveFilter("none"); setFilters(prev => ({ ...prev, [item.key]: Number(e.target.value) })); }}
                    className="w-full accent-[#FFD700]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIDEO TAB */}
      {activeTab === "video" && (
        <div className="px-5">
          <div className={`mb-3 px-3 py-2 rounded-xl text-xs text-center ${ffmpegLoaded ? "bg-green-900/30 text-green-400" : "bg-yellow-900/30 text-yellow-400"}`}>
            {ffmpegLoaded ? "✅ Video processor ready!" : "⏳ Loading video processor..."}
          </div>

          {!video ? (
            <div onClick={() => videoInputRef.current.click()}
              className="border-2 border-dashed border-[#333] rounded-2xl h-56 flex flex-col items-center justify-center cursor-pointer hover:border-[#FFD700] transition-all mb-4">
              <div className="text-4xl mb-3">🎬</div>
              <p className="text-gray-400 text-sm">Tap to upload video</p>
              <p className="text-gray-600 text-xs mt-1">MP4, MOV supported</p>
            </div>
          ) : (
            <div className="mb-4">
              <div className="rounded-2xl overflow-hidden" style={getVideoEffectStyle()}>
                <video ref={videoRef} src={trimmedVideo || video} controls
                  className="w-full rounded-2xl" onLoadedMetadata={handleVideoLoaded} />
              </div>
              <button onClick={() => { setVideo(null); setTrimmedVideo(null); }}
                className="mt-2 text-gray-500 text-xs">Change video</button>
            </div>
          )}
          <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />

          {video && (
            <>
              <div className="mb-4">
                <p className="text-white text-sm font-semibold mb-3">⚡ Video Effects</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {videoEffects.map((ef) => (
                    <button key={ef.value} onClick={() => setActiveEffect(ef.value)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                        ${activeEffect === ef.value ? "bg-[#FFD700] text-black border-[#FFD700]" : "text-gray-400 border-[#333]"}`}>
                      {ef.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#1A1A1A] rounded-2xl p-4 mb-4">
                <p className="text-white text-sm font-semibold mb-3">✂️ Trim Video</p>
                <div className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400 text-xs">Start: {trimStart}s</span>
                    <span className="text-gray-400 text-xs">End: {trimEnd}s</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Start point</p>
                      <input type="range" min={0} max={videoDuration - 1}
                        value={trimStart}
                        onChange={(e) => setTrimStart(Number(e.target.value))}
                        className="w-full accent-[#FFD700]" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">End point</p>
                      <input type="range" min={1} max={videoDuration}
                        value={trimEnd}
                        onChange={(e) => setTrimEnd(Number(e.target.value))}
                        className="w-full accent-[#FFD700]" />
                    </div>
                  </div>
                  <p className="text-[#FFD700] text-xs mt-2 text-center">
                    Duration: {trimEnd - trimStart}s
                  </p>
                </div>

                <button onClick={handleTrim} disabled={processing}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all
                    ${processing ? "bg-gray-700 text-gray-400" : "bg-[#FFD700] text-black"}`}>
                  {processing ? "⏳ Processing..." : "✂️ Trim Video"}
                </button>

                {trimmedVideo && (
                  <div className="mt-3 p-3 bg-green-900/20 rounded-xl text-center">
                    <p className="text-green-400 text-xs mb-2">✅ Video trimmed successfully!</p>
                    <button onClick={handleVideoDownload}
                      className="bg-green-500 text-white text-xs px-4 py-2 rounded-full font-semibold">
                      ⬇️ Download & Save to Gallery
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-[#111111] border-t border-[#2A2A2A] px-6 py-3">
        <div className="flex justify-around items-center">
          <Link href="/"><div className="flex flex-col items-center"><span className="text-xl">🏠</span><span className="text-gray-400 text-xs mt-1">Home</span></div></Link>
          <Link href="/editor"><div className="flex flex-col items-center"><span className="text-xl">✨</span><span className="text-[#FFD700] text-xs mt-1">Editor</span></div></Link>
          <Link href="/gallery"><div className="flex flex-col items-center"><span className="text-xl">🗂️</span><span className="text-gray-400 text-xs mt-1">Gallery</span></div></Link>
        </div>
      </div>

    </main>
  );
}