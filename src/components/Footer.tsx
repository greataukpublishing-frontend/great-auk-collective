import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";
import greatAukFooter from "@/assets/great-auk-footer.png";
import { toggleAukCall } from "@/lib/aukSound";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={greatAukFooter} alt="Great Auk" className="h-10 w-10 object-contain cursor-pointer hover:scale-110 transition-transform" onClick={() => toggleAukCall()} title="Click to hear the Great Auk" />
              <span className="font-display text-lg font-bold">
                Great Auk <span className="text-gold">Books</span>
              </span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Restoring forgotten books and empowering authors to publish globally.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { icon: Facebook, href: "https://facebook.com/greataukbooks", label: "Facebook" },
                { icon: Twitter, href: "https://x.com/greataukbooks", label: "X (Twitter)" },
                { icon: Instagram, href: "https://instagram.com/greataukbooks", label: "Instagram" },
                { icon: Youtube, href: "https://youtube.com/@greataukbooks", label: "YouTube" },
                { icon: Linkedin, href: "https://linkedin.com/company/greataukbooks", label: "LinkedIn" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="p-2 rounded-lg bg-primary-foreground/10 text-primary-foreground/70 hover:bg-gold hover:text-primary transition-colors"
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4 text-gold">Explore</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/bookstore" className="hover:text-gold transition-colors">Bookstore</Link></li>
              <li><Link to="/bookstore" className="hover:text-gold transition-colors">New Releases</Link></li>
              <li><Link to="/bookstore" className="hover:text-gold transition-colors">Bestsellers</Link></li>
              <li><Link to="/bookstore" className="hover:text-gold transition-colors">Restored Classics</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4 text-gold">For Authors</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/publish" className="hover:text-gold transition-colors">Start Publishing</Link></li>
              <li><Link to="/author-dashboard" className="hover:text-gold transition-colors">Author Dashboard</Link></li>
              <li><Link to="/publish" className="hover:text-gold transition-colors">Pricing & Royalties</Link></li>
              <li><Link to="/publish" className="hover:text-gold transition-colors">Premium Services</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4 text-gold">Company</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/about" className="hover:text-gold transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
              <li><Link to="/membership" className="hover:text-gold transition-colors">Membership</Link></li>
              <li><Link to="/bring-book-back" className="hover:text-gold transition-colors">Bring a Book Back</Link></li>
              <li><a href="#" className="hover:text-gold transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center text-sm text-primary-foreground/50">
          © 2026 Great Auk Books. All rights reserved. Bringing lost knowledge back to life.
        </div>
      </div>
    </footer>
  );
}
