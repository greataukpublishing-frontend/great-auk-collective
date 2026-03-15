import requests
import json

# Configuration
SUPABASE_URL = "https://sfavqiavyencubhbbyht.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmYXZxaWF2eWVuY3ViaGJieWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTQyNTUsImV4cCI6MjA4ODU3MDI1NX0.mQRPS_MVnK64PC1m-CIzY0kEDbRuWDG4jgCb8BAbE68"

SUPABASE_HEADERS = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def get_all_books():
    """Fetches all books from Supabase."""
    books = []
    offset = 0
    limit = 1000  # Supabase default limit
    while True:
        fetch_url = f"{SUPABASE_URL}/rest/v1/books?select=*&offset={offset}&limit={limit}"
        try:
            response = requests.get(fetch_url, headers=SUPABASE_HEADERS)
            response.raise_for_status()
            data = response.json()
            if not data:
                break
            books.extend(data)
            offset += limit
        except requests.exceptions.RequestException as e:
            print(f"Error fetching books: {e}")
            return None
    return books

def calculate_completeness_score(book):
    """Calculates a score based on the completeness of book data."""
    score = 0
    if book.get("cover_url") and book["cover_url"] not in ["", "null"]:
        score += 1
    if book.get("description") and book["description"] not in ["", "null"]:
        score += 1
    if book.get("editorial_description") and book["editorial_description"] not in ["", "null"]:
        score += 1
    if book.get("amazon_link") and book["amazon_link"] not in ["", "null"]:
        score += 1
    return score

def delete_book(book_id, title):
    """Deletes a book from Supabase by ID."""
    delete_url = f"{SUPABASE_URL}/rest/v1/books?id=eq.{book_id}"
    try:
        response = requests.delete(delete_url, headers=SUPABASE_HEADERS)
        response.raise_for_status()
        print(f"DELETED: {title} (ID: {book_id})")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error deleting book {title} (ID: {book_id}): {e}")
        return False

def main():
    print("Starting duplicate book fixer...")
    books = get_all_books()
    if books is None:
        print("Failed to retrieve books. Exiting.")
        return

    print(f"Fetched {len(books)} books.")

    # Group books by title (case-insensitive)
    books_by_title = {}
    for book in books:
        title = book.get("title")
        if title:
            normalized_title = title.strip().lower()
            if normalized_title not in books_by_title:
                books_by_title[normalized_title] = []
            books_by_title[normalized_title].append(book)

    deleted_count = 0
    for normalized_title, duplicate_books in books_by_title.items():
        if len(duplicate_books) > 1:
            print(f"\nFound duplicates for title: {duplicate_books[0].get('title')}")
            # Sort by completeness score (descending) and then by ID (ascending for consistent tie-breaking)
            duplicate_books.sort(key=lambda x: (calculate_completeness_score(x), x.get('id')), reverse=True)

            # Keep the first (most complete) book
            book_to_keep = duplicate_books[0]
            print(f"Keeping: {book_to_keep.get('title')} (ID: {book_to_keep.get('id')}) - Score: {calculate_completeness_score(book_to_keep)}")

            # Delete the rest
            for i in range(1, len(duplicate_books)):
                book_to_delete = duplicate_books[i]
                if delete_book(book_to_delete.get("id"), book_to_delete.get("title")):
                    deleted_count += 1

    print(f"\nDuplicate fixing complete. Total books deleted: {deleted_count}")

if __name__ == "__main__":
    main()
