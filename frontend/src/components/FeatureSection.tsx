import { Button } from "@/components/ui/button";
import { Palette, BarChart3, Zap, Globe } from "lucide-react";

const FeatureSection = () => {
  return (
    <section className="bg-[#0A0A0A] py-24 px-4 overflow-hidden border-t border-zinc-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Mockup */}
          <div className="relative h-[500px] order-2 lg:order-1 w-full max-w-[400px] mx-auto lg:max-w-none scale-90 sm:scale-100">
            {/* Main phone mockup */}
            <div className="absolute left-0 right-0 mx-auto lg:mx-0 lg:left-10 lg:translate-x-0 w-64 h-[450px] bg-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-float border-4 border-zinc-800 z-10">
              <div className="p-5 space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-share-foreground" />
                  <span className="text-white font-bold text-lg italic">BILLIE</span>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="w-full py-3 px-4 bg-zinc-800 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg" />
                    <span className="text-zinc-300 text-sm font-medium">Fall reading list</span>
                  </div>
                  <div className="w-full py-3 px-4 bg-zinc-800 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 bg-feature rounded-lg" />
                    <span className="text-zinc-300 text-sm font-medium">Swell report</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating video card - Hidden on very small screens */}
            <div className="absolute bottom-10 -left-2 lg:left-0 w-40 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-xl overflow-hidden animate-float-slow hidden sm:block">
              <div className="p-3 flex flex-col justify-end h-full">
                <div className="w-10 h-10 bg-card/90 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[8px] border-l-feature border-y-[5px] border-y-transparent ml-1" />
                </div>
                <span className="text-card text-xs font-medium mt-2">June on film</span>
              </div>
            </div>

            {/* Floating social icons - Positioned closer on mobile to avoid cut-off */}
            <div className="absolute right-0 lg:right-20 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-0">
              {[
                { icon: "🎵", color: "bg-green-500" },
                { icon: "▶️", color: "bg-red-500" },
                { icon: "📊", color: "bg-orange-500" },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center text-xl shadow-lg hover:scale-110 transition-transform cursor-pointer`}
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  {item.icon}
                </div>
              ))}
            </div>
          </div>

          {/* Right - Content */}
          <div className="space-y-8 order-1 lg:order-2">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white tracking-tight">
              Create and customize your Tap2 in minutes
            </h2>

            <p className="text-lg text-zinc-400 max-w-lg leading-relaxed">
              Connect all your content across social media, websites, stores and more in
              one link in bio. Customize every detail or let Tap2 automatically enhance
              it to match your brand and drive more clicks.
            </p>

            <Button size="lg" className="rounded-full px-8 h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all">
              Get started for free
            </Button>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-6 pt-8">
              {[
                { icon: Palette, label: "Custom themes" },
                { icon: BarChart3, label: "Analytics" },
                { icon: Zap, label: "Fast setup" },
                { icon: Globe, label: "Custom domains" },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-foreground/80">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{feature.label}</span>
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
