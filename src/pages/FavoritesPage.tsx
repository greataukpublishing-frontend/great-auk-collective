import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"

export default function FavoritesPage() {

  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

    setLoading(false)
  }

  async function removeFavorite(id: string) {

    await supabase
      .from("favorites")
      .delete()
      .eq("id", id)

    setFavorites(favorites.filter((fav) => fav.id !== id))
  }

  return (
    <div className="max-w-6xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-8">
        My Favorites ❤️
      </h1>

      {loading && (
        <p>Loading favorites...</p>
      )}

      {!loading && favorites.length === 0 && (
        <p>No favorite books yet.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

        {favorites.map((fav) => {

          const book = fav.books

          return (
            <div
              key={fav.id}
              className="border rounded-lg p-4 hover:shadow-lg transition bg-white"
            >

              <img
                src={book.cover_url}
                alt={book.title}
                className="w-full h-48 object-cover rounded"
              />

              <h2 className="font-semibold mt-3 line-clamp-2">
                {book.title}
              </h2>

              <p className="text-sm text-muted-foreground mt-1">
                ${book.price}
              </p>

              <div className="flex gap-2 mt-4">

                <button
                  className="flex-1 bg-black text-white text-sm py-1 rounded hover:bg-gray-800"
                >
                  Add to Cart
                </button>

                <button
                  onClick={() => removeFavorite(fav.id)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>

              </div>

            </div>
          )
        })}

      </div>

    </div>
  )
}
