import { useState } from "react";
import { Upload, ArrowRight, ArrowLeft, CheckCircle, Download, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const stepLabels = ["Book Details", "Manuscript", "Cover & ISBN", "Pricing", "Submit"];

interface BookData {
  title: string;
  subtitle: string;
  authorName: string;
  description: string;
  category: string;
  language: string;
  keywords: string;
  previewContent: string;
  manuscriptFile: File | null;
  coverFile: File | null;
  ebookPrice: string;
  printPrice: string;
  formats: string[];
}

const initialData: BookData = {
  title: "",
  subtitle: "",
  authorName: "",
  description: "",
  category: "Fiction",
  language: "English",
  keywords: "",
  previewContent: "",
  manuscriptFile: null,
  coverFile: null,
  ebookPrice: "9.99",
  printPrice: "14.99",
  formats: ["ebook"],
};

export default function PublishBookPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<BookData>(initialData);
  const [submitting, setSubmitting] = useState(false);
  const { user, isAuthor } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const update = (field: keyof BookData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user || !isAuthor) {
      toast({ title: "Authentication required", description: "Please log in as an author.", variant: "destructive" });
      navigate("/author-login");
      return;
    }

    setSubmitting(true);

    try {
      let coverUrl: string | null = null;

      // Upload cover if provided
      if (data.coverFile) {
        const fileExt = data.coverFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("book-files")
          .upload(`covers/${fileName}`, data.coverFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("book-files")
          .getPublicUrl(`covers/${fileName}`);
        
        coverUrl = publicUrl;
      }

      // Insert book record
      const { error: insertError } = await supabase.from("books").insert({
        title: data.title,
        author_name: data.authorName,
        author_id: user.id,
        description: data.description,
        category: data.category,
        ebook_price: parseFloat(data.ebookPrice) || 0,
        print_price: parseFloat(data.printPrice) || 0,
        format: data.formats,
        cover_url: coverUrl,
        status: "pending",
      });

      if (insertError) throw insertError;

      toast({
        title: "Book submitted!",
        description: "Your book is now pending review. We'll notify you once it's approved.",
      });

      navigate("/author-dashboard");
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return data.title.trim() && data.authorName.trim() && data.description.trim();
    if (step === 3) {
      const ebook = parseFloat(data.ebookPrice);
      const print = parseFloat(data.printPrice);
      return (data.formats.includes("ebook") ? ebook >= 2.99 : true) &&
             (data.formats.includes("paperback") ? print >= 6.99 : true);
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Publish New Book</h1>
        <p className="text-muted-foreground mb-8">Complete each step to submit your book for review.</p>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                i <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className="text-xs text-muted-foreground hidden md:block">{label}</span>
              {i < stepLabels.length - 1 && <div className={`h-0.5 flex-1 ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-card rounded-lg border border-border p-8">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold text-card-foreground">Book Details</h2>
              <div>
                <label className="text-sm font-medium text-card-foreground block mb-1">Title *</label>
                <input
                  value={data.title}
                  onChange={(e) => update("title", e.target.value)}
                  className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm"
                  placeholder="Enter book title..."
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground block mb-1">Subtitle</label>
                <input
                  value={data.subtitle}
                  onChange={(e) => update("subtitle", e.target.value)}
                  className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm"
                  placeholder="Optional subtitle..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground block mb-1">Author Name *</label>
                <input
                  value={data.authorName}
                  onChange={(e) => update("authorName", e.target.value)}
                  className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm"
                  placeholder="Your name or pen name..."
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground block mb-1">Description *</label>
                <textarea
                  value={data.description}
                  onChange={(e) => update("description", e.target.value)}
                  className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm resize-none h-24"
                  placeholder="Brief description of your book..."
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground block mb-1">Preview Content (Look Inside)</label>
                <textarea
                  value={data.previewContent}
                  onChange={(e) => update("previewContent", e.target.value)}
                  className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm resize-none h-32"
                  placeholder="Paste the first few pages of your book here. This will be shown as a free preview to potential readers..."
                />
                <p className="text-xs text-muted-foreground mt-1">Optional — lets readers preview your book before purchasing.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground block mb-1">Category</label>
                  <select
                    value={data.category}
                    onChange={(e) => update("category", e.target.value)}
                    className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm"
                  >
                    <option>Fiction</option>
                    <option>Non-Fiction</option>
                    <option>Science</option>
                    <option>Philosophy</option>
                    <option>Mystery</option>
                    <option>Romance</option>
                    <option>Biography</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground block mb-1">Language</label>
                  <select
                    value={data.language}
                    onChange={(e) => update("language", e.target.value)}
                    className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm"
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground block mb-1">Keywords</label>
                <input
                  value={data.keywords}
                  onChange={(e) => update("keywords", e.target.value)}
                  className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm"
                  placeholder="e.g. adventure, classic, romance"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-semibold text-card-foreground">Upload Manuscript</h2>
                <p className="text-sm text-muted-foreground mt-1">Accepted formats: DOCX, PDF, EPUB</p>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-accent/50 transition-colors">
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-medium">
                  {data.manuscriptFile ? data.manuscriptFile.name : "Drag and drop your manuscript"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse files</p>
                <input
                  type="file"
                  accept=".docx,.pdf,.epub"
                  onChange={(e) => update("manuscriptFile", e.target.files?.[0] || null)}
                  className="hidden"
                  id="manuscript-upload"
                />
                <label htmlFor="manuscript-upload">
                  <Button variant="outline" className="mt-4" type="button" onClick={() => document.getElementById("manuscript-upload")?.click()}>
                    Choose File
                  </Button>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">Max file size: 50MB</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-display text-xl font-semibold text-card-foreground">Cover & Format</h2>
              <div>
                <p className="text-sm font-medium text-card-foreground mb-2">Book Cover</p>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-foreground">
                    {data.coverFile ? data.coverFile.name : "Upload cover image (recommended 1600×2560px)"}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => update("coverFile", e.target.files?.[0] || null)}
                    className="hidden"
                    id="cover-upload"
                  />
                  <label htmlFor="cover-upload">
                    <Button variant="outline" size="sm" className="mt-3" type="button" onClick={() => document.getElementById("cover-upload")?.click()}>
                      Upload Cover
                    </Button>
                  </label>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground mb-2">Available Formats</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={data.formats.includes("ebook")}
                      onChange={(e) => {
                        const formats = e.target.checked
                          ? [...data.formats, "ebook"]
                          : data.formats.filter(f => f !== "ebook");
                        update("formats", formats);
                      }}
                      className="rounded border-input"
                    />
                    <span className="text-sm text-foreground">Ebook</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={data.formats.includes("paperback")}
                      onChange={(e) => {
                        const formats = e.target.checked
                          ? [...data.formats, "paperback"]
                          : data.formats.filter(f => f !== "paperback");
                        update("formats", formats);
                      }}
                      className="rounded border-input"
                    />
                    <span className="text-sm text-foreground">Paperback</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold text-card-foreground">Set Pricing</h2>
              <p className="text-sm text-muted-foreground">Set your prices. Minimum thresholds apply per format.</p>
              {data.formats.includes("ebook") && (
                <div>
                  <label className="text-sm font-medium text-card-foreground block mb-1">Ebook Price (USD) — min $2.99</label>
                  <input
                    type="number"
                    value={data.ebookPrice}
                    onChange={(e) => update("ebookPrice", e.target.value)}
                    className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm"
                    placeholder="9.99"
                    min="2.99"
                    step="0.01"
                  />
                </div>
              )}
              {data.formats.includes("paperback") && (
                <div>
                  <label className="text-sm font-medium text-card-foreground block mb-1">Paperback Price (USD) — min $6.99</label>
                  <input
                    type="number"
                    value={data.printPrice}
                    onChange={(e) => update("printPrice", e.target.value)}
                    className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm"
                    placeholder="14.99"
                    min="6.99"
                    step="0.01"
                  />
                </div>
              )}
              <div className="bg-secondary/50 rounded-lg p-4 text-sm">
                <p className="font-medium text-foreground">Estimated Earnings (70% royalty)</p>
                {data.formats.includes("ebook") && (
                  <p className="text-muted-foreground mt-1">
                    Ebook at ${data.ebookPrice} → You earn <span className="font-bold text-foreground">${(parseFloat(data.ebookPrice) * 0.7).toFixed(2)}</span>
                  </p>
                )}
                {data.formats.includes("paperback") && (
                  <p className="text-muted-foreground">
                    Paperback at ${data.printPrice} → You earn <span className="font-bold text-foreground">${(parseFloat(data.printPrice) * 0.7).toFixed(2)}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-card-foreground">Ready to Submit</h2>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Your book will be reviewed by the Great Auk team before publishing. This usually takes 24–48 hours.
              </p>
              <Button
                variant="hero"
                size="lg"
                className="mt-6"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit for Review"}
              </Button>
            </div>
          )}

          {step < 4 && (
            <div className="flex justify-between mt-8">
              <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}