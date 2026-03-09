import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Link } from "react-router-dom"

export default function FavoritesPage() {

  const [favorites, setFavorites] = useState([])
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

  async function removeFavorite(id) {
    await supabase
      .from("favorites")
      .delete()
      .eq("id", id)

    setFavorites(favorites.filter((fav) => fav.id !== id))
  }

  return (
    <div className="container mx-auto px-4 py-12 font-sans">

      <h1 className="text-4xl font-semibold text-[#1E392A] mb-10 tracking-tight">
        My Favorites
      </h1>

      {loading && <p className="text-gray-600">Loading your cherished books...</p>}

      {!loading && favorites.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-lg shadow-inner">
          <div className="text-6xl mb-6">✨</div>
          <h2 className="text-2xl font-medium text-[#1E392A] mb-3">
            Your favorites shelf is empty
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Discover captivating stories and add them to your personal collection.
          </p>
          <Link
            to="/bookstore"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-[#1E392A] hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EAB333] transition-colors duration-200"
          >
            Explore the Bookstore
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

        {favorites.map((fav) => {
          const book = fav.books
          return (
            <div
              key={fav.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100"
            >
              <Link to={`/book/${book.id}`}>
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full h-72 object-cover rounded-t-xl"
                />
              </Link>
              <div className="p-5">
                <Link to={`/book/${book.id}`} className="block">
                  <h2 className="font-semibold text-xl text-[#1E392A] leading-tight line-clamp-2 hover:text-green-700 transition-colors duration-200">
                    {book.title}
                  </h2>
                </Link>
                <p className="text-lg text-[#EAB333] font-medium mt-2">
                  ${book.price}
                </p>
                <div className="flex flex-col space-y-3 mt-5">
                  <button
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-[#1E392A] bg-[#EAB333] hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EAB333] transition-colors duration-200"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeFavorite(fav.id)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors duration-200"
                  >
                    Remove from Favorites
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
