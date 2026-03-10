import { BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface BookPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  authorName: string;
  previewContent: string;
  coverUrl?: string | null;
  onAddToCart?: () => void;
}

export default function BookPreviewModal({
  open,
  onOpenChange,
  title,
  authorName,
  previewContent,
  coverUrl,
  onAddToCart,
}: BookPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-start gap-4">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={title}
                className="w-16 h-24 object-cover rounded shadow-md shrink-0"
              />
            ) : (
              <div className="w-16 h-24 bg-muted rounded flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0">
              <DialogTitle className="text-xl leading-tight">
                {title}
              </DialogTitle>
              <DialogDescription className="mt-1">
                by {authorName} — Preview
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Scrollable preview content */}
        <ScrollArea className="flex-1 px-6">
          <div className="py-6 prose prose-sm dark:prose-invert max-w-none">
            {previewContent.split("\n").map((paragraph, i) => (
              <p key={i} className="text-foreground/90 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          {/* End-of-preview fade */}
          <div className="relative py-8">
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent" />
            <div className="text-center space-y-3 pt-4">
              <p className="text-sm text-muted-foreground font-medium">
                — End of Preview —
              </p>
              <p className="text-sm text-muted-foreground">
                Enjoyed what you read? Get the full book.
              </p>
              {onAddToCart && (
                <Button onClick={onAddToCart} size="sm">
                  Add to Cart
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
