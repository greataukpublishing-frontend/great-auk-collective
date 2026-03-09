import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"

export default function EditBookPage() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (id) loadBook()
  }, [id])

  async function loadBook() {

    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      alert("Book not found")
      navigate("/author-dashboard")
      return
    }

    setTitle(data.title)
    setDescription(data.description)
  }

  async function saveChanges() {

    const confirmEdit = window.confirm(
      "Are you sure? Your book will go to review again."
    )

    if (!confirmEdit) return

    const { error } = await supabase
      .from("books")
      .update({
        title,
        description,
        status: "pending_review"
      })
      .eq("id", id)

    if (error) {
      alert("Error saving changes")
      return
    }

    alert("Changes submitted for review")

    navigate("/author-dashboard")
  }

  return (
    <div>

      <h1>Edit Book</h1>

      <input
        value={title}
        onChange={(e)=>setTitle(e.target.value)}
      />

      <textarea
        value={description}
        onChange={(e)=>setDescription(e.target.value)}
      />

      <button onClick={saveChanges}>
        Save Changes
      </button>

    </div>
  )
}
