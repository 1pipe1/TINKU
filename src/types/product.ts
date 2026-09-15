export type Product = {
  id: string; // SKU o ID generado
  title: string;
  name?: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  image?: string;
  isExpress?: boolean; // Identifica si es un ítem registrado al vuelo
  pendingActivation?: boolean; // Identifica si pertenece al catálogo de 70 pero no tiene precios de la tienda
  stockPending?: boolean;
  costPending?: boolean;
};