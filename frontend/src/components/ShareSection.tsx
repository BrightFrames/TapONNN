import { Button } from "@/components/ui/button";
import { Instagram, Youtube, Music, QrCode, Sparkles } from "lucide-react";

const ShareSection = () => {
  const cards = [
    { icon: Instagram, color: "bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500", label: "Instagram" },
    { icon: Youtube, color: "bg-red-600", label: "YouTube" },
    { icon: Music, color: "bg-gradient-to-br from-pink-600 to-purple-600", label: "TikTok" },
    { icon: QrCode, color: "bg-gray-600", label: "QR Code" },
  ];

  return (
    <section className="bg-white py-32 px-4 overflow-hidden relative">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

      {/* Ambient background glow */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-pink-100/50 to-purple-100/50 blur-[100px] rounded-full pointer-events-none mix-blend-multiply" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left - Content */}
          <div className="space-y-10">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] text-zinc-900 tracking-tight">
              Share your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 italic pr-2">TapONN</span>
              <br />
              anywhere you like!
            </h2>

            <p className="text-xl text-zinc-600 max-w-lg leading-relaxed font-medium">
              Add your unique TapONN URL to all the platforms and places you find your
              audience. Then use your QR code to drive your offline traffic back to your
              link in bio.
            </p>

            <Button size="lg" className="rounded-full px-10 h-16 text-lg font-bold bg-zinc-900 text-white hover:bg-zinc-800 hover:scale-105 transition-all shadow-xl hover:shadow-2xl">
              Get started for free
            </Button>
          </div>

          {/* Right - Cards Stack */}
          <div className="relative h-[600px] w-full flex items-center justify-center">
            {/* Glow behind cards */}
            <div className="absolute w-[400px] h-[400px] bg-gradient-to-tr from-pink-500/20 to-orange-500/20 blur-[80px] rounded-full animate-pulse-slow" />

            <div className="relative w-[320px] h-[450px]">
              {cards.map((card, i) => (
                <div
                  key={i}
                  className={`absolute top-0 left-0 w-full h-full rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center transition-all duration-500 hover:-translate-y-4 hover:rotate-0 border-4 border-white`}
                  style={{
                    zIndex: cards.length - i,
                    transform: `rotate(${i * 5 - 5}deg) translateY(${i * 10}px)`,
                    background: i === 0 ? 'linear-gradient(135deg, #FF0055 0%, #FF3366 50%, #FF9933 100%)' : 'white',
                  }}
                >
                  {/* Card Content */}
                  <div className={`p-6 rounded-3xl ${i === 0 ? 'bg-white/20 backdrop-blur-sm' : 'bg-zinc-100'} mb-8`}>
                    <card.icon className={`w-16 h-16 ${i === 0 ? 'text-white' : 'text-zinc-400'}`} />
                  </div>

                  {/* Dots decoration */}
                  <div className="flex gap-2">
                    <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-white/50' : 'bg-zinc-200'}`} />
                    <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-white/50' : 'bg-zinc-200'}`} />
                    <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-white/50' : 'bg-zinc-200'}`} />
                  </div>

                  {i === 0 && (
                    <div className="absolute bottom-8 left-8 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Username Pill */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-xl shadow-zinc-200/50 flex items-center gap-3 border border-zinc-100 animate-float z-20">
              <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-white text-xs">
                <Sparkles className="w-3 h-3" />
              </div>
              <span className="font-semibold text-zinc-900">/yourname</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShareSection;
