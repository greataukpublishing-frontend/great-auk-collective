import React, { useState } from "react";
import { Facebook, Twitter, Link2, MessageCircle, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { trackShare } from "@/lib/shareAnalytics";

interface ShareButtonsProps {
  title: string;
  bookId: string;
  compact?: boolean;
}

const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

export default function ShareButtons({ title, bookId, compact = false }: ShareButtonsProps) {
  const [open, setOpen] = useState(false);
  const bookUrl = `${baseUrl}/book/${bookId}`;
  const encodedUrl = encodeURIComponent(bookUrl);
  const encodedTitle = encodeURIComponent(`Check out "${title}" on Great Auk Publishing!`);

  const shareLinks = [
    {
      name: "Copy Link",
      icon: Link2,
      action: "copy" as const,
      url: "",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: "X (Twitter)",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
  ];

  const handleClick = (e: React.MouseEvent, link: typeof shareLinks[0]) => {
    e.preventDefault();
    e.stopPropagation();
    if ("action" in link && link.action === "copy") {
      navigator.clipboard.writeText(bookUrl);
      trackShare("copy_link", bookId, title);
      toast({ title: "Link copied!", description: "Book link copied to clipboard." });
    } else {
      trackShare(link.name, bookId, title);
      window.open(link.url, "_blank", "noopener,noreferrer,width=600,height=400");
    }
    setOpen(false);
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="p-2 rounded-full bg-card/90 text-muted-foreground hover:text-accent hover:bg-card shadow-sm transition-colors"
          aria-label="Share this book"
        >
          <Share2 size={15} />
        </button>

        {open && (
          <>
            {/* Backdrop to close on outside click */}
            <div
              className="fixed inset-0 z-40"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
              }}
            />
            <div
              className="absolute bottom-full right-0 mb-1.5 z-50 w-44 p-1.5 rounded-lg shadow-lg border border-border bg-card animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              {shareLinks.map((link) => (
                <button
                  key={link.name}
                  type="button"
                  onClick={(e) => handleClick(e, link)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-card-foreground rounded-md hover:bg-secondary transition-colors"
                >
                  <link.icon size={15} className="text-muted-foreground" />
                  <span>{link.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Full mode for detail page
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-medium text-muted-foreground mr-1">Share:</span>
      {shareLinks.map((link) => (
        <button
          key={link.name}
          type="button"
          onClick={(e) => handleClick(e, link)}
          className="p-2 rounded-lg bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-accent transition-colors"
          title={link.name}
          aria-label={link.name}
        >
          <link.icon size={16} />
        </button>
      ))}
    </div>
  );
}
