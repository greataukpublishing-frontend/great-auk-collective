import { useState } from "react";
import { BookOpen, Heart, Send, Sparkles, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  bookTitle: string;
  author: string;
  yearPublished: string;
  language: string;
  category: string;
  whyRestore: string;
  submitterName: string;
  submitterEmail: string;
  sourceLink: string;
}

const initialForm: FormData = {
  bookTitle: "",
  author: "",
  yearPublished: "",
  language: "English",
  category: "",
  whyRestore: "",
  submitterName: "",
  submitterEmail: "",
  sourceLink: "",
};

const categories = [
  "Literature & Fiction",
  "Philosophy",
  "Science & Natural History",
  "History & Biography",
  "Poetry & Drama",
  "Religion & Theology",
  "Mathematics & Logic",
  "Art & Architecture",
  "Travel & Exploration",
  "Other",
];

export default function BringBookBackPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const { toast } = useToast();

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.bookTitle.trim()) e.bookTitle = "Book title is required";
    if (!form.author.trim()) e.author = "Author name is required";
    if (!form.whyRestore.trim()) e.whyRestore = "Please tell us why this book matters";
    if (!form.submitterName.trim()) e.submitterName = "Your name is required";
    if (!form.submitterEmail.trim()) {
      e.submitterEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.submitterEmail.trim())) {
      e.submitterEmail = "Please enter a valid email";
    }
    if (form.bookTitle.length > 200) e.bookTitle = "Title must be under 200 characters";
    if (form.whyRestore.length > 1000) e.whyRestore = "Please keep under 1000 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    
    const { error } = await supabase.from("book_submissions").insert({
      book_title: form.bookTitle,
      author_name: form.author,
      year_published: form.yearPublished,
      language: form.language,
      category: form.category,
      why_restore: form.whyRestore,
      source_link: form.sourceLink,
      submitter_name: form.submitterName,
      submitter_email: form.submitterEmail,
      status: "pending",
    });

    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
      toast({ title: "Submission received!", description: "Thank you for helping us bring a book back to life." });
    }
    
    setSubmitting(false);
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border bg-card text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors";
  const errorInputClass = "border-destructive";
  const labelClass = "block text-sm font-medium text-foreground mb-1.5";

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 max-w-lg text-center">
          <div className="bg-card rounded-2xl p-10 border border-border shadow-sm">
            <CheckCircle className="w-16 h-16 text-accent mx-auto mb-6" />
            <h1 className="font-display text-3xl font-bold text-foreground mb-3">Thank You!</h1>
            <p className="text-muted-foreground leading-relaxed mb-2">
              We've received your submission for <strong className="text-foreground">"{form.bookTitle}"</strong> by {form.author}.
            </p>
            <p className="text-muted-foreground text-sm mb-8">
              Our team will review this book and assess its restoration potential. We'll notify you at <strong>{form.submitterEmail}</strong> if we proceed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => { setSubmitted(false); setForm(initialForm); }}>
                Submit Another Book
              </Button>
              <Button variant="outline" asChild>
                <a href="/bookstore">Browse Bookstore</a>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero">
        <div className="container mx-auto px-4 py-16 text-center">
          <Heart className="w-10 h-10 text-gold mx-auto mb-4" />
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-3">
            Bring a Book Back to Life
          </h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto text-lg">
            Know a forgotten masterpiece that deserves to be read again? Tell us about it and help us rediscover it for a new generation.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
          {[
            { icon: Send, title: "Submit", desc: "Tell us about a book that's been lost, forgotten, or out of print." },
            { icon: Sparkles, title: "We Review", desc: "Our editors assess restoration potential using AI and expert review." },
            { icon: BookOpen, title: "It Lives Again", desc: "The book is restored, formatted, and published for modern readers." },
          ].map((step) => (
            <div key={step.title}>
              <step.icon className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="font-display font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl p-8 md:p-10 border border-border shadow-sm">
            <h2 className="font-display text-2xl font-bold text-card-foreground mb-6">Submit a Book for Restoration</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Book Title *</label>
                  <input
                    type="text"
                    value={form.bookTitle}
                    onChange={(e) => update("bookTitle", e.target.value)}
                    placeholder="e.g. The Art of Worldly Wisdom"
                    className={`${inputClass} ${errors.bookTitle ? errorInputClass : "border-input"}`}
                    maxLength={200}
                  />
                  {errors.bookTitle && <p className="text-xs text-destructive mt-1">{errors.bookTitle}</p>}
                </div>
                <div>
                  <label className={labelClass}>Author *</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => update("author", e.target.value)}
                    placeholder="e.g. Baltasar Gracián"
                    className={`${inputClass} ${errors.author ? errorInputClass : "border-input"}`}
                    maxLength={150}
                  />
                  {errors.author && <p className="text-xs text-destructive mt-1">{errors.author}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className={labelClass}>Year Published</label>
                  <input
                    type="text"
                    value={form.yearPublished}
                    onChange={(e) => update("yearPublished", e.target.value)}
                    placeholder="e.g. 1647"
                    className={`${inputClass} border-input`}
                    maxLength={10}
                  />
                </div>
                <div>
                  <label className={labelClass}>Language</label>
                  <input
                    type="text"
                    value={form.language}
                    onChange={(e) => update("language", e.target.value)}
                    className={`${inputClass} border-input`}
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    className={`${inputClass} border-input`}
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Why should this book be restored? *</label>
                <textarea
                  value={form.whyRestore}
                  onChange={(e) => update("whyRestore", e.target.value)}
                  placeholder="Tell us why this book matters, its historical significance, or why readers would benefit from its restoration..."
                  rows={4}
                  className={`${inputClass} resize-none ${errors.whyRestore ? errorInputClass : "border-input"}`}
                  maxLength={1000}
                />
                <div className="flex justify-between mt-1">
                  {errors.whyRestore && <p className="text-xs text-destructive">{errors.whyRestore}</p>}
                  <p className="text-xs text-muted-foreground ml-auto">{form.whyRestore.length}/1000</p>
                </div>
              </div>

              <div>
                <label className={labelClass}>Source / Reference Link</label>
                <input
                  type="url"
                  value={form.sourceLink}
                  onChange={(e) => update("sourceLink", e.target.value)}
                  placeholder="e.g. https://archive.org/details/..."
                  className={`${inputClass} border-input`}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">Link to an archive, library catalogue, or Wikipedia page (optional)</p>
              </div>

              <div className="border-t border-border pt-5">
                <p className="text-sm font-medium text-foreground mb-4">Your Details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Your Name *</label>
                    <input
                      type="text"
                      value={form.submitterName}
                      onChange={(e) => update("submitterName", e.target.value)}
                      placeholder="Your full name"
                      className={`${inputClass} ${errors.submitterName ? errorInputClass : "border-input"}`}
                      maxLength={100}
                    />
                    {errors.submitterName && <p className="text-xs text-destructive mt-1">{errors.submitterName}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input
                      type="email"
                      value={form.submitterEmail}
                      onChange={(e) => update("submitterEmail", e.target.value)}
                      placeholder="you@example.com"
                      className={`${inputClass} ${errors.submitterEmail ? errorInputClass : "border-input"}`}
                      maxLength={255}
                    />
                    {errors.submitterEmail && <p className="text-xs text-destructive mt-1">{errors.submitterEmail}</p>}
                  </div>
                </div>
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full mt-2" disabled={submitting}>
                <Heart className="w-4 h-4 mr-2" /> {submitting ? "Submitting..." : "Submit for Restoration"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                We'll review your submission and get back to you. Your information is kept private.
              </p>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}