import { Button } from "@/components/ui/button";
import { Instagram, Youtube, Music, QrCode } from "lucide-react";

const ShareSection = () => {
  const cards = [
    { icon: Instagram, color: "bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500", label: "Instagram" },
    { icon: Youtube, color: "bg-red-600", label: "YouTube" },
    { icon: Music, color: "bg-gradient-to-br from-pink-600 to-purple-600", label: "TikTok" },
    { icon: QrCode, color: "bg-gray-600", label: "QR Code" },
  ];

  return (
    <section className="section-share py-24 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-share-foreground italic">
              Share your Tap2 anywhere you like!
            </h2>

            <p className="text-lg text-share-foreground/80 max-w-lg">
              Add your unique Tap2 URL to all the platforms and places you find your
              audience. Then use your QR code to drive your offline traffic back to your
              link in bio.
            </p>

            <Button variant="share" size="xl">
              Get started for free
            </Button>
          </div>

          {/* Right - Stacked Cards */}
          <div className="relative h-[400px] lg:h-[500px]">
            {cards.map((card, i) => (
              <div
                key={i}
                className={`absolute w-52 h-72 rounded-3xl shadow-2xl overflow-hidden card-stack cursor-pointer ${card.color}`}
                style={{
                  right: `${i * 40}px`,
                  top: `${i * 30}px`,
                  zIndex: cards.length - i,
                  transform: `rotate(${(i - 1) * 5}deg)`,
                }}
              >
                <div className="p-5 h-full flex flex-col">
                  <div className="flex-1 flex items-center justify-center">
                    <card.icon className="w-16 h-16 text-card" />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full" />
                    <div className="flex-1">
                      <div className="h-2 bg-card/50 rounded-full w-3/4 mb-1" />
                      <div className="h-2 bg-card/30 rounded-full w-1/2" />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Username pill */}
            <div className="absolute bottom-10 left-0 bg-card rounded-pill px-5 py-3 shadow-xl flex items-center gap-2">
              <div className="w-6 h-6 bg-hero-foreground rounded-lg flex items-center justify-center">
                <span className="text-hero text-xs font-bold">✦</span>
              </div>
              <span className="font-medium text-foreground">/yourname</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShareSection;
