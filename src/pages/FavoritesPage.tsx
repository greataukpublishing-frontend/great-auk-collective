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
    <div className="max-w-6xl mx-auto px-6 py-10">

      <h1 className="text-3xl font-bold text-foreground mb-8">
        My Favorites ❤️
      </h1>

      {loading && (
        <p>Loading favorites...</p>
      )}

      {!loading && favorites.length === 0 && (
        <p className="text-muted-foreground">
          You haven't added any favorites yet.
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

        {favorites.map((fav) => {

          const book = fav.books

          return (
            <div
              key={fav.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
            >

              <img
                src={book.cover_url}
                alt={book.title}
                className="w-full h-56 object-cover"
              />

              <div className="p-4">

                <h2 className="font-semibold text-lg line-clamp-2">
                  {book.title}
                </h2>

                <p className="text-sm text-muted-foreground mt-1">
                  ${book.price}
                </p>

                <div className="flex gap-2 mt-4">

                  <button className="flex-1 bg-primary text-white text-sm py-2 rounded-lg hover:opacity-90">
                    Add to Cart
                  </button>

                  <button
                    onClick={() => removeFavorite(fav.id)}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>

                </div>

              </div>

            </div>
          )
        })}

      </div>

    </div>
  )
}
