import { Facebook, Twitter, Linkedin, Link2, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  title: string;
  bookId: string;
  compact?: boolean;
}

const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

export default function ShareButtons({ title, bookId, compact = false }: ShareButtonsProps) {
  const bookUrl = `${baseUrl}/book/${bookId}`;
  const encodedUrl = encodeURIComponent(bookUrl);
  const encodedTitle = encodeURIComponent(`Check out "${title}" on Great Auk Books!`);

  const shareLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:text-[#1877F2]",
    },
    {
      name: "X (Twitter)",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: "hover:text-foreground",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "hover:text-[#0A66C2]",
    },
    {
      name: "Email",
      icon: Mail,
      url: `mailto:?subject=${encodedTitle}&body=I thought you might enjoy this book: ${encodedUrl}`,
      color: "hover:text-accent",
    },
  ];

  const copyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(bookUrl);
    toast({ title: "Link copied!", description: "Book link copied to clipboard." });
  };

  const handleClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
  };

  const iconSize = compact ? 14 : 16;
  const btnClass = compact
    ? "p-1.5 rounded-md bg-secondary/60 text-muted-foreground hover:bg-secondary transition-colors"
    : "p-2 rounded-lg bg-secondary text-muted-foreground hover:bg-secondary/80 transition-colors";

  return (
    <div className={`flex items-center gap-${compact ? "1" : "2"}`}>
      {!compact && <span className="text-xs font-medium text-muted-foreground mr-1">Share:</span>}
      {shareLinks.map((link) => (
        <button
          key={link.name}
          onClick={(e) => handleClick(e, link.url)}
          className={`${btnClass} ${link.color}`}
          title={`Share on ${link.name}`}
          aria-label={`Share on ${link.name}`}
        >
          <link.icon size={iconSize} />
        </button>
      ))}
      <button
        onClick={copyLink}
        className={`${btnClass} hover:text-accent`}
        title="Copy link"
        aria-label="Copy link"
      >
        <Link2 size={iconSize} />
      </button>
    </div>
  );
}
