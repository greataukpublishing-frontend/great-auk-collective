# Supabase Edge Function: fetch-isbn

This Supabase Edge Function is designed to fetch ISBNs for books that are missing them in your `public.books` table. It uses the Google Books API to search for books based on their title and author, and then extracts ISBN_13 (preferentially) or ISBN_10 from the API response.

## Setup

1.  **Google Books API Key**: You need a Google Books API key. If you don't have one, you can obtain it from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

2.  **Supabase Environment Variable**: Set your Google Books API key as a Supabase secret. You can do this via the Supabase UI or the Supabase CLI:

    ```bash
    supabase secrets set GOOGLE_BOOKS_API_KEY="YOUR_GOOGLE_BOOKS_API_KEY"
    ```

    Replace `YOUR_GOOGLE_BOOKS_API_KEY` with your actual API key.

## Deployment

To deploy this function to your Supabase project, navigate to the `great-auk-collective/supabase` directory in your terminal and run the following command:

```bash
supabase functions deploy fetch-isbn --no-verify-jwt
```

The `--no-verify-jwt` flag is used because this function will be invoked directly and does not require JWT verification for this specific use case.

## Usage

Once deployed, you can invoke this function. It will automatically fetch all books from your `public.books` table where the `isbn` column is `NULL`, attempt to find their ISBNs using the Google Books API, and update the `isbn` column in your database. Existing ISBN values will not be overwritten.

You can invoke the function using the Supabase CLI:

```bash
supabase functions invoke fetch-isbn
```

Alternatively, you can invoke it via an HTTP request to your Supabase Edge Function endpoint. The endpoint URL will be provided after successful deployment.

### Expected Output

The function will return a JSON object with the following structure:

```json
{
  "totalBooks": 37,
  "booksWithIsbn": 20,
  "booksMissingIsbn": 17,
  "updatedBooks": [
    { "id": "book-id-1", "title": "Book Title 1", "isbn": "978-1234567890" },
    { "id": "book-id-2", "title": "Book Title 2", "isbn": "978-0987654321" }
  ]
}
```

This output will help you verify which books were updated and how many still remain without an ISBN. 
