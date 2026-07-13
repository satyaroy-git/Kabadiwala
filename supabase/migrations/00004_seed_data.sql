-- Seed Data: Scrap Categories and Initial Rate Cards

-- ============================================
-- SCRAP CATEGORIES
-- ============================================

INSERT INTO scrap_categories (id, name, name_hindi, icon, parent_id, description, unit, sort_order) VALUES
-- Paper & Cardboard
('paper-newspaper', 'Newspaper', 'अखबार', '📰', 'paper', 'Old newspapers and magazines', 'kg', 1),
('paper-cardboard', 'Cardboard', 'गत्ता', '📦', 'paper', 'Cardboard boxes and packaging', 'kg', 2),
('paper-books', 'Books / Copies', 'किताबें / कॉपी', '📚', 'paper', 'Old books, notebooks, and copies', 'kg', 3),
-- Metals
('metal-iron', 'Iron', 'लोहा', '🔩', 'metal', 'Iron and steel items', 'kg', 4),
('metal-aluminium', 'Aluminium', 'एल्युमिनियम', '🥫', 'metal', 'Aluminium cans, foil, and items', 'kg', 5),
('metal-copper', 'Copper', 'तांबा', '🔌', 'metal', 'Copper wires and items', 'kg', 6),
('metal-brass', 'Brass', 'पीतल', '🔔', 'metal', 'Brass utensils and items', 'kg', 7),
-- Plastic
('plastic-bottles', 'Plastic Bottles', 'प्लास्टिक बोतल', '🧴', 'plastic', 'PET bottles and containers', 'kg', 8),
('plastic-hard', 'Hard Plastic', 'कड़ा प्लास्टिक', '🪣', 'plastic', 'Buckets, chairs, and hard plastic', 'kg', 9),
('plastic-soft', 'Soft Plastic / Covers', 'पॉलीथीन', '🛍️', 'plastic', 'Polythene bags and soft plastic', 'kg', 10),
-- Glass
('glass-bottles', 'Glass Bottles', 'कांच की बोतलें', '🍾', 'glass', 'Glass bottles and jars', 'kg', 11),
-- E-waste
('ewaste-mobile', 'Old Mobile Phones', 'पुराना मोबाइल', '📱', 'ewaste', 'Old or broken mobile phones', 'piece', 12),
('ewaste-laptop', 'Laptops / Computers', 'लैपटॉप / कंप्यूटर', '💻', 'ewaste', 'Old laptops, desktops, and parts', 'piece', 13),
('ewaste-appliances', 'Small Appliances', 'छोटे उपकरण', '🔌', 'ewaste', 'Mixers, irons, fans, etc.', 'piece', 14),
('ewaste-batteries', 'Batteries', 'बैटरी', '🔋', 'ewaste', 'All types of batteries', 'kg', 15),
-- Miscellaneous
('misc-clothes', 'Old Clothes', 'पुराने कपड़े', '👕', 'misc', 'Old clothes and fabric', 'kg', 16),
('misc-tyres', 'Rubber / Tyres', 'रबर / टायर', '🛞', 'misc', 'Old tyres and rubber items', 'kg', 17);

-- ============================================
-- INITIAL RATE CARDS (INR per kg/piece)
-- ============================================

INSERT INTO rate_cards (category_id, category_name, category_icon, rate_per_kg, sort_order) VALUES
('paper-newspaper', 'Newspaper', '📰', 14.00, 1),
('paper-cardboard', 'Cardboard', '📦', 8.00, 2),
('paper-books', 'Books / Copies', '📚', 12.00, 3),
('metal-iron', 'Iron', '🔩', 28.00, 4),
('metal-aluminium', 'Aluminium', '🥫', 105.00, 5),
('metal-copper', 'Copper', '🔌', 425.00, 6),
('metal-brass', 'Brass', '🔔', 305.00, 7),
('plastic-bottles', 'Plastic Bottles', '🧴', 10.00, 8),
('plastic-hard', 'Hard Plastic', '🪣', 15.00, 9),
('plastic-soft', 'Soft Plastic / Covers', '🛍️', 5.00, 10),
('glass-bottles', 'Glass Bottles', '🍾', 3.00, 11),
('ewaste-mobile', 'Old Mobile Phones', '📱', 50.00, 12),
('ewaste-laptop', 'Laptops / Computers', '💻', 200.00, 13),
('ewaste-appliances', 'Small Appliances', '🔌', 25.00, 14),
('ewaste-batteries', 'Batteries', '🔋', 60.00, 15),
('misc-clothes', 'Old Clothes', '👕', 2.00, 16),
('misc-tyres', 'Rubber / Tyres', '🛞', 8.00, 17);
