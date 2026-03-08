import { useState } from "react";
import { Upload, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const stepLabels = ["Book Details", "Manuscript", "Cover & ISBN", "Pricing", "Submit"];

export default function PublishBookPage() {
  const [step, setStep] = useState(0);

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
              {["Title", "Subtitle", "Author Name", "Description"].map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium text-card-foreground block mb-1">{field}</label>
                  {field === "Description" ? (
                    <textarea className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm resize-none h-24" placeholder={`Enter ${field.toLowerCase()}...`} />
                  ) : (
                    <input className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm" placeholder={`Enter ${field.toLowerCase()}...`} />
                  )}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground block mb-1">Category</label>
                  <select className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm">
                    <option>Fiction</option><option>Non-Fiction</option><option>Science</option><option>Philosophy</option><option>Mystery</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground block mb-1">Language</label>
                  <select className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm">
                    <option>English</option><option>Spanish</option><option>French</option><option>German</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground block mb-1">Keywords</label>
                <input className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="e.g. adventure, classic, romance" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold text-card-foreground">Upload Manuscript</h2>
              <p className="text-sm text-muted-foreground">Accepted formats: DOCX, PDF, EPUB</p>
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-medium">Drag and drop your manuscript</p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse files</p>
                <Button variant="outline" className="mt-4">Choose File</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-display text-xl font-semibold text-card-foreground">Cover & ISBN</h2>
              <div>
                <p className="text-sm font-medium text-card-foreground mb-2">Book Cover</p>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-foreground">Upload cover image (recommended 1600×2560px)</p>
                  <Button variant="outline" size="sm" className="mt-3">Upload Cover</Button>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground mb-2">ISBN</p>
                <p className="text-sm text-muted-foreground mb-2">Select your country to generate an ISBN through the national agency.</p>
                <select className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm">
                  <option>Select Country</option><option>United States</option><option>United Kingdom</option><option>India</option><option>Australia</option>
                </select>
                <Button variant="outline" size="sm" className="mt-3">Generate ISBN</Button>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <label className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 rounded border-input" />
                  <span className="text-sm text-foreground">
                    I confirm that this is my original work and does not infringe on any copyright. I understand that I am solely responsible for any claims arising from the content of this book.
                  </span>
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold text-card-foreground">Set Pricing</h2>
              <p className="text-sm text-muted-foreground">Set your prices. Minimum thresholds apply per format.</p>
              <div>
                <label className="text-sm font-medium text-card-foreground block mb-1">Ebook Price (USD) — min $2.99</label>
                <input type="number" className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="9.99" min="2.99" step="0.01" />
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground block mb-1">Paperback Price (USD) — min $6.99</label>
                <input type="number" className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm" placeholder="14.99" min="6.99" step="0.01" />
              </div>
              <div className="bg-secondary/50 rounded-lg p-4 text-sm">
                <p className="font-medium text-foreground">Estimated Earnings</p>
                <p className="text-muted-foreground mt-1">Ebook at $9.99 → You earn <span className="font-bold text-foreground">$6.99</span> (70%)</p>
                <p className="text-muted-foreground">Paperback at $14.99 → You earn <span className="font-bold text-foreground">$10.49</span> (70%)</p>
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
              <Button variant="hero" size="lg" className="mt-6">Submit for Review</Button>
            </div>
          )}

          {step < 4 && (
            <div className="flex justify-between mt-8">
              <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <Button onClick={() => setStep(step + 1)}>
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
