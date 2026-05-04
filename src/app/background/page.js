"use client";
import { useState, useRef } from "react";
import Link from "next/link";

export default function BackgroundPage() {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("remove");
  const [bgColor, setBgColor] = useState("#FFD700");
  const [bgImage, setBgImage] = useState(null);
  const fileInputRef = useRef(null);
  const bgFileInputRef = useRef(null);

  const bgColors = [
    "#FFD700", "#FF69B4", "#9B59B6", "#3498DB",
    "#2ECC71", "#E74C3C", "#1A1A1A", "#FFFFFF",
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target.result);
    reader.readAsDataURL(file);
    setResultImage(null);
  };

  const handleBgImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBgImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeBackground = async () => {
    if (!imageFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image_file", imageFile);
      formData.append("size", "auto");

      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": process.env.NEXT_PUBLIC_REMOVEBG_API_KEY,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("API failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResultImage(url);
      setActiveTab("replace");
    } catch (err) {
      alert("Background removal failed: " + err.message);
    }
    setLoading(false);
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.src = resultImage;
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");

      // Draw background
      if (activeTab === "image" && bgImage) {
        const bg = new Image();
        bg.src = bgImage;
        bg.onload = () => {
          ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          download(canvas);
        };
      } else {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        download(canvas);
      }
    };
  };

  const download = (canvas) => {
    // Save to gallery
    const dataUrl = canvas.toDataURL("image/png");
    try {
      const existing = JSON.parse(localStorage.getItem("glamai-gallery") || "[]");
      const newItem = {
        id: Date.now(),
        type: "photo",
        filter: "BG Removed",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        thumbnail: dataUrl,
        imageData: dataUrl,
      };
      localStorage.setItem("glamai-gallery", JSON.stringify([newItem, ...existing].slice(0, 20)));
    } catch (err) { }

    const link = document.createElement("a");
    link.download = "glam-ai-bg-removed.png";
    link.href = dataUrl;
    link.click();
    alert("✅ Saved to Gallery!");
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white pb-24">

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-4">
        <Link href="/"><button className="text-gray-400 text-sm">← Back</button></Link>
        <h1 className="text-white font-bold text-lg">
          BG <span className="text-[#FFD700]">Remover</span>
        </h1>
        <button onClick={handleDownload}
          disabled={!resultImage}
          className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all
            ${resultImage ? "bg-[#FFD700] text-black" : "bg-[#333] text-gray-600"}`}>
          Export
        </button>
      </div>

      {/* Upload Area */}
      <div className="mx-5 mb-4">
        {!image ? (
          <div onClick={() => fileInputRef.current.click()}
            className="border-2 border-dashed border-[#333] rounded-2xl h-64
              flex flex-col items-center justify-center cursor-pointer
              hover:border-[#FFD700] transition-all">
            <div className="text-4xl mb-3">🖼️</div>
            <p className="text-gray-400 text-sm">Tap to upload photo</p>
            <p className="text-gray-600 text-xs mt-1">JPG, PNG supported</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {/* Original */}
            <div className="rounded-2xl overflow-hidden">
              <p className="text-gray-500 text-xs mb-1 text-center">Original</p>
              <img src={image} alt="original"
                className="w-full h-40 object-cover rounded-2xl" />
            </div>
            {/* Result */}
<div className="rounded-2xl overflow-hidden">
  <p className="text-gray-500 text-xs mb-1 text-center">Result</p>
  {resultImage ? (
    <div className="w-full h-40 rounded-2xl overflow-hidden relative"
      style={{ 
        backgroundColor: activeTab === "image" ? "transparent" : bgColor 
      }}>
      {/* Image BG */}
      {activeTab === "image" && bgImage && (
        <img src={bgImage} alt="bg"
          className="absolute inset-0 w-full h-full object-cover" />
      )}
      {/* Color BG already applied via backgroundColor above */}
      {/* Subject image */}
      <img src={resultImage} alt="result"
        className="absolute inset-0 w-full h-full object-contain" />
    </div>
  ) : (
    <div className="w-full h-40 bg-[#1A1A1A] rounded-2xl
      flex items-center justify-center border border-[#2A2A2A]">
      <span className="text-gray-600 text-xs">
        {loading ? "Processing..." : "Result here"}
      </span>
    </div>
  )}
</div>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*"
          className="hidden" onChange={handleImageUpload} />
      </div>

      {/* Remove BG Button */}
      {image && !resultImage && (
        <div className="mx-5 mb-4">
          <button onClick={removeBackground} disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all
              ${loading
                ? "bg-gray-700 text-gray-400"
                : "bg-gradient-to-r from-[#FFD700] to-[#FF69B4] text-black"
              }`}>
            {loading ? "⏳ Removing Background..." : "✨ Remove Background"}
          </button>
        </div>
      )}

      {/* Change Image */}
      {image && (
        <div className="mx-5 mb-4 text-center">
          <button onClick={() => { setImage(null); setResultImage(null); }}
            className="text-gray-500 text-xs">
            Change image
          </button>
        </div>
      )}

      {/* BG Replace Options */}
      {resultImage && (
        <div className="px-5">
          {/* Tab */}
          <div className="flex bg-[#1A1A1A] rounded-xl p-1 mb-4">
            <button onClick={() => setActiveTab("replace")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all
                ${activeTab === "replace" ? "bg-[#FFD700] text-black" : "text-gray-400"}`}>
              🎨 Color BG
            </button>
            <button onClick={() => setActiveTab("image")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all
                ${activeTab === "image" ? "bg-[#FFD700] text-black" : "text-gray-400"}`}>
              🖼️ Image BG
            </button>
          </div>

          {/* Color Picker */}
          {activeTab === "replace" && (
            <div className="bg-[#1A1A1A] rounded-2xl p-4 mb-4">
              <p className="text-white text-sm font-semibold mb-3">
                🎨 Choose Background Color
              </p>
              <div className="flex gap-3 flex-wrap">
                {bgColors.map((color) => (
                  <button key={color} onClick={() => setBgColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all
                      ${bgColor === color ? "border-white scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: color }} />
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-gray-400 text-xs">Custom:</span>
                <input type="color" value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                <span className="text-[#FFD700] text-xs">{bgColor}</span>
              </div>
            </div>
          )}

          {/* Image BG */}
          {activeTab === "image" && (
            <div className="bg-[#1A1A1A] rounded-2xl p-4 mb-4">
              <p className="text-white text-sm font-semibold mb-3">
                🖼️ Upload Background Image
              </p>
              <div onClick={() => bgFileInputRef.current.click()}
                className="border-2 border-dashed border-[#333] rounded-xl p-6
                  flex flex-col items-center cursor-pointer hover:border-[#FFD700] transition-all">
                {bgImage ? (
                  <img src={bgImage} alt="bg" className="w-full h-24 object-cover rounded-xl" />
                ) : (
                  <>
                    <span className="text-3xl mb-2">🌄</span>
                    <p className="text-gray-400 text-xs">Tap to upload background</p>
                  </>
                )}
              </div>
              <input ref={bgFileInputRef} type="file" accept="image/*"
                className="hidden" onChange={handleBgImageUpload} />
            </div>
          )}

          {/* Remove Again */}
          <button onClick={removeBackground} disabled={loading}
            className="w-full py-3 rounded-xl border border-[#333] 
              text-gray-400 text-sm mb-4 hover:border-[#FFD700] transition-all">
            🔄 Try Again
          </button>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2
        w-full max-w-[390px] bg-[#111111] border-t border-[#2A2A2A] px-6 py-3">
        <div className="flex justify-around items-center">
          <Link href="/"><div className="flex flex-col items-center">
            <span className="text-xl">🏠</span>
            <span className="text-gray-400 text-xs mt-1">Home</span>
          </div></Link>
          <Link href="/editor"><div className="flex flex-col items-center">
            <span className="text-xl">✨</span>
            <span className="text-gray-400 text-xs mt-1">Editor</span>
          </div></Link>
          <Link href="/gallery"><div className="flex flex-col items-center">
            <span className="text-xl">🗂️</span>
            <span className="text-gray-400 text-xs mt-1">Gallery</span>
          </div></Link>
        </div>
      </div>

    </main>
  );
}