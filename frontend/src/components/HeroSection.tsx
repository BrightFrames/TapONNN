import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  const [username, setUsername] = useState("");

  return (
    <section className="section-hero min-h-screen pt-32 pb-20 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-hero-foreground">
              <span className="italic">A link in bio</span>
              <br />
              <span className="italic">built for you.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-hero-foreground/80 max-w-lg">
              Join 70M+ people using LinkHub for their link in bio. One link to help you 
              share everything you create, curate and sell from your Instagram, TikTok, 
              Twitter, YouTube and other social media profiles.
            </p>

            {/* Username Input */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-md">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-hero-foreground/60 font-medium">
                  linkhub.me/
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="yourname"
                  className="w-full h-14 pl-28 pr-4 rounded-pill border-2 border-hero-foreground/20 bg-transparent text-hero-foreground placeholder:text-hero-foreground/40 focus:border-hero-foreground focus:outline-none transition-colors"
                />
              </div>
              <Button variant="hero" size="xl" className="group">
                Get started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Right Content - Phone Mockups */}
          <div className="relative h-[500px] lg:h-[600px] hidden lg:block">
            {/* Main Phone */}
            <div className="absolute top-20 right-10 w-72 h-[500px] bg-card rounded-[2.5rem] shadow-2xl overflow-hidden animate-float border-8 border-hero-foreground/10">
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

            {/* Secondary Card */}
            <div className="absolute top-0 right-60 w-48 h-64 bg-feature rounded-3xl shadow-xl overflow-hidden animate-float-delayed">
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
