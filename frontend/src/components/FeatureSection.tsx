import { Button } from "@/components/ui/button";
import { Palette, BarChart3, Zap, Globe } from "lucide-react";

const FeatureSection = () => {
  return (
    <section className="bg-zinc-950 py-32 px-4 overflow-hidden border-t border-zinc-900 relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Mockup */}
          <div className="relative h-[600px] order-2 lg:order-1 w-full max-w-[400px] mx-auto lg:max-w-none scale-90 sm:scale-100 flex items-center justify-center">

            {/* Phone Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 blur-3xl rounded-full opacity-60 scale-90" />

            {/* Main phone mockup */}
            <div className="relative w-72 h-[500px] bg-zinc-900 rounded-[3rem] shadow-2xl overflow-hidden animate-float border-8 border-zinc-800 z-10 ring-1 ring-white/10">
              <div className="p-6 space-y-6">
                <div className="flex flex-col items-center gap-4 mt-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg ring-4 ring-zinc-800" />
                  <span className="text-white font-bold text-xl tracking-wide">BILLIE</span>
                </div>

                <div className="space-y-3 mt-6">
                  <div className="w-full py-4 px-5 bg-zinc-800/80 backdrop-blur-sm rounded-2xl flex items-center gap-4 hover:bg-zinc-800 transition-colors border border-white/5">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs">📚</div>
                    <span className="text-zinc-200 text-sm font-medium">Fall reading list</span>
                  </div>
                  <div className="w-full py-4 px-5 bg-zinc-800/80 backdrop-blur-sm rounded-2xl flex items-center gap-4 hover:bg-zinc-800 transition-colors border border-white/5">
                    <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center text-white text-xs">💓</div>
                    <span className="text-zinc-200 text-sm font-medium">Swell report</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating video card */}
            <div className="absolute bottom-20 -left-6 w-48 h-36 bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden animate-float-slow hidden sm:block border border-white/10 p-1">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 relative overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center pl-1 group-hover:scale-110 transition-transform">
                    <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="text-white/90 text-xs font-bold drop-shadow-md">June on film</span>
                </div>
              </div>
            </div>

            {/* Floating social icons */}
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
              {[
                { icon: "🎵", color: "bg-[#1DB954]" },
                { icon: "▶️", color: "bg-[#FF0000]" },
                { icon: "📊", color: "bg-[#FF9900]" },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-2xl shadow-xl hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-pointer border-4 border-zinc-950`}
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  {item.icon}
                </div>
              ))}
            </div>
          </div>

          {/* Right - Content */}
          <div className="space-y-10 order-1 lg:order-2">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-white tracking-tight">
              Create and customize your TapONN <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">in minutes</span>
            </h2>

            <p className="text-xl text-zinc-400 max-w-lg leading-relaxed font-medium">
              Connect all your content across social media, websites, stores and more in
              one link in bio. Customize every detail or let TapONN automatically enhance
              it to match your brand.
            </p>

            <Button size="lg" className="rounded-full px-8 h-14 text-lg font-bold bg-white text-black hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]">
              Get started for free
            </Button>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 pt-4">
              {[
                { icon: Palette, label: "Custom themes" },
                { icon: BarChart3, label: "Analytics" },
                { icon: Zap, label: "Fast setup" },
                { icon: Globe, label: "Custom domains" },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-4 text-zinc-300">
                  <div className="w-12 h-12 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center group-hover:border-purple-500/50 transition-colors">
                    <feature.icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="font-semibold text-lg">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
