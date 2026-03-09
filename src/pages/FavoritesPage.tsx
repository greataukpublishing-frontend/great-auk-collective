import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"

export default function FavoritesPage() {

  const [favorites, setFavorites] = useState<any[]>([])

  useEffect(() => {
    loadFavorites()
  }, [])

  async function loadFavorites() {

    const { data, error } = await supabase
      .from("favorites")
      .select(`
        id,
        books (
          id,
          title,
          cover_url,
          price
        )
      `)

    if (!error && data) {
      setFavorites(data)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">
        My Favorites ❤️
      </h1>

      {favorites.length === 0 && (
        <p>No favorite books yet.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {favorites.map((fav) => (
          <div key={fav.id} className="border rounded-lg p-4">

            <img
              src={fav.books.cover_url}
              alt={fav.books.title}
              className="w-full h-48 object-cover rounded"
            />

            <h2 className="font-semibold mt-2">
              {fav.books.title}
            </h2>

            <p className="text-sm text-muted-foreground">
              ${fav.books.price}
            </p>

          </div>
        ))}
      </div>

    </div>
  )
}
