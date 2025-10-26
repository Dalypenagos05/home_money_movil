export type Category = {
  id: string;
  name: string;
  subtitle?: string;
  color?: string;
  icon?: string;
};

// In-memory store for categories. This is simple and kept in-module so
// both crearCategoria and crearMonto can share state during the JS session.
// For persistence across restarts use AsyncStorage or a backend.
const CATEGORIES: Category[] = [
  { id: '1', name: 'Mercado', subtitle: 'Compras', color: '#7ED9FF', icon: 'cart-outline' },
  { id: '2', name: 'Recibos', subtitle: 'Facturas', color: '#79A9E1', icon: 'receipt-outline' },
];

export function getCategories(): Category[] {
  return CATEGORIES.slice();
}

export function addCategory(cat: Category) {
  CATEGORIES.push(cat);
}

export function updateCategory(cat: Category) {
  const idx = CATEGORIES.findIndex(c => c.id === cat.id);
  if (idx >= 0) {
    CATEGORIES[idx] = cat;
  }
}

export function removeCategory(id: string) {
  const idx = CATEGORIES.findIndex(c => c.id === id);
  if (idx >= 0) CATEGORIES.splice(idx, 1);
}
