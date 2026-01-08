import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles } from "lucide-react";
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
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-background rounded-full px-4 py-2 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-hero-foreground" />
              <span className="text-xl font-bold text-foreground">LinkHub</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.href}>
                  <Button variant="navGhost" size="sm">
                    {link.name}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login">
                <Button variant="navGhost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="nav" size="sm">
                  Sign up free
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden pt-4 pb-2 border-t border-border mt-4">
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link key={link.name} to={link.href} onClick={() => setIsOpen(false)}>
                    <Button variant="navGhost" size="sm" className="w-full justify-start">
                      {link.name}
                    </Button>
                  </Link>
                ))}
                <div className="flex gap-2 mt-4">
                  <Link to="/login" className="flex-1">
                    <Button variant="navGhost" size="sm" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/signup" className="flex-1">
                    <Button variant="nav" size="sm" className="w-full">
                      Sign up free
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
