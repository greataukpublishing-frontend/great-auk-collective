import requests
import time

# Configuration
GOOGLE_BOOKS_API_KEY = "AIzaSyBD8K_FY-9syPHPWWSJNTiWpHNOnDtKJJs"
SUPABASE_URL = "https://sfavqiavyencubhbbyht.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmYXZxaWF2eWVuY3ViaGJieWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTQyNTUsImV4cCI6MjA4ODU3MDI1NX0.mQRPS_MVnK64PC1m-CIzY0kEDbRuWDG4jgCb8BAbE68"

SUPABASE_HEADERS = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def get_google_books_cover(title, author):
    """Search Google Books for a cover URL by title and author."""
    query = f"intitle:{title} inauthor:{author}"
    url = "https://www.googleapis.com/books/v1/volumes"
    params = {
        "q": query,
        "key": GOOGLE_BOOKS_API_KEY,
        "maxResults": 1
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        if "items" in data and len(data["items"]) > 0:
            volume_info = data["items"][0].get("volumeInfo", {})
            image_links = volume_info.get("imageLinks", {})
            cover_url = image_links.get("thumbnail") or image_links.get("smallThumbnail")
            
            if cover_url:
                cover_url = cover_url.replace("http://", "https://")
                if "&fife=w600" not in cover_url and "?fife=w600" not in cover_url:
                    separator = "&" if "?" in cover_url else "?"
                    cover_url = f"{cover_url}{separator}fife=w600"
                return cover_url
    except requests.exceptions.RequestException as e:
        print(f"Error fetching from Google Books for \'{title}\': {e}")
    
    return None

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

def update_book_cover(book_id, new_cover_url):
    """Updates the cover_url for a book in Supabase."""
    update_url = f"{SUPABASE_URL}/rest/v1/books?id=eq.{book_id}"
    update_data = {"cover_url": new_cover_url}
    try:
        response = requests.patch(update_url, headers=SUPABASE_HEADERS, json=update_data)
        response.raise_for_status()
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error updating cover for book ID {book_id}: {e}")
        return False

def main():
    print("Starting cover verification and update...")
    books = get_all_books()
    if books is None:
        print("Failed to retrieve books. Exiting.")
        return

    print(f"Fetched {len(books)} books.")

    updated_count = 0
    failed_count = 0

    for book in books:
        book_id = book.get("id")
        title = book.get("title")
        author = book.get("author_name")
        current_cover_url = book.get("cover_url")

        needs_update = False
        if not current_cover_url or current_cover_url == "" or "openlibrary.org" in current_cover_url:
            needs_update = True
        
        if needs_update:
            new_cover_url = get_google_books_cover(title, author)
            if new_cover_url:
                if update_book_cover(book_id, new_cover_url):
                    print(f"✓ {title}")
                    updated_count += 1
                else:
                    print(f"✗ {title} (Failed to update Supabase)")
                    failed_count += 1
            else:
                print(f"✗ {title} (No Google Books cover found)")
                failed_count += 1
        else:
            print(f"✓ {title} (Cover already good)")
        
        time.sleep(0.1) # Small delay to avoid hitting API limits

    print(f"\nCover verification complete. Total updated: {updated_count}, Total failed: {failed_count}")

if __name__ == "__main__":
    main()
