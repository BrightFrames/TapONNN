import { Link } from "react-router-dom";
import { Sparkles, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    Product: [
      { name: "Features", href: "#" },
      { name: "Pricing", href: "/pricing" },
      { name: "Templates", href: "#" },
      { name: "Integrations", href: "#" },
    ],
    Company: ["About", "Blog", "Careers", "Press"],
    Resources: ["Help Center", "Community", "Developers", "Status"],
    Legal: ["Privacy", "Terms", "Cookies", "Licenses"],
  };

  const socialLinks = [
    { icon: Twitter, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Youtube, href: "#" },
    { icon: Linkedin, href: "#" },
  ];

  return (
    <footer className="bg-slate-950 text-slate-200 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-white">TapONN</span>
            </Link>
            <p className="text-slate-400 text-sm">
              The only link you'll ever need to share everything.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => {
                  const linkName = typeof link === "string" ? link : link.name;
                  const linkHref = typeof link === "string" ? "#" : link.href;
                  return (
                    <li key={linkName}>
                      {linkHref.startsWith("#") ? (
                        <a
                          href={linkHref}
                          className="text-slate-400 hover:text-primary transition-colors text-sm"
                        >
                          {linkName}
                        </a>
                      ) : (
                        <Link
                          to={linkHref}
                          className="text-slate-400 hover:text-primary transition-colors text-sm"
                        >
                          {linkName}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © 2024 TapONN. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            {socialLinks.map((social, i) => (
              <a
                key={i}
                href={social.href}
                className="w-10 h-10 bg-card/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-hero-foreground transition-all"
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
