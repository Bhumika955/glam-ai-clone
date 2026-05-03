import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white pb-20">

      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Glam <span className="text-[#FFD700]">AI</span>
            </h1>
            <p className="text-gray-400 text-sm">Your AI Creative Studio</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#FFD700] 
            flex items-center justify-center">
            <span className="text-black font-bold">B</span>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="mx-5 rounded-2xl bg-gradient-to-r 
        from-[#FFD700] to-[#FF69B4] p-5 mb-6">
        <p className="text-black text-xs font-semibold mb-1">✨ AI POWERED</p>
        <h2 className="text-black text-xl font-bold mb-2">
          Transform Your Photos & Videos
        </h2>
        <p className="text-black/70 text-sm mb-4">
          One-tap beauty filters, background removal & more
        </p>
        <Link href="/editor">
          <button className="bg-black text-white px-4 py-2 
            rounded-full text-sm font-semibold">
            Start Editing →
          </button>
        </Link>
      </div>

      {/* Feature Cards */}
      <div className="px-5 mb-6">
        <h3 className="text-white font-semibold mb-3">AI Features</h3>
        <div className="grid grid-cols-2 gap-3">

          <Link href="/editor?tool=photo">
            <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-[#2A2A2A] hover:border-[#FFD700] transition-all">
              <div className="text-2xl mb-2">📸</div>
              <p className="text-white text-sm font-semibold">Photo Editor</p>
              <p className="text-gray-400 text-xs mt-1">Beauty filters & retouching</p>
            </div>
          </Link>

          <Link href="/editor?tool=video">
            <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-[#2A2A2A] hover:border-[#FFD700] transition-all">
              <div className="text-2xl mb-2">🎬</div>
              <p className="text-white text-sm font-semibold">Video Editor</p>
              <p className="text-gray-400 text-xs mt-1">Trim, effects & export</p>
            </div>
          </Link>

          <Link href="/editor?tool=bg">
            <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-[#2A2A2A] hover:border-[#FFD700] transition-all">
              <div className="text-2xl mb-2">🖼️</div>
              <p className="text-white text-sm font-semibold">Background AI</p>
              <p className="text-gray-400 text-xs mt-1">Remove & replace BG</p>
            </div>
          </Link>

          <Link href="/gallery">
            <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-[#2A2A2A] hover:border-[#FFD700] transition-all">
              <div className="text-2xl mb-2">🗂️</div>
              <p className="text-white text-sm font-semibold">Gallery</p>
              <p className="text-gray-400 text-xs mt-1">Editing history</p>
            </div>
          </Link>

        </div>
      </div>

      {/* Recent Edits */}
      <div className="px-5">
        <h3 className="text-white font-semibold mb-3">Recent Edits</h3>
        <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-[#2A2A2A] 
          flex flex-col items-center justify-center text-center">
          <div className="text-4xl mb-3">🎨</div>
          <p className="text-gray-400 text-sm">No edits yet</p>
          <p className="text-gray-600 text-xs mt-1">
            Start editing to see your history here
          </p>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 
        w-full max-w-[390px] bg-[#111111] border-t border-[#2A2A2A] px-6 py-3">
        <div className="flex justify-around items-center">
          <Link href="/">
            <div className="flex flex-col items-center">
              <span className="text-xl">🏠</span>
              <span className="text-[#FFD700] text-xs mt-1">Home</span>
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
              <span className="text-gray-400 text-xs mt-1">Gallery</span>
            </div>
          </Link>
        </div>
      </div>

    </main>
  );
}