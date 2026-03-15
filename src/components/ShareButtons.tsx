import React, { useState } from "react";
import { Facebook, Link2, MessageCircle, Share2 } from "lucide-react";
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
            <div
              className="fixed inset-0 z-[999]"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
              }}
            />
            <div
              className="fixed z-[1000] w-48 p-2 rounded-xl shadow-2xl border border-border bg-card"
              style={{
                top: "auto",
                bottom: "auto",
              }}
              ref={(el) => {
                if (el) {
                  const btn = el.parentElement?.querySelector("button");
                  if (btn) {
                    const rect = btn.getBoundingClientRect();
                    el.style.top = `${rect.bottom + 8}px`;
                    el.style.left = `${Math.min(rect.left, window.innerWidth - 200)}px`;
                  }
                }
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {shareLinks.map((link) => (
                <button
                  key={link.name}
                  type="button"
                  onClick={(e) => handleClick(e, link)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-card-foreground rounded-lg hover:bg-accent/10 hover:text-accent transition-colors"
                >
                  <link.icon size={16} className="text-muted-foreground" />
                  <span className="font-medium">{link.name}</span>
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
