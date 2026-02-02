import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { HeroAurora } from "@/components/ui/hero-aurora";

// Placeholder images in case API fails or is empty, to ensure layout always looks good
const PLACEHOLDERS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1576158187530-98700cee98fc?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519681393798-2f61f2a55db8?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop"
];

const HeroSection = () => {
  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<{ available: boolean; message: string } | null>(null);
  const [heroImages, setHeroImages] = useState<string[]>(PLACEHOLDERS);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  // Fetch products for background
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await axios.get(`${API_URL}/explore/products`);
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const images = res.data.map((p: any) => p.image_url).filter(Boolean);
          if (images.length > 5) {
            // Mix in placeholders to ensure density
            setHeroImages([...images, ...PLACEHOLDERS].sort(() => 0.5 - Math.random()));
          }
        }
      } catch (e) {
        console.error("Failed to fetch hero images", e);
      }
    };
    fetchImages();
  }, [API_URL]);

  // Debounced username check
  useEffect(() => {
    if (!username || username.length < 3) {
      setAvailability(null);
      return;
    }

    setChecking(true);
    const timer = setTimeout(async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/check-username/${username}`);
        setAvailability(response.data);
      } catch (error) {
        console.error("Error checking username:", error);
        setAvailability({ available: false, message: "Error checking availability" });
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, API_URL]);

  const handleGetStarted = () => {
    if (availability?.available) {
      navigate(`/login?username=${username}`);
    }
  };

  // Split images into columns
  const getColumnImages = (colIndex: number, totalCols: number) => {
    return heroImages.filter((_, i) => i % totalCols === colIndex);
  };

  return (
    <HeroAurora className="justify-start pt-28 md:pt-40">
      <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 px-4 opacity-40 pointer-events-none select-none">
        {[0, 1, 2, 3, 4, 5].map((colIndex) => (
          <div key={colIndex} className="relative h-[200vh] -top-[40vh] md:-top-[50vh] flex flex-col gap-4 overflow-hidden">
            {/* Scrolling Container */}
            <div className={`flex flex-col gap-4 w-full ${colIndex % 2 === 0 ? 'animate-marquee-up' : 'animate-marquee-down'}`}>
              {/* Duplicate content x2 for seamless loop */}
              {[...getColumnImages(colIndex, 6), ...getColumnImages(colIndex, 6)].map((src, i) => (
                <div key={i} className="w-full rounded-2xl overflow-hidden aspect-[3/4] md:aspect-auto">
                  <img src={src} alt="" className="w-full h-full object-cover rounded-2xl shadow-lg" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-6 text-center animate-fade-in-up">

        {/* Decorative badge */}
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80 backdrop-blur-xl mb-8">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
          Claim your link today
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-6 drop-shadow-sm">
          Get your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse-slow">
            next idea.
          </span>
        </h1>

        <p className="text-lg md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
          The best place to explore, collect, and share your favorite products.
          One link to rule them all.
        </p>

        {/* Search / Username Input */}
        <div className="max-w-xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-1000"></div>
          <div className="relative flex items-center bg-slate-900/90 backdrop-blur-xl rounded-full border border-slate-700 shadow-2xl p-2 transition-all focus-within:ring-2 focus-within:ring-emerald-500/50 focus-within:border-emerald-500/50">

            <div className="pl-6 pr-2 text-slate-400 font-semibold select-none hidden sm:block">
              taponn.me/
            </div>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
              placeholder="username"
              className="flex-1 bg-transparent text-white placeholder:text-slate-500 h-12 outline-none border-none font-medium text-lg min-w-[120px]"
            />

            <div className="flex items-center gap-3 pr-2">
              {/* Status Icon */}
              {checking && <Loader2 className="w-5 h-5 animate-spin text-slate-400" />}
              {!checking && availability?.available && <Check className="w-5 h-5 text-emerald-500" />}
              {!checking && availability && !availability.available && <X className="w-5 h-5 text-red-500" />}

              <Button
                onClick={handleGetStarted}
                disabled={!availability?.available}
                size="lg"
                className={`rounded-full px-6 h-12 font-bold text-base transition-all duration-300 ${availability?.available
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                  }`}
              >
                Claim <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Availability Message */}
        <div className="h-8 mt-4 flex justify-center">
          {availability && username.length >= 3 && (
            <p className={`text-sm font-medium px-4 py-1 rounded-full backdrop-blur-md ${availability.available
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
              } animate-in fade-in slide-in-from-top-2`}>
              {availability.message}
            </p>
          )}
        </div>

      </div>

      <style>{`
        @keyframes marquee-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes marquee-down {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .animate-marquee-up {
          animation: marquee-up 60s linear infinite;
        }
        .animate-marquee-down {
          animation: marquee-down 60s linear infinite;
        }
        .animate-fade-in-up {
            animation: fadUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
            transform: translateY(20px);
        }
        @keyframes fadUp {
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-pulse-slow {
            animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </HeroAurora>
  );
};

export default HeroSection;
