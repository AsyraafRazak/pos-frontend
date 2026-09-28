import type { Category, Product, ModifierGroup } from '@/types/pos.types'

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'All' },
  { id: 'food', name: 'Food' },
  { id: 'drinks', name: 'Drinks' },
  { id: 'snacks', name: 'Snacks' },
  { id: 'desserts', name: 'Desserts' },
]

export const MOCK_PRODUCTS: Product[] = [
  // Food
  { id: 'p001', name: 'Classic Burger', price: 129, category: 'food', barcode: '1000000001', hasModifiers: true },
  { id: 'p002', name: 'French Fries', price: 59, category: 'food', barcode: '1000000002', hasModifiers: true },
  { id: 'p003', name: 'Club Sandwich', price: 149, category: 'food', barcode: '1000000003' },
  { id: 'p004', name: 'Rice Bowl', price: 89, category: 'food' },
  { id: 'p005', name: 'Pasta Carbonara', price: 169, category: 'food' },
  { id: 'p006', name: 'Hotdog Roll', price: 49, category: 'food', barcode: '1000000006' },
  { id: 'p007', name: 'Pizza Slice', price: 79, category: 'food', hasModifiers: true },
  { id: 'p008', name: 'Chicken Wings', price: 199, category: 'food', hasModifiers: true },
  // Drinks
  { id: 'p009', name: 'Cola', price: 39, category: 'drinks', barcode: '2000000001', hasModifiers: true },
  { id: 'p010', name: 'Mineral Water', price: 25, category: 'drinks', barcode: '2000000002' },
  { id: 'p011', name: 'Fresh Juice', price: 69, category: 'drinks', hasModifiers: true },
  { id: 'p012', name: 'Brewed Coffee', price: 79, category: 'drinks', hasModifiers: true },
  { id: 'p013', name: 'Milk Tea', price: 99, category: 'drinks', hasModifiers: true },
  { id: 'p014', name: 'Iced Tea', price: 45, category: 'drinks', hasModifiers: true },
  // Snacks
  { id: 'p015', name: 'Potato Chips', price: 35, category: 'snacks', barcode: '3000000001' },
  { id: 'p016', name: 'Popcorn', price: 45, category: 'snacks', hasModifiers: true },
  { id: 'p017', name: 'Mixed Nuts', price: 89, category: 'snacks' },
  { id: 'p018', name: 'Crackers', price: 29, category: 'snacks' },
  // Desserts
  { id: 'p019', name: 'Ice Cream', price: 59, category: 'desserts', hasModifiers: true },
  { id: 'p020', name: 'Cake Slice', price: 99, category: 'desserts', hasModifiers: true },
  { id: 'p021', name: 'Glazed Donut', price: 45, category: 'desserts' },
  { id: 'p022', name: 'Brownie', price: 69, category: 'desserts' },
]

// --- Reusable modifier group templates ---

const SIZE_REGULAR_LARGE: ModifierGroup = {
  id: 'size',
  name: 'Size',
  options: [
    { id: 'sz-reg', name: 'Regular', price: 0 },
    { id: 'sz-lg', name: 'Large', price: 30 },
  ],
}

const DRINK_ICE: ModifierGroup = {
  id: 'ice',
  name: 'Ice Level',
  options: [
    { id: 'ice-full', name: 'Full Ice', price: 0 },
    { id: 'ice-less', name: 'Less Ice', price: 0 },
    { id: 'ice-none', name: 'No Ice', price: 0 },
  ],
}

const DRINK_SUGAR: ModifierGroup = {
  id: 'sugar',
  name: 'Sweetness',
  options: [
    { id: 'sugar-100', name: '100%', price: 0 },
    { id: 'sugar-75', name: '75%', price: 0 },
    { id: 'sugar-50', name: '50%', price: 0 },
    { id: 'sugar-0', name: 'No Sugar', price: 0 },
  ],
}

const BURGER_ADDONS: ModifierGroup = {
  id: 'addons',
  name: 'Add-ons',
  multiSelect: true,
  options: [
    { id: 'add-cheese', name: 'Extra Cheese', price: 15 },
    { id: 'add-bacon', name: 'Bacon', price: 25 },
    { id: 'add-egg', name: 'Fried Egg', price: 20 },
  ],
}

const WINGS_COUNT: ModifierGroup = {
  id: 'count',
  name: 'Pieces',
  options: [
    { id: 'wing-3', name: '3 pcs', price: 0 },
    { id: 'wing-6', name: '6 pcs', price: 60 },
    { id: 'wing-9', name: '9 pcs', price: 110 },
  ],
}

const ICE_CREAM_FLAVOR: ModifierGroup = {
  id: 'flavor',
  name: 'Flavor',
  options: [
    { id: 'fl-van', name: 'Vanilla', price: 0 },
    { id: 'fl-choc', name: 'Chocolate', price: 0 },
    { id: 'fl-straw', name: 'Strawberry', price: 0 },
    { id: 'fl-mango', name: 'Mango', price: 10 },
  ],
}

const CAKE_TYPE: ModifierGroup = {
  id: 'type',
  name: 'Type',
  options: [
    { id: 'cake-choc', name: 'Chocolate', price: 0 },
    { id: 'cake-van', name: 'Vanilla', price: 0 },
    { id: 'cake-red', name: 'Red Velvet', price: 20 },
  ],
}

const POPCORN_FLAVOR: ModifierGroup = {
  id: 'flavor',
  name: 'Flavor',
  options: [
    { id: 'pop-butter', name: 'Butter', price: 0 },
    { id: 'pop-cheese', name: 'Cheese', price: 0 },
    { id: 'pop-caramel', name: 'Caramel', price: 10 },
  ],
}

/** Maps product ID → modifier groups shown in the modifier modal */
export const PRODUCT_MODIFIERS: Record<string, ModifierGroup[]> = {
  p001: [SIZE_REGULAR_LARGE, BURGER_ADDONS],
  p002: [SIZE_REGULAR_LARGE],
  p007: [SIZE_REGULAR_LARGE],
  p008: [WINGS_COUNT],
  p009: [SIZE_REGULAR_LARGE, DRINK_ICE],
  p011: [SIZE_REGULAR_LARGE, DRINK_ICE],
  p012: [DRINK_ICE, DRINK_SUGAR],
  p013: [SIZE_REGULAR_LARGE, DRINK_ICE, DRINK_SUGAR],
  p014: [SIZE_REGULAR_LARGE, DRINK_ICE],
  p016: [SIZE_REGULAR_LARGE, POPCORN_FLAVOR],
  p019: [ICE_CREAM_FLAVOR],
  p020: [CAKE_TYPE],
}
