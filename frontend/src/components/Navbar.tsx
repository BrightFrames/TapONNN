import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Compass } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Templates", href: "/templates" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Discover", href: "/discover" },
    { name: "Pricing", href: "/pricing" },
  ];

  // Logic: 
  // Home: Always White Text. 
  //   - Top: Transparent BG.
  //   - Scrolled: Dark Glass BG.
  // Other: Standard Theme.

  const isHomeTop = isHome && !scrolled;
  const isHomeScrolled = isHome && scrolled;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isHomeTop
          ? "bg-transparent border-transparent text-white"
          : isHomeScrolled
            ? "bg-black/50 backdrop-blur-xl border-white/10 text-white shadow-lg supports-[backdrop-filter]:bg-black/20"
            : "bg-background/80 backdrop-blur-md border-border text-foreground shadow-sm"
      )}
    >
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              {/* Logo: Invert if on Home (since Home is always dark/white text) */}
              <img
                src="/logo.svg"
                alt="TapX"
                className={cn(
                  "w-12 h-12 transition-all",
                  isHome ? "brightness-0 invert" : ""
                )}
              />
            </Link>

            <Link to="/explore">
              <Button
                variant="ghost"
                className={cn(
                  "flex items-center gap-2 font-medium text-lg px-3 py-2 h-auto",
                  isHome ? "hover:bg-white/10 text-white hover:text-white" : ""
                )}
              >
                <Compass className="w-5 h-5" />
                Explore
              </Button>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.href}>
                <Button
                  variant="ghost"
                  size="default"
                  className={cn(
                    "text-base font-medium",
                    isHome ? "hover:bg-white/10 text-white hover:text-white" : ""
                  )}
                >
                  {link.name}
                </Button>
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login">
              <Button
                variant="ghost"
                size="default"
                className={cn(
                  "text-base font-medium",
                  isHome ? "hover:bg-white/10 text-white hover:text-white" : ""
                )}
              >
                Log in
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="default"
                size="lg"
                className={cn(
                  "px-8 rounded-full font-bold transition-all",
                  // Home: White button with Black text (High Contrast)
                  // Other: Standard Black/White
                  isHome
                    ? "bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    : "bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black"
                )}
              >
                Sign up free
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-border mt-4 bg-background rounded-b-xl shadow-xl p-4 absolute left-0 right-0 top-full">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.href} onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" size="lg" className="w-full justify-start text-lg">
                    {link.name}
                  </Button>
                </Link>
              ))}
              <div className="flex flex-col gap-3 mt-4">
                <Link to="/login" className="w-full">
                  <Button variant="ghost" size="lg" className="w-full font-medium">
                    Log in
                  </Button>
                </Link>
                <Link to="/login" className="w-full">
                  <Button variant="default" size="lg" className="w-full rounded-full font-bold">
                    Sign up free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
