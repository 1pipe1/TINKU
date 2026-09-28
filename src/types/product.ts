export type Product = {
  id: string; // SKU o ID generado
  sku?: string;
  title: string;
  name?: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  image?: string;
  icono?: string;
  isExpress?: boolean; // Identifica si es un ítem registrado al vuelo
  pendingActivation?: boolean; // Identifica si pertenece al catálogo sugerido pero aún no tiene precio en la tienda
  stockPending?: boolean;
  costPending?: boolean;
};
