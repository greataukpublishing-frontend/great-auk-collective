export const mockBooks: {
  id: string;
  title: string;
  author: string;
  authorId: string;
  price: number;
  ebookPrice: number;
  rating: number;
  reviews: number;
  category: string;
  tag: string;
  description: string;
  cover: string;
  format: string[];
  featured: boolean;
  bestseller: boolean;
}[] = [];

export const categories = [
  "All",
  "Fiction",
  "Classic Literature",
  "Philosophy",
  "Science",
  "Mystery",
  "Historical Fiction",
  "Biography",
  "Self-Help",
];

export const mockAuthors: {
  id: string;
  name: string;
  bio: string;
  booksCount: number;
  avatar: string | null;
}[] = [];
