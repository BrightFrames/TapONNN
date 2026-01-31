import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const HeroSection = () => {
  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<{ available: boolean; message: string } | null>(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [username, API_URL]);

  const handleGetStarted = () => {
    if (availability?.available) {
      navigate(`/login?username=${username}`);
    }
  };

  return (
    <section className="bg-background min-h-screen pt-32 pb-20 px-4 overflow-hidden flex flex-col justify-center">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-foreground tracking-tight">
              A link in bio
              <br />
              <span className="text-primary">built for you.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Join 70M+ people using Tap2 for their link in bio. One link to help you
              share everything you create, curate and sell from your Instagram, TikTok,
              Twitter, YouTube and other social media profiles.
            </p>

            {/* Username Input */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium select-none">
                  tap2.me/
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                  placeholder="yourname"
                  className="w-full h-12 pl-24 pr-12 rounded-lg border border-input bg-background/50 ring-offset-background focus:ring-2 focus:ring-ring focus:border-input transition-all outline-none shadow-sm"
                />
                {/* Status Icon */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {checking && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                  {!checking && availability?.available && <Check className="w-5 h-5 text-green-600" />}
                  {!checking && availability && !availability.available && <X className="w-5 h-5 text-red-600" />}
                </div>
              </div>
              <Button
                size="lg"
                className="h-12 px-8 rounded-lg font-semibold text-base shadow-lg hover:shadow-primary/25 transition-all duration-300"
                onClick={handleGetStarted}
                disabled={!availability?.available}
              >
                Get started
              </Button>
            </div>
            {/* Availability Message */}
            {availability && username.length >= 3 && (
              <p className={`text-sm ${availability.available ? 'text-green-600' : 'text-red-600'} max-w-md mx-auto lg:mx-0`}>
                {availability.message}
              </p>
            )}
          </div>

          {/* Right Content - Phone Mockups */}
          <div className="relative h-[550px] lg:h-[600px] w-full max-w-[500px] mx-auto lg:max-w-none lg:mx-0 scale-90 sm:scale-100 lg:scale-100 hidden md:block">
            {/* Main Phone */}
            <div className="absolute top-10 left-0 right-0 mx-auto lg:mx-0 lg:translate-x-0 lg:left-auto lg:top-20 lg:right-10 w-72 h-[500px] bg-card rounded-[2.5rem] shadow-2xl overflow-hidden animate-float border-[8px] border-slate-900 z-10 ring-1 ring-white/10">
              <div className="p-6 space-y-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-feature" />
                  <h3 className="font-bold text-lg">@creative</h3>
                  <p className="text-sm text-muted-foreground text-center">Digital creator & artist</p>
                </div>

                <div className="space-y-3 mt-6">
                  {["My Portfolio", "Shop Prints", "YouTube Channel", "Newsletter"].map((link, i) => (
                    <div key={i} className="w-full py-3 px-4 bg-secondary rounded-xl text-center text-sm font-medium hover:scale-105 transition-transform cursor-pointer">
                      {link}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Secondary Card - Hidden on very small screens, visible on md+ */}
            <div className="absolute top-0 right-1/2 translate-x-1/2 lg:translate-x-0 lg:right-60 w-48 h-64 bg-feature rounded-3xl shadow-xl overflow-hidden animate-float-delayed hidden sm:block">
              <div className="p-4 text-feature-foreground">
                <div className="w-12 h-12 rounded-full bg-primary mb-3" />
                <div className="space-y-2">
                  <div className="h-3 bg-feature-foreground/30 rounded-full w-3/4" />
                  <div className="h-3 bg-feature-foreground/20 rounded-full w-1/2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
