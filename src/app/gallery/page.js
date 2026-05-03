"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function GalleryPage() {
  const [edits, setEdits] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);

  // Load from localStorage
 useEffect(() => {
  const saved = localStorage.getItem("glamai-gallery");
  if (saved) {
    const parsed = JSON.parse(saved);
    setEdits(parsed);
  }
}, []);
  

  const filtered = activeTab === "all"
    ? edits
    : edits.filter(e => e.type === activeTab);

  const handleDelete = (id) => {
    const updated = edits.filter(e => e.id !== id);
    setEdits(updated);
    localStorage.setItem("glamai-gallery", JSON.stringify(updated));
    setSelectedItem(null);
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white pb-24">

      {/* Header */}
      <div className="px-5 pt-10 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              My <span className="text-[#FFD700]">Gallery</span>
            </h1>
            <p className="text-gray-400 text-xs mt-1">
              {edits.length} edits saved
            </p>
          </div>
          <Link href="/editor">
            <button className="bg-[#FFD700] text-black text-xs 
              font-bold px-3 py-2 rounded-full">
              + New Edit
            </button>
          </Link>
        </div>
      </div>

      {/* Tab Filter */}
      <div className="flex mx-5 bg-[#1A1A1A] rounded-xl p-1 mb-5">
        {["all", "photo", "video"].map((tab) => (
          <button key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold 
              capitalize transition-all ${activeTab === tab
                ? "bg-[#FFD700] text-black"
                : "text-gray-400"}`}>
            {tab === "all" ? "🗂️ All" : tab === "photo" ? "📸 Photos" : "🎬 Videos"}
          </button>
        ))}
      </div>

      {/* Stats Row */}
      <div className="flex gap-3 px-5 mb-5">
        {[
          { label: "Total Edits", value: edits.length, icon: "✨" },
          { label: "Photos", value: edits.filter(e => e.type === "photo").length, icon: "📸" },
          { label: "Videos", value: edits.filter(e => e.type === "video").length, icon: "🎬" },
        ].map((stat) => (
          <div key={stat.label}
            className="flex-1 bg-[#1A1A1A] rounded-2xl p-3 
              border border-[#2A2A2A] text-center">
            <div className="text-lg">{stat.icon}</div>
            <div className="text-white font-bold text-lg">{stat.value}</div>
            <div className="text-gray-500 text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="mx-5 bg-[#1A1A1A] rounded-2xl p-10 
          flex flex-col items-center border border-[#2A2A2A]">
          <div className="text-5xl mb-3">🎨</div>
          <p className="text-gray-400 text-sm">No edits yet</p>
          <p className="text-gray-600 text-xs mt-1 mb-4">
            Start editing to see history here
          </p>
          <Link href="/editor">
            <button className="bg-[#FFD700] text-black text-xs 
              font-bold px-4 py-2 rounded-full">
              Start Editing
            </button>
          </Link>
        </div>
      ) : (
        <div className="px-5 grid grid-cols-2 gap-3">
          {filtered.map((item) => (
            <div key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-[#1A1A1A] rounded-2xl overflow-hidden 
                border border-[#2A2A2A] hover:border-[#FFD700] 
                transition-all cursor-pointer">

              {/* Thumbnail */}
<div className="h-32 bg-[#222] relative overflow-hidden rounded-t-2xl">
  {item.thumbnail ? (
    <img 
      src={item.thumbnail} 
      alt="edit preview"
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full bg-gradient-to-br 
      from-[#FFD700]/20 to-[#FF69B4]/20 
      flex items-center justify-center">
      <span className="text-4xl">
        {item.type === "photo" ? "📸" : "🎬"}
      </span>
    </div>
  )}
  <div className="absolute top-2 right-2 bg-black/60 
    px-2 py-0.5 rounded-full">
    <span className="text-xs text-[#FFD700]">{item.filter}</span>
  </div>
</div>

              {/* Info */}
              <div className="p-3">
                <p className="text-white text-xs font-semibold capitalize">
                  {item.type} Edit
                </p>
                <p className="text-gray-500 text-xs mt-1">{item.date}</p>
                <p className="text-gray-600 text-xs">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end"
          onClick={() => setSelectedItem(null)}>
          <div className="w-full max-w-[390px] mx-auto bg-[#1A1A1A] 
            rounded-t-3xl p-5"
            onClick={(e) => e.stopPropagation()}>

            {/* Handle */}
            <div className="w-10 h-1 bg-[#333] rounded-full mx-auto mb-4" />

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] 
                to-[#FF69B4] rounded-xl flex items-center justify-center text-xl">
                {selectedItem.type === "photo" ? "📸" : "🎬"}
              </div>
              <div>
                <p className="text-white font-semibold capitalize">
                  {selectedItem.type} Edit
                </p>
                <p className="text-gray-400 text-xs">
                  Filter: {selectedItem.filter}
                </p>
                <p className="text-gray-500 text-xs">
                  {selectedItem.date} • {selectedItem.time}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              
<Link href={`/editor?editId=${selectedItem.id}`}>
  <button className="w-full bg-[#FFD700] text-black 
    font-semibold text-sm py-3 rounded-xl">
    ✏️ Edit Again
  </button>
</Link>
              <button
                onClick={() => handleDelete(selectedItem.id)}
                className="w-full bg-red-900/30 text-red-400 
                  font-semibold text-sm py-3 rounded-xl border 
                  border-red-900/50">
                🗑️ Delete
              </button>
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              className="w-full mt-3 text-gray-500 text-sm py-2">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 
        w-full max-w-[390px] bg-[#111111] border-t 
        border-[#2A2A2A] px-6 py-3">
        <div className="flex justify-around items-center">
          <Link href="/">
            <div className="flex flex-col items-center">
              <span className="text-xl">🏠</span>
              <span className="text-gray-400 text-xs mt-1">Home</span>
            </div>
          </Link>
          <Link href="/editor">
            <div className="flex flex-col items-center">
              <span className="text-xl">✨</span>
              <span className="text-gray-400 text-xs mt-1">Editor</span>
            </div>
          </Link>
          <Link href="/gallery">
            <div className="flex flex-col items-center">
              <span className="text-xl">🗂️</span>
              <span className="text-[#FFD700] text-xs mt-1">Gallery</span>
            </div>
          </Link>
        </div>
      </div>

    </main>
  );
}