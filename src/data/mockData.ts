import type { Category, Product, ModifierGroup } from '@/types/pos.types'

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'All' },
  { id: '1', name: 'Hot Beverages', icon: 'coffee' },
  { id: '2', name: 'Cold Beverages', icon: 'cup-soda' },
  { id: '3', name: 'Main Dishes', icon: 'utensils' },
  { id: '4', name: 'Sides & Snacks', icon: 'popcorn' },
  { id: '5', name: 'Desserts', icon: 'cake' },
]

// --- Modifier Groups ---

const ESPRESSO_SUGAR: ModifierGroup = {
  id: 'mod-sugar',
  name: 'Sugar Level',
  options: [
    { id: 'sug-none', name: 'No Sugar', price: 0 },
    { id: 'sug-less', name: 'Less Sugar', price: 0 },
    { id: 'sug-normal', name: 'Normal', price: 0 },
  ],
}

const MILK_OPTIONS: ModifierGroup = {
  id: 'mod-milk',
  name: 'Milk Choice',
  options: [
    { id: 'milk-std', name: 'Fresh Milk', price: 0 },
    { id: 'milk-oat', name: 'Oat Milk', price: 2.0 },
    { id: 'milk-almond', name: 'Almond Milk', price: 2.0 },
  ],
}

const COFFEE_EXTRA_SHOT: ModifierGroup = {
  id: 'mod-shot',
  name: 'Extra Espresso Shot',
  options: [
    { id: 'shot-single', name: 'Single Shot', price: 2.5 },
    { id: 'shot-double', name: 'Double Shot', price: 4.5 },
  ],
}

const SYRUP_ADDONS: ModifierGroup = {
  id: 'mod-syrup',
  name: 'Flavored Syrup',
  multiSelect: true,
  options: [
    { id: 'syr-vanilla', name: 'Vanilla', price: 1.5 },
    { id: 'syr-caramel', name: 'Caramel', price: 1.5 },
    { id: 'syr-hazelnut', name: 'Hazelnut', price: 1.5 },
  ],
}

const BURGER_PATTY: ModifierGroup = {
  id: 'mod-patty',
  name: 'Patty Options',
  options: [
    { id: 'patty-single', name: 'Single Patty', price: 0 },
    { id: 'patty-double', name: 'Double Patty', price: 6.0 },
  ],
}

const BURGER_ADDONS: ModifierGroup = {
  id: 'mod-burger-addons',
  name: 'Add-ons',
  multiSelect: true,
  options: [
    { id: 'add-cheese', name: 'Extra Cheese', price: 2.0 },
    { id: 'add-bacon', name: 'Bacon Slice', price: 3.5 },
    { id: 'add-egg', name: 'Fried Egg', price: 2.0 },
  ],
}

// --- Mock Products ---

export const MOCK_PRODUCTS: Product[] = [
  // Hot Beverages
  {
    id: '1',
    name: 'Espresso',
    price: 6.5,
    category: 'Hot Beverages',
    barcode: '100001',
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=300',
    stock: 100,
    hasModifiers: true,
    modifierGroups: [ESPRESSO_SUGAR, MILK_OPTIONS],
  },
  {
    id: '2',
    name: 'Americano',
    price: 8.0,
    category: 'Hot Beverages',
    barcode: '100002',
    image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=300',
    stock: 100,
  },
  {
    id: '3',
    name: 'Caffe Latte',
    price: 11.0,
    category: 'Hot Beverages',
    barcode: '100003',
    image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=300',
    stock: 80,
    hasModifiers: true,
    modifierGroups: [COFFEE_EXTRA_SHOT, SYRUP_ADDONS, MILK_OPTIONS],
  },

  // Cold Beverages
  {
    id: '4',
    name: 'Iced Caramel Macchiato',
    price: 14.5,
    category: 'Cold Beverages',
    barcode: '100004',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=300',
    stock: 60,
    hasModifiers: true,
    modifierGroups: [COFFEE_EXTRA_SHOT, MILK_OPTIONS],
  },
  {
    id: '5',
    name: 'Iced Matcha Latte',
    price: 13.5,
    category: 'Cold Beverages',
    barcode: '100005',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=300',
    stock: 50,
    hasModifiers: true,
    modifierGroups: [ESPRESSO_SUGAR, MILK_OPTIONS],
  },

  // Main Dishes
  {
    id: '6',
    name: 'Classic Cheeseburger',
    price: 18.0,
    category: 'Main Dishes',
    barcode: '200001',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300',
    stock: 40,
    hasModifiers: true,
    modifierGroups: [BURGER_PATTY, BURGER_ADDONS],
  },
  {
    id: '7',
    name: 'Crispy Chicken Sandwich',
    price: 16.5,
    category: 'Main Dishes',
    barcode: '200002',
    image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=300',
    stock: 45,
    hasModifiers: true,
    modifierGroups: [BURGER_ADDONS],
  },

  // Sides & Snacks
  {
    id: '8',
    name: 'Truffle French Fries',
    price: 10.5,
    category: 'Sides & Snacks',
    barcode: '300001',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300',
    stock: 75,
  },
  {
    id: '9',
    name: 'Crispy Chicken Tenders (5pcs)',
    price: 12.0,
    category: 'Sides & Snacks',
    barcode: '300002',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=300',
    stock: 50,
  },

  // Desserts
  {
    id: '10',
    name: 'Burnt Basque Cheesecake',
    price: 14.0,
    category: 'Desserts',
    barcode: '400001',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=300',
    stock: 25,
  },
  {
    id: '11',
    name: 'Chocolate Fudge Brownie',
    price: 9.5,
    category: 'Desserts',
    barcode: '400002',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300',
    stock: 30,
  },
]

/** Maps product ID → modifier groups */
export const PRODUCT_MODIFIERS: Record<string, ModifierGroup[]> = Object.fromEntries(
  MOCK_PRODUCTS.filter((p) => p.modifierGroups && p.modifierGroups.length > 0).map((p) => [
    p.id,
    p.modifierGroups!,
  ])
)
