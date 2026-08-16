INSERT INTO crops (name, scientific_name, category)
VALUES
  ('Rice', 'Oryza sativa', 'Cereal'),
  ('Wheat', 'Triticum aestivum', 'Cereal'),
  ('Maize', 'Zea mays', 'Cereal'),
  ('Cotton', 'Gossypium hirsutum', 'Fiber'),
  ('Sugarcane', 'Saccharum officinarum', 'Cash'),
  ('Tomato', 'Solanum lycopersicum', 'Vegetable'),
  ('Potato', 'Solanum tuberosum', 'Vegetable'),
  ('Onion', 'Allium cepa', 'Vegetable'),
  ('Soybean', 'Glycine max', 'Legume'),
  ('Chickpea', 'Cicer arietinum', 'Legume'),
  ('Groundnut', 'Arachis hypogaea', 'Oilseed'),
  ('Mustard', 'Brassica juncea', 'Oilseed'),
  ('Chilli', 'Capsicum annuum', 'Spice'),
  ('Grapes', 'Vitis vinifera', 'Fruit'),
  ('Mango', 'Mangifera indica', 'Fruit'),
  ('Banana', 'Musa acuminata', 'Fruit')
ON CONFLICT (name) DO NOTHING;
