import type { Product } from "./product";

export type CartItem = Product & {
  quantity: number;
  isExpress?: boolean; // Identifica si es un ítem registrado al vuelo
};
