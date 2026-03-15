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
            # Prefer thumbnail, then smallThumbnail
            cover_url = image_links.get("thumbnail") or image_links.get("smallThumbnail")
            
            if cover_url:
                # Replace http with https and add high-res parameter
                cover_url = cover_url.replace("http://", "https://")
                if "&fife=w600" not in cover_url and "?fife=w600" not in cover_url:
                    separator = "&" if "?" in cover_url else "?"
                    cover_url = f"{cover_url}{separator}fife=w600"
                return cover_url
    except Exception as e:
        print(f"Error fetching from Google Books for '{title}': {e}")
    
    return None

def main():
    # 1. Fetch books with openlibrary.org URLs
    print("Fetching books with Open Library cover URLs...")
    # Using Supabase REST API to filter books
    # We want books where cover_url contains 'openlibrary.org'
    fetch_url = f"{SUPABASE_URL}/rest/v1/books?cover_url=ilike.*openlibrary.org*"
    
    try:
        response = requests.get(fetch_url, headers=SUPABASE_HEADERS)
        response.raise_for_status()
        books = response.json()
        print(f"Found {len(books)} books to update.")
        
        updated_count = 0
        for book in books:
            book_id = book.get("id")
            title = book.get("title")
            author = book.get("author_name")
            
            print(f"Processing: {title} by {author}...")
            
            new_cover_url = get_google_books_cover(title, author)
            
            if new_cover_url:
                # 2. Update the book in Supabase
                update_url = f"{SUPABASE_URL}/rest/v1/books?id=eq.{book_id}"
                update_data = {"cover_url": new_cover_url}
                
                update_response = requests.patch(update_url, headers=SUPABASE_HEADERS, json=update_data)
                if update_response.status_code in [200, 204]:
                    print(f"Successfully updated cover for '{title}'")
                    updated_count += 1
                else:
                    print(f"Failed to update cover for '{title}': {update_response.text}")
            else:
                print(f"No Google Books cover found for '{title}'")
            
            # Rate limiting for Google Books API
            time.sleep(0.5)
            
        print(f"\nMigration complete. Updated {updated_count} out of {len(books)} books.")
        
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    main()
