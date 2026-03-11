
-- Add Finance and Psychology categories
INSERT INTO categories (name, description) VALUES
  ('Finance', 'Books about money, investing, and financial literacy'),
  ('Psychology', 'Books about the human mind, behavior, and self-understanding')
ON CONFLICT DO NOTHING;

-- Insert 16 mock catalog books
INSERT INTO books (title, author_name, category, language, description, print_price, ebook_price, featured, status, format, cover_url) VALUES
('Atomic Habits', 'James Clear', 'Self-Help', 'English', 'An easy and proven way to build good habits and break bad ones.', 599, 299, true, 'approved', ARRAY['ebook','paperback'], 'https://m.media-amazon.com/images/I/81bGKUa1e0L._SL1500_.jpg'),
('The 7 Habits of Highly Effective People', 'Stephen R. Covey', 'Self-Help', 'English', 'A principle-centered approach for solving personal and professional problems.', 499, 249, false, 'approved', ARRAY['ebook','paperback'], 'https://m.media-amazon.com/images/I/71wEMPhMkzL._SL1500_.jpg'),
('Deep Work', 'Cal Newport', 'Self-Help', 'English', 'Rules for focused success in a distracted world.', 450, 199, false, 'approved', ARRAY['ebook','paperback'], 'https://m.media-amazon.com/images/I/81JJ7fyyKlS._SL1500_.jpg'),
('Start With Why', 'Simon Sinek', 'Self-Help', 'English', 'How great leaders inspire everyone to take action.', 499, 249, false, 'approved', ARRAY['ebook','paperback'], 'https://m.media-amazon.com/images/I/71NsijOxpkL._SL1500_.jpg'),
('Can''t Hurt Me', 'David Goggins', 'Self-Help', 'English', 'Master your mind and defy the odds.', 599, 299, true, 'approved', ARRAY['ebook','paperback'], 'https://m.media-amazon.com/images/I/81gTRv2HXrL._SL1500_.jpg'),
('Ikigai', 'Héctor García & Francesc Miralles', 'Self-Help', 'English', 'The Japanese secret to a long and happy life.', 350, 149, true, 'approved', ARRAY['ebook','paperback'], 'https://m.media-amazon.com/images/I/81l3rZK4lnL._SL1500_.jpg'),
('The Power of Now', 'Eckhart Tolle', 'Self-Help', 'English', 'A guide to spiritual enlightenment and living in the present moment.', 450, 199, false, 'approved', ARRAY['ebook','paperback'], 'https://m.media-amazon.com/images/I/714FbKtXS+L._SL1500_.jpg'),
('Rich Dad Poor Dad', 'Robert T. Kiyosaki', 'Finance', 'English', 'What the rich teach their kids about money.', 499, 199, true, 'approved', ARRAY['ebook','paperback'], 'https://m.media-amazon.com/images/I/81bsw6fnUiL._SL1500_.jpg'),
('The Psychology of Money', 'Morgan Housel', 'Finance', 'English', 'Timeless lessons on wealth, greed, and happiness.', 450, 199, true, 'approved', ARRAY['ebook','paperback'], 'https://m.media-amazon.com/images/I/81Dky+tD+pL._SL1500_.jpg'),
('Think and Grow Rich', 'Napoleon Hill', 'Finance', 'English', 'The classic guide to success and wealth creation.', 350, 149, false, 'approved', ARRAY['ebook','paperback'], 'https://m.media-amazon.com/images/I/71UypkUjStL._SL1500_.jpg'),
('The Alchemist', 'Paulo Coelho', 'Fiction', 'English', 'A magical fable about following your dreams.', 399, 199, true, 'approved', ARRAY['ebook','paperback'], 'https://m.media-amazon.com/images/I/61HAE8zahLL._SL1500_.jpg'),
('Sapiens', 'Yuval Noah Harari', 'Non-Fiction', 'English', 'A brief history of humankind from the Stone Age to the Silicon Age.', 599, 299, true, 'approved', ARRAY['ebook','paperback'], 'https://m.media-amazon.com/images/I/713jIoMO3UL._SL1500_.jpg'),
('Thinking, Fast and Slow', 'Daniel Kahneman', 'Psychology', 'English', 'A groundbreaking tour of the mind and the two systems that drive how we think.', 550, 249, false, 'approved', ARRAY['ebook','paperback'], 'https://m.media-amazon.com/images/I/71wvKXWfcML._SL1500_.jpg'),
('The Subtle Art of Not Giving a F*ck', 'Mark Manson', 'Psychology', 'English', 'A counterintuitive approach to living a good life.', 399, 199, false, 'approved', ARRAY['ebook','paperback'], 'https://m.media-amazon.com/images/I/71QKQ9mwV7L._SL1500_.jpg'),
('Mindset', 'Carol S. Dweck', 'Psychology', 'English', 'The new psychology of success and fulfilling your potential.', 499, 249, false, 'approved', ARRAY['ebook','paperback'], 'https://m.media-amazon.com/images/I/61bDwfLudLL._SL1500_.jpg'),
('Man''s Search for Meaning', 'Viktor E. Frankl', 'Psychology', 'English', 'A Holocaust survivor''s memoir on finding purpose even in suffering.', 350, 149, true, 'approved', ARRAY['ebook','paperback'], 'https://m.media-amazon.com/images/I/71bBKTKsRkL._SL1500_.jpg');
