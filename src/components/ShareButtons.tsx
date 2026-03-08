import { Facebook, Twitter, Linkedin, Link2, Mail, MessageCircle, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { trackShare } from "@/lib/shareAnalytics";
import { useState } from "react";

interface ShareButtonsProps {
  title: string;
  bookId: string;
  /** Compact: shows a single share icon that expands on hover (for cards) */
  compact?: boolean;
}

const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

export default function ShareButtons({ title, bookId, compact = false }: ShareButtonsProps) {
  const [expanded, setExpanded] = useState(false);
  const bookUrl = `${baseUrl}/book/${bookId}`;
  const encodedUrl = encodeURIComponent(bookUrl);
  const encodedTitle = encodeURIComponent(`Check out "${title}" on Great Auk Books!`);

  const shareLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      hoverColor: "hover:text-[#1877F2]",
    },
    {
      name: "X (Twitter)",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      hoverColor: "hover:text-foreground",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      hoverColor: "hover:text-[#25D366]",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      hoverColor: "hover:text-[#0A66C2]",
    },
    {
      name: "Email",
      icon: Mail,
      url: `mailto:?subject=${encodedTitle}&body=I thought you might enjoy this book: ${encodedUrl}`,
      hoverColor: "hover:text-accent",
    },
  ];

  const copyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(bookUrl);
    trackShare("copy_link", bookId, title);
    toast({ title: "Link copied!", description: "Book link copied to clipboard." });
  };

  const handleClick = (e: React.MouseEvent, url: string, platform: string) => {
    e.preventDefault();
    e.stopPropagation();
    trackShare(platform, bookId, title);
    if (platform === "Email") {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
    }
  };

  // Compact mode: single share icon, expands on hover/click
  if (compact) {
    return (
      <div
        className="relative"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="p-1.5 rounded-md text-muted-foreground hover:text-accent hover:bg-secondary/80 transition-colors"
          title="Share this book"
          aria-label="Share this book"
        >
          <Share2 size={14} />
        </button>
        {expanded && (
          <div
            className="absolute bottom-full right-0 mb-1 flex items-center gap-1 bg-card border border-border rounded-lg p-1.5 shadow-lg z-20 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {shareLinks.slice(0, 3).map((link) => (
              <button
                key={link.name}
                onClick={(e) => handleClick(e, link.url, link.name)}
                className={`p-1.5 rounded-md text-muted-foreground hover:bg-secondary transition-colors ${link.hoverColor}`}
                title={`Share on ${link.name}`}
                aria-label={`Share on ${link.name}`}
              >
                <link.icon size={13} />
              </button>
            ))}
            <button
              onClick={copyLink}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-accent transition-colors"
              title="Copy link"
              aria-label="Copy link"
            >
              <Link2 size={13} />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Full mode: all buttons visible (book detail page)
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-medium text-muted-foreground mr-1">Share:</span>
      {shareLinks.map((link) => (
        <button
          key={link.name}
          onClick={(e) => handleClick(e, link.url, link.name)}
          className={`p-2 rounded-lg bg-secondary text-muted-foreground hover:bg-secondary/80 transition-colors ${link.hoverColor}`}
          title={`Share on ${link.name}`}
          aria-label={`Share on ${link.name}`}
        >
          <link.icon size={16} />
        </button>
      ))}
      <button
        onClick={copyLink}
        className="p-2 rounded-lg bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-accent transition-colors"
        title="Copy link"
        aria-label="Copy link"
      >
        <Link2 size={16} />
      </button>
    </div>
  );
}
