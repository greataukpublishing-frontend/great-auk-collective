import { useState } from "react";
import { ThumbsUp, ThumbsDown, Flag } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BookActionsProps {
  bookId: string;
  initialUpvotes?: number;
  initialDownvotes?: number;
}

const reportReasons = [
  "Copyright infringement",
  "Inappropriate content",
  "Incorrect book information",
  "Spam or misleading",
  "Other",
];

export default function BookActions({ bookId, initialUpvotes = 0, initialDownvotes = 0 }: BookActionsProps) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reported, setReported] = useState(false);

  const handleVote = (type: "up" | "down") => {
    if (vote === type) {
      // Undo vote
      setVote(null);
      if (type === "up") setUpvotes((v) => v - 1);
      else setDownvotes((v) => v - 1);
    } else {
      // Switch or new vote
      if (vote === "up") setUpvotes((v) => v - 1);
      if (vote === "down") setDownvotes((v) => v - 1);
      setVote(type);
      if (type === "up") setUpvotes((v) => v + 1);
      else setDownvotes((v) => v + 1);
    }
    console.log(`[BookActions] Vote: ${type}, Book: ${bookId}`);
  };

  const handleReport = () => {
    if (!reportReason) return;
    console.log(`[BookActions] Report: ${reportReason}, Details: ${reportDetails}, Book: ${bookId}`);
    setReported(true);
    setReportOpen(false);
    setReportReason("");
    setReportDetails("");
    toast({ title: "Report submitted", description: "Thank you. We'll review this book shortly." });
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Upvote */}
        <button
          onClick={() => handleVote("up")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
            vote === "up"
              ? "bg-primary/10 border-primary text-primary"
              : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
          }`}
          title="Upvote this book"
        >
          <ThumbsUp size={15} className={vote === "up" ? "fill-primary" : ""} />
          {upvotes > 0 && <span>{upvotes}</span>}
        </button>

        {/* Downvote */}
        <button
          onClick={() => handleVote("down")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
            vote === "down"
              ? "bg-destructive/10 border-destructive text-destructive"
              : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
          }`}
          title="Downvote this book"
        >
          <ThumbsDown size={15} className={vote === "down" ? "fill-destructive" : ""} />
          {downvotes > 0 && <span>{downvotes}</span>}
        </button>

        {/* Report */}
        <button
          onClick={() => !reported && setReportOpen(true)}
          disabled={reported}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
            reported
              ? "bg-muted border-border text-muted-foreground cursor-not-allowed"
              : "bg-card border-border text-muted-foreground hover:text-destructive hover:border-destructive/30"
          }`}
          title={reported ? "Report submitted" : "Report this book"}
        >
          <Flag size={15} />
          <span>{reported ? "Reported" : "Report"}</span>
        </button>
      </div>

      {/* Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Report This Book</DialogTitle>
            <DialogDescription>
              Help us maintain quality. Select a reason for your report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              {reportReasons.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    reportReason === reason
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-foreground/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={() => setReportReason(reason)}
                    className="accent-primary"
                  />
                  <span className="text-sm text-foreground">{reason}</span>
                </label>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Additional details (optional)</label>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Provide more context..."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setReportOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleReport} disabled={!reportReason}>
                Submit Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
