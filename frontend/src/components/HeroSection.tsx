import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
    <section className="relative h-screen w-full overflow-hidden bg-black flex flex-col justify-center items-center">

      {/* 1. Scrolling Masonry Background - Increased Opacity (60%) */}
      <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 px-4 opacity-60 pointer-events-none select-none">
        {[0, 1, 2, 3, 4, 5].map((colIndex) => (
          <div key={colIndex} className="relative h-[200vh] -top-[50vh] flex flex-col gap-4 overflow-hidden">
            {/* Scrolling Container */}
            <div className={`flex flex-col gap-4 w-full ${colIndex % 2 === 0 ? 'animate-marquee-up' : 'animate-marquee-down'}`}>
              {/* Duplicate content x2 for seamless loop */}
              {[...getColumnImages(colIndex, 6), ...getColumnImages(colIndex, 6)].map((src, i) => (
                <div key={i} className="w-full rounded-2xl overflow-hidden aspect-[3/4] md:aspect-auto">
                  <img src={src} alt="" className="w-full h-full object-cover rounded-2xl shadow-lg hover:scale-105 transition-transform duration-700" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 2. Gradient Overlay - Lighter center (40%) to reveal images */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-black/80 z-10" />

      {/* 3. Hero Content */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-6 text-center animate-fade-in-up">

        {/* Floating Pills Decoration (New) */}
        <div className="absolute top-0 left-10 md:left-20 animate-float-slow hidden lg:block opacity-60">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full transform -rotate-6">🎨 Design</div>
        </div>
        <div className="absolute bottom-20 right-10 md:right-20 animate-float-delayed hidden lg:block opacity-60">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full transform rotate-12">👗 Fashion</div>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-6 drop-shadow-2xl">
          Get your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-green-600 animate-pulse-slow">next idea.</span>
        </h1>

        <p className="text-lg md:text-2xl text-zinc-200 mb-10 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
          The best place to explore, collect, and share your favorite products.
          Claim your link and start curating today.
        </p>

        {/* Search / Username Input - Brighter Background */}
        <div className="max-w-xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-1000"></div>
          <div className="relative flex items-center bg-zinc-900/90 backdrop-blur-xl rounded-full border border-zinc-700 shadow-2xl p-2 transition-all focus-within:ring-2 focus-within:ring-green-500/50 focus-within:bg-black">

            <div className="pl-6 pr-2 text-zinc-400 font-semibold select-none hidden sm:block">
              tap2.me/
            </div>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
              placeholder="username"
              className="flex-1 bg-transparent text-white placeholder:text-zinc-500 h-12 outline-none border-none font-medium text-lg min-w-[120px]"
            />

            <div className="flex items-center gap-3 pr-2">
              {/* Status Icon */}
              {checking && <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />}
              {!checking && availability?.available && <Check className="w-5 h-5 text-green-500" />}
              {!checking && availability && !availability.available && <X className="w-5 h-5 text-red-500" />}

              <Button
                onClick={handleGetStarted}
                disabled={!availability?.available}
                size="lg"
                className={`rounded-full px-8 h-12 font-bold text-base transition-all duration-300 ${availability?.available ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20 scale-105' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'}`}
              >
                Claim Link <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Availability Message */}
        <div className="h-8 mt-4 flex justify-center">
          {availability && username.length >= 3 && (
            <p className={`text-sm font-medium px-4 py-1 rounded-full backdrop-blur-md ${availability.available ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'} animate-in fade-in slide-in-from-top-2`}>
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
        @keyframes keyframes-float {
            0%, 100% { transform: translateY(0px) rotate(-6deg); }
            50% { transform: translateY(-20px) rotate(-6deg); }
        }
        .animate-float-slow {
            animation: keyframes-float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
            animation: keyframes-float 6s ease-in-out 3s infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
