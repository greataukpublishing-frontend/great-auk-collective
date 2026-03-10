import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function EditBookPage() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [description,setDescription] = useState("")
  const [price,setPrice] = useState("")
  const [category,setCategory] = useState("")
  const [previewContent,setPreviewContent] = useState("")
  const [manuscript,setManuscript] = useState<File|null>(null)
  const [cover,setCover] = useState<File|null>(null)

  const [loading,setLoading] = useState(true)
  const [saving,setSaving] = useState(false)

  useEffect(()=>{
    if(id) loadBook()
  },[id])

  async function loadBook(){

    const {data,error} = await supabase
      .from("books")
      .select("*")
      .eq("id",id)
      .single()

    if(error){
      alert("Book not found")
      navigate("/author-dashboard")
      return
    }

    setDescription(data.description || "")
    setPrice(String(data.ebook_price || ""))
    setCategory(data.category || "")
    setPreviewContent(data.preview_content || "")
    setLoading(false)
  }

  async function saveChanges(){

    const confirmEdit = window.confirm(
      "After editing, your book will go to review again. Continue?"
    )

    if(!confirmEdit) return

    setSaving(true)

    let manuscriptUrl = null
    let coverUrl = null

    // upload manuscript
    if(manuscript){

      const filePath = `manuscripts/${Date.now()}_${manuscript.name}`

      const {error} = await supabase.storage
        .from("manuscripts")
        .upload(filePath,manuscript)

      if(error){
        alert("Manuscript upload failed")
        setSaving(false)
        return
      }

      const {data} = supabase.storage
        .from("manuscripts")
        .getPublicUrl(filePath)

      manuscriptUrl = data.publicUrl
    }

    // upload cover
    if(cover){

      const filePath = `covers/${Date.now()}_${cover.name}`

      const {error} = await supabase.storage
        .from("covers")
        .upload(filePath,cover)

      if(error){
        alert("Cover upload failed")
        setSaving(false)
        return
      }

      const {data} = supabase.storage
        .from("covers")
        .getPublicUrl(filePath)

      coverUrl = data.publicUrl
    }

    const updateData:any = {
      description,
      ebook_price:price,
      category,
      preview_content: previewContent || null,
      status:"pending_review"
    }

    if(manuscriptUrl){
      updateData.manuscript_url = manuscriptUrl
    }

    if(coverUrl){
      updateData.cover_url = coverUrl
    }

    const {error} = await supabase
      .from("books")
      .update(updateData)
      .eq("id",id)

    if(error){
      alert("Error saving changes")
      setSaving(false)
      return
    }

    alert("Changes submitted for review")
    navigate("/author-dashboard")
  }

  if(loading){
    return(
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  return(

    <div className="min-h-screen bg-background">

      <Navbar/>

      <div className="container mx-auto px-4 py-10 max-w-3xl">

        <Link
          to="/author-dashboard"
          className="inline-flex items-center gap-2 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4"/>
          Back to Dashboard
        </Link>

        <div className="bg-card border rounded-xl shadow-sm p-8">

          <div className="flex items-center justify-between mb-8">

            <h1 className="text-3xl font-bold">
              Edit Book
            </h1>

            <Button
              onClick={saveChanges}
              disabled={saving}
            >
              {saving ? "Saving..." : "Submit for Review"}
            </Button>

          </div>

          <div className="space-y-6">

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>

              <textarea
                rows={6}
                value={description}
                onChange={(e)=>setDescription(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Ebook Price
              </label>

              <input
                type="number"
                value={price}
                onChange={(e)=>setPrice(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Category
              </label>

              <input
                value={category}
                onChange={(e)=>setCategory(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Upload New Manuscript (PDF)
              </label>

              <input
                type="file"
                accept=".pdf"
                onChange={(e)=>setManuscript(e.target.files?.[0] || null)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Upload New Cover
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e)=>setCover(e.target.files?.[0] || null)}
                className="w-full"
              />
            </div>

          </div>

        </div>

      </div>

      <Footer/>

    </div>
  )
}
