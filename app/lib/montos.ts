export type Monto = {
  id: string;
  categoryId: string;
  amount: number;
  type: 'ingreso' | 'egreso';
  description?: string;
  date?: string; // ISO
};

const MONTOS: Monto[] = [];

export function getMontos(): Monto[] {
  return MONTOS.slice();
}

export function addMonto(m: Monto) {
  MONTOS.push(m);
}

export function removeMonto(id: string) {
  const idx = MONTOS.findIndex(m => m.id === id);
  if (idx >= 0) MONTOS.splice(idx, 1);
}

export function updateMonto(updated: Monto) {
  const idx = MONTOS.findIndex(m => m.id === updated.id);
  if (idx >= 0) {
    MONTOS[idx] = updated;
  }
}
