
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const GOOGLE_BOOKS_API_KEY = Deno.env.get("GOOGLE_BOOKS_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { "x-supabase-client": "supabase-functions" } } }
    );

    // Fetch books with missing ISBNs
    const { data: books, error: fetchError } = await supabaseClient
      .from("books")
      .select("id, title, author_name")
      .is("isbn", null);

    if (fetchError) {
      console.error("Error fetching books:", fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    let booksWithIsbn = 0;
    const totalBooks = books.length;
    const updatedBooks = [];

    for (const book of books) {
      const query = `q=intitle:${encodeURIComponent(book.title)}+inauthor:${encodeURIComponent(book.author_name)}`;
      const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?${query}&key=${GOOGLE_BOOKS_API_KEY}`;

      const response = await fetch(googleBooksUrl);
      const data = await response.json();

      let isbn: string | null = null;

      if (data.items && data.items.length > 0) {
        for (const item of data.items) {
          const industryIdentifiers = item.volumeInfo?.industryIdentifiers;
          if (industryIdentifiers) {
            const isbn13 = industryIdentifiers.find((id: any) => id.type === "ISBN_13")?.identifier;
            const isbn10 = industryIdentifiers.find((id: any) => id.type === "ISBN_10")?.identifier;

            if (isbn13) {
              isbn = isbn13;
              break;
            } else if (isbn10) {
              isbn = isbn10;
              break;
            }
          }
        }
      }

      if (isbn) {
        const { error: updateError } = await supabaseClient
          .from("books")
          .update({ isbn: isbn })
          .eq("id", book.id);

        if (updateError) {
          console.error(`Error updating ISBN for book ${book.id}:`, updateError);
        } else {
          booksWithIsbn++;
          updatedBooks.push({ id: book.id, title: book.title, isbn: isbn });
        }
      }
    }

    const booksMissingIsbn = totalBooks - booksWithIsbn;

    return new Response(JSON.stringify({
      totalBooks: totalBooks,
      booksWithIsbn: booksWithIsbn,
      booksMissingIsbn: booksMissingIsbn,
      updatedBooks: updatedBooks,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
