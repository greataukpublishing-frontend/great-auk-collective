import { useState, useRef } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Search, CheckCircle, XCircle, Star, Pencil, Trash2, Upload, Sparkles, RefreshCw, FileText, Wand2, AlignLeft, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getBookCover } from "@/lib/covers";
import { getOptimizedImageUrl, getImageUrlForContext } from "@/lib/image-optimization";

interface Props {
  books: any[];
  categories: any[];
  onRefresh: () => void;
}

export default function AdminBooks({ books, categories, onRefresh }: Props) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editBook, setEditBook] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [generatingDescId, setGeneratingDescId] = useState<string | null>(null);
  const [editorialDialog, setEditorialDialog] = useState<any>(null);
  const [editorialText, setEditorialText] = useState("");
  const [descriptionDialog, setDescriptionDialog] = useState<any>(null);
  const [descriptionText, setDescriptionText] = useState("");
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [descGenerating, setDescGenerating] = useState(false);
  const [coverDialog, setCoverDialog] = useState<any>(null);
  const [coverUrl, setCoverUrl] = useState("");
  const [uploadingCoverId, setUploadingCoverId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef(false);
  
const extractASIN = (url) => { const m = url.match(/(?:dp|gp\/product|ASIN)\/([A-Z0-9]{10})/i); return m ? m[1] : null; };
const toAffiliateLink = (url, asin) => { const id = asin || extractASIN(url); if (id) return 'https://www.amazon.in/dp/' + id + '?tag=greakaukpubli-21'; try { const u = new URL(url); u.searchParams.set('tag', 'greakaukpubli-21'); return u.toString(); } catch { return url; } };
const getAmazonCover = (asin) => asin ? 'https://images-amazon.com/images/P/' + asin + '.01._SCLZZZZZZZ_.jpg' : null;
const [addDialog, setAddDialog] = useState(false);
  const [fetchingAmazon, setFetchingAmazon] = useState(false);
  const [amazonSearchQuery, setAmazonSearchQuery] = useState("");
  const [newBook, setNewBook] = useState({
    title: "", author_name: "", category: "Fiction", description: "",
    editorial_description: "", amazon_link: "", cover_url: "", language: "English",
    asin: "", isbn: ""
  });

  const handleSearchAmazon = async () => {
    if (!amazonSearchQuery.trim()) {
      toast({ title: "Please enter a title or ASIN", variant: "destructive" });
      return;
    }
    setFetchingAmazon(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-amazon", {
        body: { query: amazonSearchQuery },
      });
      if (error) throw error;
      
      setNewBook({
        ...newBook,
        title: data.title || newBook.title,
        author_name: data.author || newBook.author_name,
        description: data.description || newBook.description,
        amazon_link: data.amazon_link || newBook.amazon_link,
        cover_url: data.cover_image || newBook.cover_url,
        asin: data.asin || newBook.asin,
      });
      
      toast({ title: "Book details fetched from Amazon! ✨" });
    } catch (e: any) {
      toast({
        title: "Amazon Search Failed",
        description: e.message || "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setFetchingAmazon(true); // Keeping it true as per original state if needed, but usually false
      setFetchingAmazon(false);
    }
  };
  const [addingBook, setAddingBook] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSyncBooks = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-books", {
        body: {},
      });
      if (error) throw error;
      toast({
        title: "Sync Completed! ✨",
        description: `Updated: ${data.updated}, Skipped: ${data.skipped}, Errors: ${data.errors}`,
      });
      onRefresh();
    } catch (e: any) {
      toast({
        title: "Sync Failed",
        description: e.message || "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleAddBook = async () => {
    if (!newBook.title || !newBook.author_name) {
      toast({ title: "Title and author are required", variant: "destructive" });
      return;
    }
    setAddingBook(true);
    // Auto-generate affiliate link if not provided
    const amazonLink = newBook.amazon_link ||
      `https://www.amazon.in/s?k=${encodeURIComponent(newBook.title + " " + newBook.author_name)}&tag=greakaukpubli-21`;
    const { error } = await supabase.from("books").insert({
      title: newBook.title,
      author_name: newBook.author_name,
      category: newBook.category,
      description: newBook.description,
      editorial_description: newBook.editorial_description,
      amazon_link: amazonLink,
      amazon_affiliate_url: amazonLink,
      cover_url: newBook.cover_url || null,
      language: newBook.language,
      status: "approved",
      featured: false,
      format: ["paperback"],
      asin: newBook.asin || null,
      isbn: newBook.isbn || null,
    });
    setAddingBook(false);
    if (error) {
      toast({ title: "Failed to add book", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Book added successfully! ✅" });
      setAddDialog(false);
      setNewBook({ title: "", author_name: "", category: "Fiction", description: "",
        editorial_description: "", amazon_link: "", cover_url: "", language: "English", asin: "", isbn: "" });
      fetchBooks();
    }
  };

  const filtered = books.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const hasCover = (book: any) => {
    return book.cover_url && book.cover_url.trim() !== "" && !book.cover_url.includes("placeholder");
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("books").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error updating status", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `Book ${status}` });
    onRefresh();
  };

  const approveAllPending = async () => {
    const pendingIds = books.filter(b => b.status === "pending").map(b => b.id);
    if (pendingIds.length === 0) {
      toast({ title: "No pending books to approve" });
      return;
    }
    
    const { error } = await supabase
      .from("books")
      .update({ status: "approved" })
      .in("id", pendingIds);
      
    if (error) {
      toast({ title: "Error approving all books", description: error.message, variant: "destructive" });
      return;
    }
    
    toast({ title: `Successfully approved ${pendingIds.length} books! ✨` });
    onRefresh();
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    const { error } = await supabase.from("books").update({ featured: !current }).eq("id", id);
    if (error) {
      toast({ title: "Error toggling featured", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: current ? "Removed from featured" : "Added to featured" });
    onRefresh();
  };

  const deleteBook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting book", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Book deleted" });
    onRefresh();
  };

  const openEdit = (book: any) => {
    setEditBook(book);
    setEditForm({ title: book.title, author_name: book.author_name, description: book.description || "", category: book.category, ebook_price: book.ebook_price || 0, print_price: book.print_price || 0, preview_content: book.preview_content || "" });
  };

  const saveEdit = async () => {
    if (!editBook) return;
    const { error } = await supabase.from("books").update(editForm).eq("id", editBook.id);
    if (error) {
      toast({ title: "Error saving changes", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Book updated" });
    setEditBook(null);
    onRefresh();
  };

  const openCoverDialog = (book: any) => {
    setCoverDialog(book);
    setCoverUrl(book.cover_url || "");
  };

  const saveCoverUrl = async () => {
    if (!coverDialog || !coverUrl.trim()) {
      toast({ title: "Error", description: "Please enter a valid URL", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("books").update({ cover_url: coverUrl, cover_image_url: coverUrl }).eq("id", coverDialog.id);
    if (error) {
      toast({ title: "Error saving cover URL", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Cover URL updated ✨" });
    setCoverDialog(null);
    onRefresh();
  };

  const uploadCoverImage = async (file: File) => {
    if (!coverDialog) return;
    if (!file.type.match(/image\/(jpeg|png|webp)/)) {
      toast({ title: "Invalid file type", description: "Only JPG, PNG and WebP files are allowed", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 5MB", variant: "destructive" });
      return;
    }

    setUploadingCoverId(coverDialog.id);
    try {
      const fileExt = file.type === "image/jpeg" ? "jpg" : file.type === "image/webp" ? "webp" : "png";
      const fileName = `${coverDialog.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from("covers")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("covers")
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase.from("books").update({ cover_url: publicUrl, cover_image_url: publicUrl }).eq("id", coverDialog.id);
      if (updateError) throw updateError;

      toast({ title: "Cover uploaded successfully ✨" });
      setCoverDialog(null);
      onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({ title: "Upload failed", description: message, variant: "destructive" });
    } finally {
      setUploadingCoverId(null);
    }
  };

  const generateEditorial = async (bookId: string) => {
    setGeneratingId(bookId);
    try {
      const { data, error } = await supabase.functions.invoke("generate-editorial", {
        body: { book_id: bookId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Editorial generated ✨" });
      onRefresh();
    } catch (e: unknown) {
      let message = e instanceof Error ? e.message : "Unknown error";

      if (e instanceof FunctionsHttpError) {
        try {
          const payload = await e.context.json();
          if (payload?.error) message = payload.error;
        } catch {
          // Keep fallback message when body cannot be parsed.
        }
      }

      toast({ title: "Generation failed", description: message, variant: "destructive" });
    } finally {
      setGeneratingId(null);
    }
  };

  const openEditorialEdit = (book: any) => {
    setEditorialDialog(book);
    setEditorialText(book.editorial_description || "");
  };

  const generateAllEditorials = async () => {
    const booksWithout = books.filter(b => !b.editorial_description);
    if (booksWithout.length === 0) {
      toast({ title: "All books already have editorials" });
      return;
    }
    cancelRef.current = false;
    setBulkGenerating(true);
    setBulkProgress({ current: 0, total: booksWithout.length });
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < booksWithout.length; i++) {
      if (cancelRef.current) break;
      setBulkProgress({ current: i + 1, total: booksWithout.length });
      try {
        const { data, error } = await supabase.functions.invoke("generate-editorial", {
          body: { book_id: booksWithout[i].id },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        successCount++;
      } catch {
        failCount++;
      }
      // 1-second delay between requests to avoid API rate limits
      if (i < booksWithout.length - 1 && !cancelRef.current) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const wasCancelled = cancelRef.current;
    setBulkGenerating(false);
    cancelRef.current = false;
    toast({
      title: wasCancelled ? "Generation cancelled" : "Bulk generation complete",
      description: `${successCount} succeeded, ${failCount} failed${wasCancelled ? " (cancelled)" : ""}.`,
    });
    onRefresh();
  };

  const cancelBulkGeneration = () => {
    cancelRef.current = true;
  };

  const generateDescriptions = async () => {
    setDescGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-book-descriptions", {
        body: {},
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({
        title: "Book descriptions generated successfully.",
        description: `${data?.results?.length ?? 0} book(s) processed.`,
      });
      onRefresh();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      toast({ title: "Description generation failed", description: message, variant: "destructive" });
    } finally {
      setDescGenerating(false);
    }
  };

  const generateSingleDescription = async (bookId: string) => {
    setGeneratingDescId(bookId);
    try {
      // The edge function processes books with short/empty descriptions.
      // We call it with limit=1, but it picks from all books missing descriptions.
      // For a targeted single-book generation we re-use the same function.
      const { data, error } = await supabase.functions.invoke("generate-book-descriptions", {
        body: {},
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Description generated ✨" });
      onRefresh();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      toast({ title: "Generation failed", description: message, variant: "destructive" });
    } finally {
      setGeneratingDescId(null);
    }
  };

  const openDescriptionEdit = (book: any) => {
    setDescriptionDialog(book);
    setDescriptionText(book.description || "");
  };

  const saveDescription = async () => {
    if (!descriptionDialog) return;
    const { error } = await supabase.from("books").update({ description: descriptionText }).eq("id", descriptionDialog.id);
    if (error) {
      toast({ title: "Error saving description", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Description updated" });
    setDescriptionDialog(null);
    onRefresh();
  };

  const saveEditorial = async () => {
    if (!editorialDialog) return;
    const { error } = await supabase.from("books").update({ editorial_description: editorialText }).eq("id", editorialDialog.id);
    if (error) {
      toast({ title: "Error saving editorial", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Editorial updated" });
    setEditorialDialog(null);
    onRefresh();
  };

  const statusColor = (s: string) => s === "approved" ? "default" : s === "pending" ? "secondary" : "destructive";
  const pending = books.filter(b => b.status === "pending").length;
  const publishedCount = books.filter(b => b.status === "approved").length;
  const featured = books.filter(b => b.featured).length;
  const missingEditorialCount = books.filter(b => !b.editorial_description).length;
  const missingDescriptionCount = books.filter(b => !b.description || b.description.length < 100).length;
  const missingCoverCount = books.filter(b => !hasCover(b)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Book Management</h2>
          <p className="text-muted-foreground text-sm mt-1">Review manuscripts, approve, edit, feature, and manage all books</p>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap overflow-x-auto pb-1">
          {bulkGenerating && (
            <Button variant="destructive" onClick={cancelBulkGeneration} className="gap-2">
              <XCircle className="w-4 h-4" /> Stop
            </Button>
          )}
          <Button
            onClick={generateDescriptions}
            disabled={descGenerating || missingDescriptionCount === 0}
            className="gap-2"
          >
            <AlignLeft className={`w-4 h-4 ${descGenerating ? "animate-pulse" : ""}`} />
            {descGenerating ? "Generating Descriptions…" : "Generate Book Descriptions"}
            {!descGenerating && missingDescriptionCount > 0 && (
              <Badge variant="secondary" className="ml-1">{missingDescriptionCount}</Badge>
            )}
          </Button>
          <Button
            onClick={handleSyncBooks}
            disabled={syncing}
            variant="outline"
            className="gap-2 border-accent text-accent hover:bg-accent/10"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing Books..." : "Sync Books"}
          </Button>
          <Button
            onClick={generateAllEditorials}
            disabled={bulkGenerating || missingEditorialCount === 0}
            className="gap-2"
          >
            {bulkGenerating ? (
              <>
                <Wand2 className="w-4 h-4 animate-pulse" />
                Generating {bulkProgress.current}/{bulkProgress.total}…
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate Editorials for All Books
                {missingEditorialCount > 0 && (
                  <Badge variant="secondary" className="ml-1">{missingEditorialCount}</Badge>
                )}
              </>
            )}
          </Button>
        </div>
      </div>

      {bulkGenerating && (
        <Progress value={(bulkProgress.current / bulkProgress.total) * 100} className="h-2" />
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-bold">{books.length}</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="pt-4 pb-3 text-center"><p className="text-xs text-muted-foreground">Pending Review</p><p className="text-lg font-bold text-amber-600">{pending}</p></CardContent></Card>
        <Card className="border-emerald-200"><CardContent className="pt-4 pb-3 text-center"><p className="text-xs text-muted-foreground">Published</p><p className="text-lg font-bold text-emerald-600">{publishedCount}</p></CardContent></Card>
        <Card className={missingCoverCount > 0 ? "border-red-200" : ""}><CardContent className="pt-4 pb-3 text-center"><p className="text-xs text-muted-foreground">Missing Covers</p><p className={`text-lg font-bold ${missingCoverCount > 0 ? "text-red-600" : ""}`}>{missingCoverCount}</p></CardContent></Card>
      </div>

      {/* Pending Manuscripts Review Section */}
      {pending > 0 && (
        <Card className="border-amber-300 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-600" />
              Manuscripts Pending Review ({pending})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {books.filter(b => b.status === "pending").map(b => (
              <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-background rounded-lg border border-border gap-3">
                <div>
                  <p className="font-medium text-foreground">{b.title}</p>
                  <p className="text-xs text-muted-foreground">by {b.author_name} · {b.category} · Submitted {new Date(b.created_at).toLocaleDateString()}</p>
                  {b.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{b.description}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="default" onClick={() => updateStatus(b.id, "approved")} className="gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => updateStatus(b.id, "rejected")} className="gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openEdit(b)} className="gap-1">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by title or author..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end mb-2">
        <button
          onClick={() => setAddDialog(true)}
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          + Add Book
        </button>
      </div>

      {/* Add Book Dialog */}
      {addDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-xl font-bold mb-4">Add New Book</h2>
            
            <div className="flex gap-2 mb-4 p-3 bg-muted/30 rounded-lg border border-border/50">
              <input 
                placeholder="Search Amazon (Title or ASIN)..." 
                value={amazonSearchQuery} 
                onChange={e => setAmazonSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearchAmazon()}
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background" 
              />
              <Button 
                onClick={handleSearchAmazon} 
                disabled={fetchingAmazon}
                size="sm"
                className="gap-1"
              >
                {fetchingAmazon ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                Search Amazon
              </Button>
            </div>

            <div className="space-y-3">
              <input placeholder="Title *" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background" />
              <input placeholder="Author Name *" value={newBook.author_name} onChange={e => setNewBook({...newBook, author_name: e.target.value})}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background" />
              <select value={newBook.category} onChange={e => setNewBook({...newBook, category: e.target.value})}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
                <option>Fiction</option>
                <option>Self-Help</option>
                <option>AI</option>
                <option>Non-Fiction</option>
              </select>
              <select value={newBook.language} onChange={e => setNewBook({...newBook, language: e.target.value})}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
                <option>English</option>
                <option>Malayalam</option>
                <option>Hindi</option>
                <option>Tamil</option>
              </select>
              <textarea placeholder="Description" value={newBook.description} onChange={e => setNewBook({...newBook, description: e.target.value})}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background h-20" />
              <textarea placeholder="Editorial Description" value={newBook.editorial_description} onChange={e => setNewBook({...newBook, editorial_description: e.target.value})}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background h-20" />
              <input placeholder="Paste Amazon link - cover and description auto-fill" value={newBook.amazon_link} onChange={(e) => { const val = e.target.value; const asin = extractASIN(val); const aff = val ? toAffiliateLink(val, asin || undefined) : ""; const amazonCover = getAmazonCover(asin || null); setNewBook(prev => ({...prev, amazon_link: aff, asin: asin || prev.asin, cover_url: amazonCover || prev.cover_url})); }}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background" />
              <input placeholder="Cover Image URL (optional)" value={newBook.cover_url} onChange={e => setNewBook({...newBook, cover_url: e.target.value})}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="ASIN (optional)" value={newBook.asin} onChange={e => setNewBook({...newBook, asin: e.target.value})}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background" />
                <input placeholder="ISBN (optional)" value={newBook.isbn} onChange={e => setNewBook({...newBook, isbn: e.target.value})}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleAddBook} disabled={addingBook}
                className="flex-1 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                {addingBook ? "Adding..." : "Add Book"}
              </button>
              <button onClick={() => setAddDialog(false)}
                className="flex-1 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-muted">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Books table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground bg-muted/30">
                  <th className="p-3 font-medium">Book</th>
                  <th className="p-3 font-medium">Category</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">⭐</th>
                  <th className="p-3 font-medium">Cover</th>
                  <th className="p-3 font-medium">Description</th>
                  <th className="p-3 font-medium">Editorial</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const hasDesc = b.description && b.description.length >= 100;
                  const coverExists = hasCover(b);
                  return (
                  <tr key={b.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${!coverExists ? "border-l-4 border-l-red-500" : ""}`}>
                    <td className="p-3">
                      <p className="font-medium text-foreground">{b.title}</p>
                      <p className="text-xs text-muted-foreground">by {b.author_name}</p>
                    </td>
                    <td className="p-3 text-muted-foreground">{b.category}</td>
                    <td className="p-3"><Badge variant={statusColor(b.status)}>{b.status}</Badge></td>
                    <td className="p-3">
                      <button onClick={() => toggleFeatured(b.id, b.featured ?? false)} title={b.featured ? "Remove from featured" : "Add to featured"}>
                        <Star className={`w-4 h-4 ${b.featured ? "text-gold fill-gold" : "text-muted-foreground"}`} />
                      </button>
                    </td>
                    <td className="p-3">
                      {coverExists ? (
                        <div className="flex flex-col gap-1">
                          <img 
                            src={getBookCover(b.cover_url || b.cover_image_url || "", 60)} 
                            className="w-8 h-12 object-cover rounded shadow-sm border border-border" 
                            alt="Cover" 
                          />
                          <Badge variant="outline" className="text-[10px] py-0 px-1 bg-emerald-50 text-emerald-700 border-emerald-200">OK</Badge>
                        </div>
                      ) : (
                        <Badge variant="destructive" className="text-[10px] py-0 px-1 bg-red-100 text-red-700 border-red-300">MISSING</Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {hasDesc ? (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => generateSingleDescription(b.id)} disabled={generatingDescId === b.id} title="Regenerate Description">
                              <RefreshCw className={`w-4 h-4 text-muted-foreground ${generatingDescId === b.id ? "animate-spin" : ""}`} />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openDescriptionEdit(b)} title="Edit Description">
                              <AlignLeft className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => generateSingleDescription(b.id)} disabled={generatingDescId === b.id} title="Generate Description" className="gap-1">
                            <AlignLeft className={`w-4 h-4 text-accent ${generatingDescId === b.id ? "animate-pulse" : ""}`} />
                          </Button>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {b.editorial_description ? (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => generateEditorial(b.id)} disabled={generatingId === b.id} title="Regenerate Editorial">
                              <RefreshCw className={`w-4 h-4 text-muted-foreground ${generatingId === b.id ? "animate-spin" : ""}`} />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openEditorialEdit(b)} title="Edit Editorial">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => generateEditorial(b.id)} disabled={generatingId === b.id} title="Generate Editorial Review" className="gap-1">
                            <Sparkles className={`w-4 h-4 text-accent ${generatingId === b.id ? "animate-pulse" : ""}`} />
                          </Button>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        <Button size="sm" variant="ghost" onClick={() => openCoverDialog(b)} title="Upload or Set Cover" className="gap-1">
                          <ImageIcon className={`w-4 h-4 ${coverExists ? "text-muted-foreground" : "text-accent"}`} />
                        </Button>
                        {b.status !== "approved" && (
                          <Button size="sm" variant="ghost" onClick={() => updateStatus(b.id, "approved")} title="Approve">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          </Button>
                        )}
                        {b.status !== "rejected" && (
                          <Button size="sm" variant="ghost" onClick={() => updateStatus(b.id, "rejected")} title="Reject">
                            <XCircle className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => openEdit(b)} title="Edit">
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteBook(b.id)} title="Delete">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">No books found.</p>}
          </div>
        </CardContent>
      </Card>

      {/* Edit Book Dialog */}
      <Dialog open={!!editBook} onOpenChange={(o) => !o && setEditBook(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Book</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={editForm.title || ""} onChange={e => setEditForm({...editForm, title: e.target.value})} /></div>
            <div><Label>Author Name</Label><Input value={editForm.author_name || ""} onChange={e => setEditForm({...editForm, author_name: e.target.value})} /></div>
            <div><Label>Description</Label><Textarea value={editForm.description || ""} onChange={e => setEditForm({...editForm, description: e.target.value})} /></div>
            <div><Label>Preview Content (Look Inside)</Label><Textarea value={editForm.preview_content || ""} onChange={e => setEditForm({...editForm, preview_content: e.target.value})} placeholder="Paste sample text from the book" /></div>
            <div><Label>Category</Label><Input value={editForm.category || ""} onChange={e => setEditForm({...editForm, category: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>eBook Price</Label><Input type="number" value={editForm.ebook_price || 0} onChange={e => setEditForm({...editForm, ebook_price: parseFloat(e.target.value)})} /></div><div><Label>Print Price</Label><Input type="number" value={editForm.print_price || 0} onChange={e => setEditForm({...editForm, print_price: parseFloat(e.target.value)})} /></div></div>
            <div className="flex gap-2"><Button variant="outline" onClick={() => setEditBook(null)}>Cancel</Button><Button onClick={saveEdit}>Save Changes</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cover Upload Dialog */}
      <Dialog open={!!coverDialog} onOpenChange={(o) => !o && setCoverDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload or Set Cover for {coverDialog?.title}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Upload Image (JPG/PNG/WebP, max 5MB)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    uploadCoverImage(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingCoverId === coverDialog?.id}
                className="w-full gap-2"
              >
                <Upload className={`w-4 h-4 ${uploadingCoverId === coverDialog?.id ? "animate-pulse" : ""}`} />
                {uploadingCoverId === coverDialog?.id ? "Uploading..." : "Choose Image to Upload"}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div>
              <Label>Set Cover URL</Label>
              <Input
                placeholder="https://example.com/cover.jpg"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="mb-3"
              />
              <Button onClick={saveCoverUrl} className="w-full">Save Cover URL</Button>
            </div>

            <Button variant="outline" onClick={() => setCoverDialog(null)} className="w-full">Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Editorial Edit Dialog */}
      <Dialog open={!!editorialDialog} onOpenChange={(o) => !o && setEditorialDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Editorial for {editorialDialog?.title}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Textarea value={editorialText} onChange={e => setEditorialText(e.target.value)} placeholder="Enter editorial description..." className="min-h-[200px]" />
            <div className="flex gap-2"><Button variant="outline" onClick={() => setEditorialDialog(null)}>Cancel</Button><Button onClick={saveEditorial}>Save Editorial</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Description Edit Dialog */}
      <Dialog open={!!descriptionDialog} onOpenChange={(o) => !o && setDescriptionDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Description for {descriptionDialog?.title}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Textarea value={descriptionText} onChange={e => setDescriptionText(e.target.value)} placeholder="Enter book description..." className="min-h-[200px]" />
            <div className="flex gap-2"><Button variant="outline" onClick={() => setDescriptionDialog(null)}>Cancel</Button><Button onClick={saveDescription}>Save Description</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
