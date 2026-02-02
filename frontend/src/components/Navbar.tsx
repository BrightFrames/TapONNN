import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles, Compass } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Templates", href: "/templates" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Discover", href: "/discover" },
    { name: "Pricing", href: "/pricing" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logotap2.png" alt="TapONN" className="w-9 h-9" />
            </Link>

            <Link to="/explore">
              <Button variant="ghost" className="flex items-center gap-2 font-medium text-lg px-3 py-2 h-auto">
                <Compass className="w-5 h-5" />
                Explore
              </Button>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.href}>
                <Button variant="navGhost" size="default" className="text-base font-medium">
                  {link.name}
                </Button>
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login">
              <Button variant="navGhost" size="default" className="text-base font-medium">
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="nav" size="lg" className="px-8 bg-black text-white hover:bg-gray-800 rounded-full font-bold">
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
          <div className="md:hidden pt-4 pb-2 border-t border-border mt-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.href} onClick={() => setIsOpen(false)}>
                  <Button variant="navGhost" size="lg" className="w-full justify-start text-lg">
                    {link.name}
                  </Button>
                </Link>
              ))}
              <div className="flex flex-col gap-3 mt-4">
                <Link to="/login" className="w-full">
                  <Button variant="navGhost" size="lg" className="w-full font-medium">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup" className="w-full">
                  <Button variant="nav" size="lg" className="w-full bg-black text-white rounded-full font-bold">
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
