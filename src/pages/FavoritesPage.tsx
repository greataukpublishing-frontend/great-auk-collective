import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Link } from "react-router-dom"

export default function FavoritesPage() {

  const [favorites, setFavorites] = useState<any[]>([])
  const [userFavorites, setUserFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  async function loadFavorites() {

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("favorites")
      .select(`
        id,
        book_id,
        books (
          id,
          title,
          cover_url,
          ebook_price,
          print_price
        )
      `)
      .eq("user_id", user.id)

    if (!error && data) {
      setFavorites(data)
      setUserFavorites(data.map(f => f.book_id))
    }

    setLoading(false)
  }

  async function toggleFavorite(bookId: string) {

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert("Please login to favorite books ❤️")
      return
    }

    const isFavorited = userFavorites.includes(bookId)

    if (isFavorited) {

      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("book_id", bookId)

      setUserFavorites(prev => prev.filter(id => id !== bookId))
      setFavorites(prev => prev.filter(f => f.book_id !== bookId))

    } else {

      const { data } = await supabase
        .from("favorites")
        .insert({
          user_id: user.id,
          book_id: bookId
        })
        .select(`
          id,
          book_id,
          books (
            id,
            title,
            cover_url,
            price,
            ebook_price,
            print_price
          )
        `)
        .single()

      if (data) {
        setFavorites(prev => [...prev, data])
        setUserFavorites(prev => [...prev, bookId])
      }

    }

  }

  return (
    <div className="container mx-auto px-6 py-12">

      <h1 className="text-4xl font-semibold text-[#1E392A] mb-10">
        My Favorites
      </h1>

      {loading && <p>Loading your favorites...</p>}

      {!loading && favorites.length === 0 && (

        <div className="text-center py-20">

          <h2 className="text-2xl text-[#1E392A] mb-4">
            ❤️ You have no favorites yet
          </h2>

          <p className="text-gray-600 mb-6">
            Browse the bookstore to add books you love.
          </p>

          <Link
            to="/bookstore"
            className="px-6 py-3 rounded-full bg-[#1E392A] text-white hover:bg-green-800 transition"
          >
            Go to Bookstore
          </Link>

        </div>

      )}

      {favorites.length > 0 && (

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

          {favorites.map((fav) => {

            const book = fav.books

            const price =
              book.price ||
              book.ebook_price ||
              book.print_price ||
              0

            return (

              <div
                key={fav.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
              >

                <Link to={`/book/${book.id}`}>
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-full h-72 object-cover"
                  />
                </Link>

                <div className="p-4">

                  <Link to={`/book/${book.id}`}>
                    <h3 className="font-semibold text-[#1E392A] line-clamp-2">
                      {book.title}
                    </h3>
                  </Link>

                  <p className="text-[#EAB333] font-medium mt-2">
                    ${price}
                  </p>

                  {/* HEART BUTTON */}
                  <button
                    onClick={() => toggleFavorite(book.id)}
                    className="mt-4 text-2xl"
                  >
                    {userFavorites.includes(book.id) ? "❤️" : "🤍"}
                  </button>

                </div>

              </div>

            )

          })}

        </div>

      )}

    </div>
  )
}
