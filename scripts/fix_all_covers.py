
import os
import time
import requests
from supabase import create_client, Client

# Supabase Credentials
SUPABASE_URL = "https://hmxdutqzydrhgabkpyex.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhteGR1dHF6eWRyaGdhYmtweWV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzAwNjIwMCwiZXhwIjoyMDg4NTgyMjAwfQ.K8KyP-jMUvrxyLgrxpCCcjIkcvGUEFlSV7plSjFYNZ8"

# Google Books API Key
GOOGLE_BOOKS_API_KEY = "AIzaSyBD8K_FY-9syPHPWWSJNTiWpHNOnDtKJJs"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def get_google_book_cover(title, author):
    query = f"{title} {author}"
    params = {
        "q": query,
        "key": GOOGLE_BOOKS_API_KEY,
        "fields": "items(volumeInfo(imageLinks(thumbnail)))"
    }
    try:
        response = requests.get("https://www.googleapis.com/books/v1/volumes", params=params)
        response.raise_for_status()
        data = response.json()
        if data and "items" in data:
            for item in data["items"]:
                if "imageLinks" in item["volumeInfo"] and "thumbnail" in item["volumeInfo"]["imageLinks"]:
                    thumbnail_url = item["volumeInfo"]["imageLinks"]["thumbnail"]
                    # Convert to HTTPS, remove &edge=curl, append &fife=w600
                    thumbnail_url = thumbnail_url.replace("http://", "https://")
                    thumbnail_url = thumbnail_url.replace("&edge=curl", "")
                    if "&fife=" not in thumbnail_url:
                        thumbnail_url += "&fife=w600"
                    return thumbnail_url
    except requests.exceptions.RequestException as e:
        print(f"Error fetching Google Books API for '{query}': {e}")
    return None

def fix_all_covers():
    print("Fetching approved books from Supabase...")
    response = supabase.from_("books").select("id, title, author_name, cover_url").eq("status", "approved").execute()
    books = response.data

    if not books:
        print("No approved books found.")
        return

    updated_count = 0
    total_books = len(books)

    print(f"Found {total_books} approved books. Checking covers...")

    for i, book in enumerate(books):
        book_id = book["id"]
        title = book["title"]
        author_name = book["author_name"]
        current_cover_url = book["cover_url"]

        needs_update = False
        if not current_cover_url or current_cover_url.strip() == "" or "openlibrary.org" in current_cover_url:
            needs_update = True

        if needs_update:
            print(f"Attempting to fix cover for: {title} by {author_name} (ID: {book_id})")
            new_cover_url = get_google_book_cover(title, author_name)
            if new_cover_url:
                try:
                    update_response = supabase.from_("books").update({"cover_url": new_cover_url}).eq("id", book_id).execute()
                    if update_response.data:
                        print(f"✓ {title} [204]")
                        updated_count += 1
                    else:
                        print(f"✗ {title} - Failed to update Supabase: {update_response.status_code}")
                except Exception as e:
                    print(f"✗ {title} - Error updating Supabase: {e}")
            else:
                print(f"✗ {title} - No suitable cover found on Google Books.")
        else:
            print(f"✓ {title} - Cover already looks good.")

        time.sleep(0.3) # Wait to avoid hitting API limits

    print(f"Done! {updated_count}/{total_books} updated.")

if __name__ == "__main__":
    fix_all_covers()
