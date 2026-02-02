import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Stack from "@/components/ui/Stack";

// Custom authentic brand icons
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const TiktokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.65-1.58-1.02v10.95c-1.25 10.95-18.17 6.44-12.82-3.48 3.52-5.46 12.01-2.9 11.23 3.65-.54 3.02-3.26 5.42-6.28 5.6-3.8.36-7.39-2.5-7.79-6.3-.4-4.27 2.5-8.24 6.5-8.91.73-.11 1.47-.11 2.2-.05V.02h2.86z" />
  </svg>
);

const SpotifyIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 14.821 1.08.54.3.72 1.02.42 1.56-.24.42-.84.6-1.38.42z" />
  </svg>
);


const ShareSection = () => {
  const cardData = [
    {
      id: 1,
      label: "Instagram",
      content: (
        <div className="w-full h-full bg-gradient-to-bl from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex flex-col items-center justify-center relative p-6 group overflow-hidden">
          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

          <div className="bg-white/20 backdrop-blur-xl p-6 rounded-[2rem] mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.25)] border border-white/40 group-hover:scale-105 transition-transform duration-500 relative z-10">
            <InstagramIcon className="w-24 h-24 text-white drop-shadow-xl" />
          </div>

          <div className="absolute top-6 right-6 z-10">
            <div className="w-3 h-3 rounded-full bg-white/40 ring-4 ring-white/10 backdrop-blur-sm" />
          </div>

          <div className="absolute bottom-8 left-8 w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20 z-10">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#833AB4] to-[#F77737]" />
          </div>
        </div>
      )
    },
    {
      id: 2,
      label: "Twitter",
      content: (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center relative p-6 overflow-hidden">
          <div className="absolute inset-0 bg-zinc-900/50" />
          {/* Abstract mesh gradient */}
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-transparent to-transparent opacity-50" />

          <div className="relative z-10 p-8 transform group-hover:scale-110 transition-transform duration-500">
            <TwitterIcon className="w-32 h-32 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
          </div>
          <div className="absolute bottom-10 right-10 text-zinc-500/50 text-6xl font-black tracking-tighter select-none rotate-[-15deg]">
            X
          </div>
        </div>
      )
    },
    {
      id: 3,
      label: "YouTube",
      content: (
        <div className="w-full h-full bg-[#FF0000] flex flex-col items-center justify-center relative p-6 overflow-hidden">
          {/* Glossy overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-60 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-orange-500/20 to-transparent mix-blend-overlay" />

          <div className="bg-white p-7 rounded-[2.5rem] shadow-2xl flex items-center justify-center relative z-10 transform group-hover:scale-105 transition-transform duration-300">
            <div className="text-[#FF0000] drop-shadow-lg">
              <YoutubeIcon className="w-20 h-20" />
            </div>
          </div>

          {/* Play button pattern bg */}
          <div className="absolute -bottom-10 -right-10 text-white/10 rotate-12 transform scale-150">
            <YoutubeIcon className="w-64 h-64" />
          </div>
        </div>
      )
    },
    {
      id: 4,
      label: "LinkedIn",
      content: (
        <div className="w-full h-full bg-[#0077b5] flex flex-col items-center justify-center relative p-6 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]" />

          <div className="relative z-10 filter drop-shadow-2xl">
            <LinkedinIcon className="w-40 h-40 text-white" />
          </div>

          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-bl-[120px] backdrop-blur-sm border-l border-b border-white/5" />
        </div>
      )
    },
    {
      id: 6,
      label: "Spotify",
      content: (
        <div className="w-full h-full bg-[#1DB954] flex flex-col items-center justify-center relative p-6 overflow-hidden">
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-40" />

          <div className="relative z-10 bg-black/20 p-8 rounded-full backdrop-blur-md shadow-xl border border-white/10">
            <SpotifyIcon className="w-24 h-24 text-white" />
          </div>

          {/* Sound waves decoration */}
          <div className="flex gap-1.5 mt-8 items-end h-16 opacity-80">
            <div className="w-1.5 bg-white rounded-full animate-[bounce_1s_infinite] h-8" />
            <div className="w-1.5 bg-white rounded-full animate-[bounce_1.2s_infinite] h-12" />
            <div className="w-1.5 bg-white rounded-full animate-[bounce_0.8s_infinite] h-6" />
            <div className="w-1.5 bg-white rounded-full animate-[bounce_1.5s_infinite] h-10" />
            <div className="w-1.5 bg-white rounded-full animate-[bounce_1.1s_infinite] h-14" />
          </div>
        </div>
      )
    },
    {
      id: 7,
      label: "Facebook",
      content: (
        <div className="w-full h-full bg-[#1877F2] flex flex-col items-center justify-center relative p-6 overflow-hidden">
          <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-400/20 rounded-full blur-2xl" />

          <div className="relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.25)]">
            <FacebookIcon className="w-36 h-36 text-white" />
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="bg-white py-32 px-4 overflow-hidden relative">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

      {/* Ambient background glow */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-pink-100/50 to-purple-100/50 blur-[100px] rounded-full pointer-events-none" />

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
          <div className="relative h-[600px] w-full flex items-center justify-center scale-90 sm:scale-100">
            {/* Glow behind cards */}
            <div className="absolute w-[400px] h-[400px] bg-gradient-to-tr from-pink-500/20 to-orange-500/20 blur-[80px] rounded-full animate-pulse-slow pointer-events-none" />

            <div className="w-[320px] h-[480px]">
              <Stack
                randomRotation={true}
                sensitivity={100}
                sendToBackOnClick={true}
                cards={cardData.map((card) => card.content)}
                autoplay={true}
                autoplayDelay={3000}
                pauseOnHover={true}
              />
            </div>

            {/* Username Pill */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-xl shadow-zinc-200/50 flex items-center gap-3 border border-zinc-100 animate-float z-20 hover:scale-105 transition-transform cursor-pointer">
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
