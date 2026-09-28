// 🌟 Catálogo Maestro Global de TINKU (Plantillas Sugeridas)
// Los nuevos usuarios inician con inventario en 0.
// Al seleccionar uno de estos ítems por primera vez, se solicita el precio de venta y se activa en su Firestore privado.

export interface MaestroProduct {
  id: string;
  nombre: string;
  categoria: string;
  icono: string;
  precio: number;
}

export const CATALOGO_MAESTRO: MaestroProduct[] = [
  {
    "id": "cm-coca-cola-1-5l",
    "nombre": "Coca-Cola 1.5L",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-coca-cola-400ml",
    "nombre": "Coca-Cola 400ml",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-postobon-manzana-1-5l",
    "nombre": "Postobón Manzana 1.5L",
    "categoria": "Bebidas",
    "icono": "🍎",
    "precio": 0
  },
  {
    "id": "cm-postobon-uva-1-5l",
    "nombre": "Postobón Uva 1.5L",
    "categoria": "Bebidas",
    "icono": "🍇",
    "precio": 0
  },
  {
    "id": "cm-postobon-colombiana-1-5l",
    "nombre": "Postobón Colombiana 1.5L",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-postobon-naranja-400ml",
    "nombre": "Postobón Naranja 400ml",
    "categoria": "Bebidas",
    "icono": "🍊",
    "precio": 0
  },
  {
    "id": "cm-pepsi-400ml",
    "nombre": "Pepsi 400ml",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-cuatro-400ml",
    "nombre": "Cuatro 400ml",
    "categoria": "Bebidas",
    "icono": "🍋",
    "precio": 0
  },
  {
    "id": "cm-hit-mango-caja-1l",
    "nombre": "Hit Mango Caja 1L",
    "categoria": "Bebidas",
    "icono": "🥭",
    "precio": 0
  },
  {
    "id": "cm-hit-mora-caja-1l",
    "nombre": "Hit Mora Caja 1L",
    "categoria": "Bebidas",
    "icono": "🫐",
    "precio": 0
  },
  {
    "id": "cm-hit-tropical-caja-1l",
    "nombre": "Hit Tropical Caja 1L",
    "categoria": "Bebidas",
    "icono": "🧃",
    "precio": 0
  },
  {
    "id": "cm-agua-cristal-sin-tapa-600ml",
    "nombre": "Agua Cristal Sin Tapa 600ml",
    "categoria": "Bebidas",
    "icono": "💧",
    "precio": 0
  },
  {
    "id": "cm-agua-cristal-con-tapa-600ml",
    "nombre": "Agua Cristal Con Tapa 600ml",
    "categoria": "Bebidas",
    "icono": "💧",
    "precio": 0
  },
  {
    "id": "cm-bretana-300ml",
    "nombre": "Bretaña 300ml",
    "categoria": "Bebidas",
    "icono": "🧊",
    "precio": 0
  },
  {
    "id": "cm-pony-malta-330ml",
    "nombre": "Pony Malta 330ml",
    "categoria": "Bebidas",
    "icono": "🍺",
    "precio": 0
  },
  {
    "id": "cm-red-bull-250ml",
    "nombre": "Red Bull 250ml",
    "categoria": "Bebidas",
    "icono": "⚡",
    "precio": 0
  },
  {
    "id": "cm-hatsu-te-400ml",
    "nombre": "Hatsu Té 400ml",
    "categoria": "Bebidas",
    "icono": "🍵",
    "precio": 0
  },
  {
    "id": "cm-cerveza-aguila-light-botella",
    "nombre": "Cerveza Águila Light Botella",
    "categoria": "Licores",
    "icono": "🍺",
    "precio": 0
  },
  {
    "id": "cm-cerveza-poker-botella",
    "nombre": "Cerveza Poker Botella",
    "categoria": "Licores",
    "icono": "🍺",
    "precio": 0
  },
  {
    "id": "cm-cerveza-club-colombia-dorada",
    "nombre": "Cerveza Club Colombia Dorada",
    "categoria": "Licores",
    "icono": "🍻",
    "precio": 0
  },
  {
    "id": "cm-leche-alqueria-bolsa-1l",
    "nombre": "Leche Alquería Bolsa 1L",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-leche-alpina-bolsa-1l",
    "nombre": "Leche Alpina Bolsa 1L",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-queso-bogotano-bloque-libra",
    "nombre": "Queso Bogotano Bloque (Libra)",
    "categoria": "Lácteos",
    "icono": "🧀",
    "precio": 0
  },
  {
    "id": "cm-queso-mozzarella-bloque-libra",
    "nombre": "Queso Mozzarella Bloque (Libra)",
    "categoria": "Lácteos",
    "icono": "🧀",
    "precio": 0
  },
  {
    "id": "cm-kumis-alpina-vaso",
    "nombre": "Kumis Alpina Vaso",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-yogurt-alpina-vaso",
    "nombre": "Yogurt Alpina Vaso",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-crema-de-leche-alqueria",
    "nombre": "Crema de Leche Alquería",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-mantequilla-la-vaquita-barra",
    "nombre": "Mantequilla La Vaquita Barra",
    "categoria": "Lácteos",
    "icono": "🧈",
    "precio": 0
  },
  {
    "id": "cm-huevos-rojos-tipo-a-unidad",
    "nombre": "Huevos Rojos Tipo A (Unidad)",
    "categoria": "Lácteos",
    "icono": "🥚",
    "precio": 0
  },
  {
    "id": "cm-huevos-aa-unidad",
    "nombre": "Huevos AA (Unidad)",
    "categoria": "Lácteos",
    "icono": "🥚",
    "precio": 0
  },
  {
    "id": "cm-arroz-diana-1000g",
    "nombre": "Arroz Diana 1000g",
    "categoria": "Abarrotes",
    "icono": "🍚",
    "precio": 0
  },
  {
    "id": "cm-arroz-roa-1000g",
    "nombre": "Arroz Roa 1000g",
    "categoria": "Abarrotes",
    "icono": "🍚",
    "precio": 0
  },
  {
    "id": "cm-lenteja-granel-libra",
    "nombre": "Lenteja Granel (Libra)",
    "categoria": "Abarrotes",
    "icono": "🫘",
    "precio": 0
  },
  {
    "id": "cm-frijol-bola-roja-libra",
    "nombre": "Frijol Bola Roja (Libra)",
    "categoria": "Abarrotes",
    "icono": "🫘",
    "precio": 0
  },
  {
    "id": "cm-aceite-premier-1000ml",
    "nombre": "Aceite Premier 1000ml",
    "categoria": "Abarrotes",
    "icono": "🍳",
    "precio": 0
  },
  {
    "id": "cm-aceite-gourmet-500ml",
    "nombre": "Aceite Gourmet 500ml",
    "categoria": "Abarrotes",
    "icono": "🍳",
    "precio": 0
  },
  {
    "id": "cm-azucar-incauca-1000g",
    "nombre": "Azúcar Incauca 1000g",
    "categoria": "Abarrotes",
    "icono": "🧂",
    "precio": 0
  },
  {
    "id": "cm-panela-redonda-morena-unidad",
    "nombre": "Panela Redonda Morena (Unidad)",
    "categoria": "Abarrotes",
    "icono": "🟤",
    "precio": 0
  },
  {
    "id": "cm-sal-marina-refisal-500g",
    "nombre": "Sal Marina Refisal 500g",
    "categoria": "Abarrotes",
    "icono": "🧂",
    "precio": 0
  },
  {
    "id": "cm-harina-de-maiz-dona-nora",
    "nombre": "Harina de Maíz Doña Nora",
    "categoria": "Abarrotes",
    "icono": "🌽",
    "precio": 0
  },
  {
    "id": "cm-harina-de-trigo-haz-de-oros",
    "nombre": "Harina de Trigo Haz de Oros",
    "categoria": "Abarrotes",
    "icono": "🌾",
    "precio": 0
  },
  {
    "id": "cm-pasta-doria-spaghetti-500g",
    "nombre": "Pasta Doria Spaghetti 500g",
    "categoria": "Abarrotes",
    "icono": "🍝",
    "precio": 0
  },
  {
    "id": "cm-atun-van-camp-s-aceite-lata",
    "nombre": "Atún Van Camp's Aceite Lata",
    "categoria": "Abarrotes",
    "icono": "🐟",
    "precio": 0
  },
  {
    "id": "cm-sardinas-lumar-lata",
    "nombre": "Sardinas Lumar Lata",
    "categoria": "Abarrotes",
    "icono": "🐟",
    "precio": 0
  },
  {
    "id": "cm-salsa-de-tomate-fruco-doypack",
    "nombre": "Salsa de Tomate Fruco Doypack",
    "categoria": "Abarrotes",
    "icono": "🍅",
    "precio": 0
  },
  {
    "id": "cm-mayonesa-fruco-doypack",
    "nombre": "Mayonesa Fruco Doypack",
    "categoria": "Abarrotes",
    "icono": "🥗",
    "precio": 0
  },
  {
    "id": "cm-chocolate-corona-pastilla",
    "nombre": "Chocolate Corona Pastilla",
    "categoria": "Abarrotes",
    "icono": "🍫",
    "precio": 0
  },
  {
    "id": "cm-cafe-sello-rojo-250g",
    "nombre": "Café Sello Rojo 250g",
    "categoria": "Abarrotes",
    "icono": "☕",
    "precio": 0
  },
  {
    "id": "cm-pan-tajado-bimbo-pequeno",
    "nombre": "Pan tajado Bimbo Pequeño",
    "categoria": "Panadería",
    "icono": "🍞",
    "precio": 0
  },
  {
    "id": "cm-pan-de-bono-unidad",
    "nombre": "Pan de Bono (Unidad)",
    "categoria": "Panadería",
    "icono": "🥖",
    "precio": 0
  },
  {
    "id": "cm-galletas-festival-fresa",
    "nombre": "Galletas Festival Fresa",
    "categoria": "Snacks",
    "icono": "🍪",
    "precio": 0
  },
  {
    "id": "cm-galletas-festival-chocolate",
    "nombre": "Galletas Festival Chocolate",
    "categoria": "Snacks",
    "icono": "🍪",
    "precio": 0
  },
  {
    "id": "cm-galletas-ducales-bloque",
    "nombre": "Galletas Ducales Bloque",
    "categoria": "Snacks",
    "icono": "🍘",
    "precio": 0
  },
  {
    "id": "cm-galletas-saltin-noel-tradicional",
    "nombre": "Galletas Saltín Noel Tradicional",
    "categoria": "Snacks",
    "icono": "🍘",
    "precio": 0
  },
  {
    "id": "cm-chocorramo-individual",
    "nombre": "Chocorramo Individual",
    "categoria": "Snacks",
    "icono": "🧁",
    "precio": 0
  },
  {
    "id": "cm-barra-gala-ramo",
    "nombre": "Barra Gala Ramo",
    "categoria": "Snacks",
    "icono": "🍰",
    "precio": 0
  },
  {
    "id": "cm-detodito-natural-mediano",
    "nombre": "Detodito Natural Mediano",
    "categoria": "Snacks",
    "icono": "🍟",
    "precio": 0
  },
  {
    "id": "cm-papas-margarita-limon-medias",
    "nombre": "Papas Margarita Limón Medias",
    "categoria": "Snacks",
    "icono": "🥔",
    "precio": 0
  },
  {
    "id": "cm-trident-menta-caja",
    "nombre": "Trident Menta Caja",
    "categoria": "Snacks",
    "icono": "🍬",
    "precio": 0
  },
  {
    "id": "cm-chicles-trident-fresa",
    "nombre": "Chicles Trident Fresa",
    "categoria": "Snacks",
    "icono": "🍬",
    "precio": 0
  },
  {
    "id": "cm-papel-higienico-familia-4-rollo",
    "nombre": "Papel Higiénico Familia 4 Rollo",
    "categoria": "Aseo",
    "icono": "🧻",
    "precio": 0
  },
  {
    "id": "cm-jabon-de-bano-heno-de-pravia",
    "nombre": "Jabón de Baño Heno de Pravia",
    "categoria": "Aseo",
    "icono": "🧼",
    "precio": 0
  },
  {
    "id": "cm-jabon-rey-barra-azul",
    "nombre": "Jabón Rey Barra Azul",
    "categoria": "Aseo",
    "icono": "🧼",
    "precio": 0
  },
  {
    "id": "cm-detergente-en-polvo-ariel-400g",
    "nombre": "Detergente en Polvo Ariel 400g",
    "categoria": "Aseo",
    "icono": "🧺",
    "precio": 0
  },
  {
    "id": "cm-limpido-clorox-pequeno",
    "nombre": "Límpido Clorox Pequeño",
    "categoria": "Aseo",
    "icono": "🧴",
    "precio": 0
  },
  {
    "id": "cm-crema-dental-colgate-triple-accion",
    "nombre": "Crema Dental Colgate Triple Acción",
    "categoria": "Aseo",
    "icono": "🦷",
    "precio": 0
  },
  {
    "id": "cm-bioexpert-shampoo-sobre",
    "nombre": "Bioexpert Shampoo Sobre",
    "categoria": "Aseo",
    "icono": "🧴",
    "precio": 0
  },
  {
    "id": "cm-toallas-higienicas-nosotras-multiestilo",
    "nombre": "Toallas Higiénicas Nosotras Multiestilo",
    "categoria": "Aseo",
    "icono": "🩹",
    "precio": 0
  },
  {
    "id": "cm-caja-de-fosforos-el-rey",
    "nombre": "Caja de Fósforos El Rey",
    "categoria": "Hogar",
    "icono": "🔥",
    "precio": 0
  },
  {
    "id": "cm-vela-blanca-tradicional-unidad",
    "nombre": "Vela Blanca Tradicional (Unidad)",
    "categoria": "Hogar",
    "icono": "🕯️",
    "precio": 0
  },
  {
    "id": "cm-jabon-rey-light-1000g",
    "nombre": "Jabón Rey Light 1000g",
    "categoria": "Aseo",
    "icono": "🧼",
    "precio": 0
  },
  {
    "id": "cm-arroz-zulia-familiar-1-5l",
    "nombre": "Arroz Zulia Familiar 1.5L",
    "categoria": "Abarrotes",
    "icono": "🍚",
    "precio": 0
  },
  {
    "id": "cm-jugo-hit-pack-lata",
    "nombre": "Jugo Hit Pack Lata",
    "categoria": "Bebidas",
    "icono": "🧃",
    "precio": 0
  },
  {
    "id": "cm-detergente-ariel-lata-lata",
    "nombre": "Detergente Ariel Lata Lata",
    "categoria": "Aseo",
    "icono": "🧺",
    "precio": 0
  },
  {
    "id": "cm-atun-van-camp-s-zero-bolsa",
    "nombre": "Atún Van Camp's Zero Bolsa",
    "categoria": "Abarrotes",
    "icono": "🐟",
    "precio": 0
  },
  {
    "id": "cm-galletas-festival-lata-bolsa",
    "nombre": "Galletas Festival Lata Bolsa",
    "categoria": "Snacks",
    "icono": "🍪",
    "precio": 0
  },
  {
    "id": "cm-leche-colanta-pequeno-250g",
    "nombre": "Leche Colanta Pequeño 250g",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-coca-cola-light-400ml",
    "nombre": "Coca-Cola Light 400ml",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-coca-cola-grande-250g",
    "nombre": "Coca-Cola Grande 250g",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-kumis-alpina-unidad-2l",
    "nombre": "Kumis Alpina Unidad 2L",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-limpido-clorox-frasco-500g",
    "nombre": "Límpido Clorox Frasco 500g",
    "categoria": "Aseo",
    "icono": "🧴",
    "precio": 0
  },
  {
    "id": "cm-harina-dona-nora-frasco-unidad",
    "nombre": "Harina Doña Nora Frasco Unidad",
    "categoria": "Abarrotes",
    "icono": "🌽",
    "precio": 0
  },
  {
    "id": "cm-mayonesa-fruco-pequeno-lata",
    "nombre": "Mayonesa Fruco Pequeño Lata",
    "categoria": "Abarrotes",
    "icono": "🥗",
    "precio": 0
  },
  {
    "id": "cm-arroz-roa-unidad-bolsa",
    "nombre": "Arroz Roa Unidad Bolsa",
    "categoria": "Abarrotes",
    "icono": "🍚",
    "precio": 0
  },
  {
    "id": "cm-cafe-aguila-roja-light-2l",
    "nombre": "Café Águila Roja Light 2L",
    "categoria": "Abarrotes",
    "icono": "☕",
    "precio": 0
  },
  {
    "id": "cm-aceite-premier-pack-2l",
    "nombre": "Aceite Premier Pack 2L",
    "categoria": "Abarrotes",
    "icono": "🍳",
    "precio": 0
  },
  {
    "id": "cm-panela-light-400ml",
    "nombre": "Panela Light 400ml",
    "categoria": "Abarrotes",
    "icono": "🟤",
    "precio": 0
  },
  {
    "id": "cm-galletas-saltin-pequeno-1000g",
    "nombre": "Galletas Saltín Pequeño 1000g",
    "categoria": "Snacks",
    "icono": "🍘",
    "precio": 0
  },
  {
    "id": "cm-pasta-doria-unidad-500g",
    "nombre": "Pasta Doria Unidad 500g",
    "categoria": "Abarrotes",
    "icono": "🍝",
    "precio": 0
  },
  {
    "id": "cm-vela-blanca-lata-unidad",
    "nombre": "Vela Blanca Lata Unidad",
    "categoria": "Hogar",
    "icono": "🕯️",
    "precio": 0
  },
  {
    "id": "cm-limpido-clorox-pequeno-2l",
    "nombre": "Límpido Clorox Pequeño 2L",
    "categoria": "Aseo",
    "icono": "🧴",
    "precio": 0
  },
  {
    "id": "cm-kumis-alpina-light-lata",
    "nombre": "Kumis Alpina Light Lata",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-mayonesa-fruco-especial-1000ml",
    "nombre": "Mayonesa Fruco Especial 1000ml",
    "categoria": "Abarrotes",
    "icono": "🥗",
    "precio": 0
  },
  {
    "id": "cm-leche-alpina-tradicional-250g",
    "nombre": "Leche Alpina Tradicional 250g",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-kumis-alpina-pack-500g",
    "nombre": "Kumis Alpina Pack 500g",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-pasta-doria-bolsa-400ml",
    "nombre": "Pasta Doria Bolsa 400ml",
    "categoria": "Abarrotes",
    "icono": "🍝",
    "precio": 0
  },
  {
    "id": "cm-crema-colgate-familiar-1-5l",
    "nombre": "Crema Colgate Familiar 1.5L",
    "categoria": "Aseo",
    "icono": "🦷",
    "precio": 0
  },
  {
    "id": "cm-postobon-zero-unidad",
    "nombre": "Postobón Zero Unidad",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-pepsi-zero-1000ml",
    "nombre": "Pepsi Zero 1000ml",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-aceite-gourmet-frasco-lata",
    "nombre": "Aceite Gourmet Frasco Lata",
    "categoria": "Abarrotes",
    "icono": "🍳",
    "precio": 0
  },
  {
    "id": "cm-detodito-tradicional-500g",
    "nombre": "Detodito Tradicional 500g",
    "categoria": "Snacks",
    "icono": "🍟",
    "precio": 0
  },
  {
    "id": "cm-panela-grande-250g",
    "nombre": "Panela Grande 250g",
    "categoria": "Abarrotes",
    "icono": "🟤",
    "precio": 0
  },
  {
    "id": "cm-te-hatsu-familiar-400ml",
    "nombre": "Te Hatsu Familiar 400ml",
    "categoria": "Bebidas",
    "icono": "🍵",
    "precio": 0
  },
  {
    "id": "cm-chocolate-corona-familiar-1-5l",
    "nombre": "Chocolate Corona Familiar 1.5L",
    "categoria": "Abarrotes",
    "icono": "🍫",
    "precio": 0
  },
  {
    "id": "cm-leche-alpina-unidad-unidad",
    "nombre": "Leche Alpina Unidad Unidad",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-cerveza-aguila-grande-1000ml",
    "nombre": "Cerveza Águila Grande 1000ml",
    "categoria": "Licores",
    "icono": "🍺",
    "precio": 0
  },
  {
    "id": "cm-vela-blanca-tradicional-lata",
    "nombre": "Vela Blanca Tradicional Lata",
    "categoria": "Hogar",
    "icono": "🕯️",
    "precio": 0
  },
  {
    "id": "cm-yogurt-alpina-bolsa-1-5l",
    "nombre": "Yogurt Alpina Bolsa 1.5L",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-aceite-gourmet-light-400ml",
    "nombre": "Aceite Gourmet Light 400ml",
    "categoria": "Abarrotes",
    "icono": "🍳",
    "precio": 0
  },
  {
    "id": "cm-jabon-heno-de-pravia-especial-unidad",
    "nombre": "Jabón Heno de Pravia Especial Unidad",
    "categoria": "Aseo",
    "icono": "🧼",
    "precio": 0
  },
  {
    "id": "cm-arequipe-alpina-familiar-250g",
    "nombre": "Arequipe Alpina Familiar 250g",
    "categoria": "Lácteos",
    "icono": "🍯",
    "precio": 0
  },
  {
    "id": "cm-agua-brisa-lata-500ml",
    "nombre": "Agua Brisa Lata 500ml",
    "categoria": "Bebidas",
    "icono": "💧",
    "precio": 0
  },
  {
    "id": "cm-mr-tea-pack-2l",
    "nombre": "Mr Tea Pack 2L",
    "categoria": "Bebidas",
    "icono": "🧊",
    "precio": 0
  },
  {
    "id": "cm-agua-brisa-pack-250g",
    "nombre": "Agua Brisa Pack 250g",
    "categoria": "Bebidas",
    "icono": "💧",
    "precio": 0
  },
  {
    "id": "cm-mr-tea-light-bolsa",
    "nombre": "Mr Tea Light Bolsa",
    "categoria": "Bebidas",
    "icono": "🧊",
    "precio": 0
  },
  {
    "id": "cm-coca-cola-especial-2l",
    "nombre": "Coca-Cola Especial 2L",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-red-bull-lata-500g",
    "nombre": "Red Bull Lata 500g",
    "categoria": "Bebidas",
    "icono": "⚡",
    "precio": 0
  },
  {
    "id": "cm-frijol-cargamanto-frasco-250g",
    "nombre": "Frijol cargamanto Frasco 250g",
    "categoria": "Abarrotes",
    "icono": "🫘",
    "precio": 0
  },
  {
    "id": "cm-club-colombia-pack-unidad",
    "nombre": "Club Colombia Pack Unidad",
    "categoria": "Licores",
    "icono": "🍻",
    "precio": 0
  },
  {
    "id": "cm-enervon-light-1-5l",
    "nombre": "Enervon Light 1.5L",
    "categoria": "Bebidas",
    "icono": "⚡",
    "precio": 0
  },
  {
    "id": "cm-arequipe-alpina-light-1000g",
    "nombre": "Arequipe Alpina Light 1000g",
    "categoria": "Lácteos",
    "icono": "🍯",
    "precio": 0
  },
  {
    "id": "cm-club-colombia-bolsa-lata",
    "nombre": "Club Colombia Bolsa Lata",
    "categoria": "Licores",
    "icono": "🍻",
    "precio": 0
  },
  {
    "id": "cm-coca-cola-tradicional-1-5l",
    "nombre": "Coca-Cola Tradicional 1.5L",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-galletas-ducales-especial-400ml",
    "nombre": "Galletas Ducales Especial 400ml",
    "categoria": "Snacks",
    "icono": "🍘",
    "precio": 0
  },
  {
    "id": "cm-enervon-familiar-1000ml",
    "nombre": "Enervon Familiar 1000ml",
    "categoria": "Bebidas",
    "icono": "⚡",
    "precio": 0
  },
  {
    "id": "cm-sal-refisal-tradicional-1000ml",
    "nombre": "Sal Refisal Tradicional 1000ml",
    "categoria": "Abarrotes",
    "icono": "🧂",
    "precio": 0
  },
  {
    "id": "cm-jugo-hit-especial-250g",
    "nombre": "Jugo Hit Especial 250g",
    "categoria": "Bebidas",
    "icono": "🧃",
    "precio": 0
  },
  {
    "id": "cm-club-colombia-especial-500ml",
    "nombre": "Club Colombia Especial 500ml",
    "categoria": "Licores",
    "icono": "🍻",
    "precio": 0
  },
  {
    "id": "cm-galletas-saltin-grande-250g",
    "nombre": "Galletas Saltín Grande 250g",
    "categoria": "Snacks",
    "icono": "🍘",
    "precio": 0
  },
  {
    "id": "cm-vela-blanca-tradicional-500g",
    "nombre": "Vela Blanca Tradicional 500g",
    "categoria": "Hogar",
    "icono": "🕯️",
    "precio": 0
  },
  {
    "id": "cm-jugo-hit-grande-1000g",
    "nombre": "Jugo Hit Grande 1000g",
    "categoria": "Bebidas",
    "icono": "🧃",
    "precio": 0
  },
  {
    "id": "cm-sal-refisal-frasco-1000g",
    "nombre": "Sal Refisal Frasco 1000g",
    "categoria": "Abarrotes",
    "icono": "🧂",
    "precio": 0
  },
  {
    "id": "cm-pepsi-tradicional-lata",
    "nombre": "Pepsi Tradicional Lata",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-pony-malta-grande-bolsa",
    "nombre": "Pony Malta Grande Bolsa",
    "categoria": "Bebidas",
    "icono": "🍺",
    "precio": 0
  },
  {
    "id": "cm-shampoo-bioexpert-light-400ml",
    "nombre": "Shampoo Bioexpert Light 400ml",
    "categoria": "Aseo",
    "icono": "🧴",
    "precio": 0
  },
  {
    "id": "cm-papas-margarita-pequeno-1000g",
    "nombre": "Papas Margarita Pequeño 1000g",
    "categoria": "Snacks",
    "icono": "🥔",
    "precio": 0
  },
  {
    "id": "cm-arroz-zulia-light-bolsa",
    "nombre": "Arroz Zulia Light Bolsa",
    "categoria": "Abarrotes",
    "icono": "🍚",
    "precio": 0
  },
  {
    "id": "cm-postobon-frasco-lata",
    "nombre": "Postobón Frasco Lata",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-mr-tea-frasco-2l",
    "nombre": "Mr Tea Frasco 2L",
    "categoria": "Bebidas",
    "icono": "🧊",
    "precio": 0
  },
  {
    "id": "cm-aceite-gourmet-especial-400ml",
    "nombre": "Aceite Gourmet Especial 400ml",
    "categoria": "Abarrotes",
    "icono": "🍳",
    "precio": 0
  },
  {
    "id": "cm-chocolate-corona-familiar-unidad",
    "nombre": "Chocolate Corona Familiar Unidad",
    "categoria": "Abarrotes",
    "icono": "🍫",
    "precio": 0
  },
  {
    "id": "cm-red-bull-especial-500g",
    "nombre": "Red Bull Especial 500g",
    "categoria": "Bebidas",
    "icono": "⚡",
    "precio": 0
  },
  {
    "id": "cm-shampoo-bioexpert-pack-bolsa",
    "nombre": "Shampoo Bioexpert Pack Bolsa",
    "categoria": "Aseo",
    "icono": "🧴",
    "precio": 0
  },
  {
    "id": "cm-cafe-aguila-roja-frasco-500g",
    "nombre": "Café Águila Roja Frasco 500g",
    "categoria": "Abarrotes",
    "icono": "☕",
    "precio": 0
  },
  {
    "id": "cm-cafe-sello-rojo-zero-500ml",
    "nombre": "Café Sello Rojo Zero 500ml",
    "categoria": "Abarrotes",
    "icono": "☕",
    "precio": 0
  },
  {
    "id": "cm-harina-haz-de-oros-bolsa-lata",
    "nombre": "Harina Haz de Oros Bolsa Lata",
    "categoria": "Abarrotes",
    "icono": "🌾",
    "precio": 0
  },
  {
    "id": "cm-aceite-gourmet-light-lata",
    "nombre": "Aceite Gourmet Light Lata",
    "categoria": "Abarrotes",
    "icono": "🍳",
    "precio": 0
  },
  {
    "id": "cm-postobon-light-1-5l",
    "nombre": "Postobón Light 1.5L",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-coca-cola-frasco-bolsa",
    "nombre": "Coca-Cola Frasco Bolsa",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-sardinas-lumar-pack-2l",
    "nombre": "Sardinas Lumar Pack 2L",
    "categoria": "Abarrotes",
    "icono": "🐟",
    "precio": 0
  },
  {
    "id": "cm-jabon-rey-grande-2l",
    "nombre": "Jabón Rey Grande 2L",
    "categoria": "Aseo",
    "icono": "🧼",
    "precio": 0
  },
  {
    "id": "cm-sal-refisal-familiar-1000g",
    "nombre": "Sal Refisal Familiar 1000g",
    "categoria": "Abarrotes",
    "icono": "🧂",
    "precio": 0
  },
  {
    "id": "cm-arroz-zulia-zero-400ml",
    "nombre": "Arroz Zulia Zero 400ml",
    "categoria": "Abarrotes",
    "icono": "🍚",
    "precio": 0
  },
  {
    "id": "cm-queso-doble-crema-light-1000g",
    "nombre": "Queso Doble Crema Light 1000g",
    "categoria": "Lácteos",
    "icono": "🧀",
    "precio": 0
  },
  {
    "id": "cm-panela-frasco-500ml",
    "nombre": "Panela Frasco 500ml",
    "categoria": "Abarrotes",
    "icono": "🟤",
    "precio": 0
  },
  {
    "id": "cm-hit-especial-bolsa",
    "nombre": "Hit Especial Bolsa",
    "categoria": "Bebidas",
    "icono": "🧃",
    "precio": 0
  },
  {
    "id": "cm-galletas-saltin-unidad-unidad",
    "nombre": "Galletas Saltín Unidad Unidad",
    "categoria": "Snacks",
    "icono": "🍘",
    "precio": 0
  },
  {
    "id": "cm-galletas-festival-frasco-1-5l",
    "nombre": "Galletas Festival Frasco 1.5L",
    "categoria": "Snacks",
    "icono": "🍪",
    "precio": 0
  },
  {
    "id": "cm-cafe-aguila-roja-pequeno-1-5l",
    "nombre": "Café Águila Roja Pequeño 1.5L",
    "categoria": "Abarrotes",
    "icono": "☕",
    "precio": 0
  },
  {
    "id": "cm-mr-tea-grande-bolsa",
    "nombre": "Mr Tea Grande Bolsa",
    "categoria": "Bebidas",
    "icono": "🧊",
    "precio": 0
  },
  {
    "id": "cm-agua-brisa-pequeno-2l",
    "nombre": "Agua Brisa Pequeño 2L",
    "categoria": "Bebidas",
    "icono": "💧",
    "precio": 0
  },
  {
    "id": "cm-arroz-zulia-unidad-bolsa",
    "nombre": "Arroz Zulia Unidad Bolsa",
    "categoria": "Abarrotes",
    "icono": "🍚",
    "precio": 0
  },
  {
    "id": "cm-yogurt-alpina-tradicional-2l",
    "nombre": "Yogurt Alpina Tradicional 2L",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-panela-grande-500g",
    "nombre": "Panela Grande 500g",
    "categoria": "Abarrotes",
    "icono": "🟤",
    "precio": 0
  },
  {
    "id": "cm-leche-alqueria-unidad-400ml",
    "nombre": "Leche Alquería Unidad 400ml",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-arroz-roa-pack-250g",
    "nombre": "Arroz Roa Pack 250g",
    "categoria": "Abarrotes",
    "icono": "🍚",
    "precio": 0
  },
  {
    "id": "cm-jugo-hit-pequeno-1000g",
    "nombre": "Jugo Hit Pequeño 1000g",
    "categoria": "Bebidas",
    "icono": "🧃",
    "precio": 0
  },
  {
    "id": "cm-mr-tea-especial-unidad",
    "nombre": "Mr Tea Especial Unidad",
    "categoria": "Bebidas",
    "icono": "🧊",
    "precio": 0
  },
  {
    "id": "cm-leche-alqueria-lata-1000g",
    "nombre": "Leche Alquería Lata 1000g",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-galletas-ducales-light-2l",
    "nombre": "Galletas Ducales Light 2L",
    "categoria": "Snacks",
    "icono": "🍘",
    "precio": 0
  },
  {
    "id": "cm-enervon-pequeno-1000ml",
    "nombre": "Enervon Pequeño 1000ml",
    "categoria": "Bebidas",
    "icono": "⚡",
    "precio": 0
  },
  {
    "id": "cm-leche-colanta-tradicional-500ml",
    "nombre": "Leche Colanta Tradicional 500ml",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-fosforos-el-rey-pack-400ml",
    "nombre": "Fósforos El Rey Pack 400ml",
    "categoria": "Hogar",
    "icono": "🔥",
    "precio": 0
  },
  {
    "id": "cm-limpido-clorox-pack-lata",
    "nombre": "Límpido Clorox Pack Lata",
    "categoria": "Aseo",
    "icono": "🧴",
    "precio": 0
  },
  {
    "id": "cm-mr-tea-lata-500ml",
    "nombre": "Mr Tea Lata 500ml",
    "categoria": "Bebidas",
    "icono": "🧊",
    "precio": 0
  },
  {
    "id": "cm-galletas-ducales-familiar-bolsa",
    "nombre": "Galletas Ducales Familiar Bolsa",
    "categoria": "Snacks",
    "icono": "🍘",
    "precio": 0
  },
  {
    "id": "cm-sardinas-lumar-familiar-250g",
    "nombre": "Sardinas Lumar Familiar 250g",
    "categoria": "Abarrotes",
    "icono": "🐟",
    "precio": 0
  },
  {
    "id": "cm-pepsi-grande-250g",
    "nombre": "Pepsi Grande 250g",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-leche-alqueria-unidad-2l",
    "nombre": "Leche Alquería Unidad 2L",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-chocolate-corona-familiar-500ml",
    "nombre": "Chocolate Corona Familiar 500ml",
    "categoria": "Abarrotes",
    "icono": "🍫",
    "precio": 0
  },
  {
    "id": "cm-arroz-zulia-unidad-1-5l",
    "nombre": "Arroz Zulia Unidad 1.5L",
    "categoria": "Abarrotes",
    "icono": "🍚",
    "precio": 0
  },
  {
    "id": "cm-sardinas-lumar-frasco-250g",
    "nombre": "Sardinas Lumar Frasco 250g",
    "categoria": "Abarrotes",
    "icono": "🐟",
    "precio": 0
  },
  {
    "id": "cm-harina-haz-de-oros-tradicional-500ml",
    "nombre": "Harina Haz de Oros Tradicional 500ml",
    "categoria": "Abarrotes",
    "icono": "🌾",
    "precio": 0
  },
  {
    "id": "cm-cerveza-aguila-light-1000ml",
    "nombre": "Cerveza Águila Light 1000ml",
    "categoria": "Licores",
    "icono": "🍺",
    "precio": 0
  },
  {
    "id": "cm-arroz-zulia-light-unidad",
    "nombre": "Arroz Zulia Light Unidad",
    "categoria": "Abarrotes",
    "icono": "🍚",
    "precio": 0
  },
  {
    "id": "cm-pan-bimbo-zero-500ml",
    "nombre": "Pan Bimbo Zero 500ml",
    "categoria": "Panadería",
    "icono": "🍞",
    "precio": 0
  },
  {
    "id": "cm-te-hatsu-pequeno-1000g",
    "nombre": "Te Hatsu Pequeño 1000g",
    "categoria": "Bebidas",
    "icono": "🍵",
    "precio": 0
  },
  {
    "id": "cm-detergente-ariel-pequeno-lata",
    "nombre": "Detergente Ariel Pequeño Lata",
    "categoria": "Aseo",
    "icono": "🧺",
    "precio": 0
  },
  {
    "id": "cm-barra-gala-unidad-1000g",
    "nombre": "Barra Gala Unidad 1000g",
    "categoria": "Snacks",
    "icono": "🍰",
    "precio": 0
  },
  {
    "id": "cm-leche-colanta-familiar-1000ml",
    "nombre": "Leche Colanta Familiar 1000ml",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-agua-brisa-tradicional-lata",
    "nombre": "Agua Brisa Tradicional Lata",
    "categoria": "Bebidas",
    "icono": "💧",
    "precio": 0
  },
  {
    "id": "cm-red-bull-especial-lata",
    "nombre": "Red Bull Especial Lata",
    "categoria": "Bebidas",
    "icono": "⚡",
    "precio": 0
  },
  {
    "id": "cm-barra-gala-especial-500ml",
    "nombre": "Barra Gala Especial 500ml",
    "categoria": "Snacks",
    "icono": "🍰",
    "precio": 0
  },
  {
    "id": "cm-hit-light-400ml",
    "nombre": "Hit Light 400ml",
    "categoria": "Bebidas",
    "icono": "🧃",
    "precio": 0
  },
  {
    "id": "cm-mr-tea-unidad-400ml",
    "nombre": "Mr Tea Unidad 400ml",
    "categoria": "Bebidas",
    "icono": "🧊",
    "precio": 0
  },
  {
    "id": "cm-pepsi-especial-400ml",
    "nombre": "Pepsi Especial 400ml",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-postobon-pack-500ml",
    "nombre": "Postobón Pack 500ml",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-agua-brisa-pequeno-500g",
    "nombre": "Agua Brisa Pequeño 500g",
    "categoria": "Bebidas",
    "icono": "💧",
    "precio": 0
  },
  {
    "id": "cm-pony-malta-zero-1000ml",
    "nombre": "Pony Malta Zero 1000ml",
    "categoria": "Bebidas",
    "icono": "🍺",
    "precio": 0
  },
  {
    "id": "cm-kumis-alpina-lata-1000ml",
    "nombre": "Kumis Alpina Lata 1000ml",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-harina-dona-nora-tradicional-250g",
    "nombre": "Harina Doña Nora Tradicional 250g",
    "categoria": "Abarrotes",
    "icono": "🌽",
    "precio": 0
  },
  {
    "id": "cm-te-hatsu-frasco-500g",
    "nombre": "Te Hatsu Frasco 500g",
    "categoria": "Bebidas",
    "icono": "🍵",
    "precio": 0
  },
  {
    "id": "cm-papas-margarita-tradicional-500ml",
    "nombre": "Papas Margarita Tradicional 500ml",
    "categoria": "Snacks",
    "icono": "🥔",
    "precio": 0
  },
  {
    "id": "cm-coca-cola-lata-250g",
    "nombre": "Coca-Cola Lata 250g",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-lentejas-light-1000g",
    "nombre": "Lentejas Light 1000g",
    "categoria": "Abarrotes",
    "icono": "🫘",
    "precio": 0
  },
  {
    "id": "cm-pasta-doria-tradicional-500g",
    "nombre": "Pasta Doria Tradicional 500g",
    "categoria": "Abarrotes",
    "icono": "🍝",
    "precio": 0
  },
  {
    "id": "cm-aceite-gourmet-bolsa-bolsa",
    "nombre": "Aceite Gourmet Bolsa Bolsa",
    "categoria": "Abarrotes",
    "icono": "🍳",
    "precio": 0
  },
  {
    "id": "cm-lentejas-pack-unidad",
    "nombre": "Lentejas Pack Unidad",
    "categoria": "Abarrotes",
    "icono": "🫘",
    "precio": 0
  },
  {
    "id": "cm-detodito-zero-1000ml",
    "nombre": "Detodito Zero 1000ml",
    "categoria": "Snacks",
    "icono": "🍟",
    "precio": 0
  },
  {
    "id": "cm-harina-dona-nora-especial-lata",
    "nombre": "Harina Doña Nora Especial Lata",
    "categoria": "Abarrotes",
    "icono": "🌽",
    "precio": 0
  },
  {
    "id": "cm-harina-dona-nora-lata-1-5l",
    "nombre": "Harina Doña Nora Lata 1.5L",
    "categoria": "Abarrotes",
    "icono": "🌽",
    "precio": 0
  },
  {
    "id": "cm-papel-higienico-familia-light-unidad",
    "nombre": "Papel Higiénico Familia Light Unidad",
    "categoria": "Aseo",
    "icono": "🧻",
    "precio": 0
  },
  {
    "id": "cm-vela-blanca-grande-lata",
    "nombre": "Vela Blanca Grande Lata",
    "categoria": "Hogar",
    "icono": "🕯️",
    "precio": 0
  },
  {
    "id": "cm-arequipe-alpina-unidad-1-5l",
    "nombre": "Arequipe Alpina Unidad 1.5L",
    "categoria": "Lácteos",
    "icono": "🍯",
    "precio": 0
  },
  {
    "id": "cm-toallas-nosotras-tradicional-500ml",
    "nombre": "Toallas Nosotras Tradicional 500ml",
    "categoria": "Aseo",
    "icono": "🩹",
    "precio": 0
  },
  {
    "id": "cm-leche-alpina-light-500g",
    "nombre": "Leche Alpina Light 500g",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-leche-alpina-familiar-lata",
    "nombre": "Leche Alpina Familiar Lata",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-toallas-nosotras-bolsa-lata",
    "nombre": "Toallas Nosotras Bolsa Lata",
    "categoria": "Aseo",
    "icono": "🩹",
    "precio": 0
  },
  {
    "id": "cm-atun-van-camp-s-pack-unidad",
    "nombre": "Atún Van Camp's Pack Unidad",
    "categoria": "Abarrotes",
    "icono": "🐟",
    "precio": 0
  },
  {
    "id": "cm-agua-cristal-bolsa-1000g",
    "nombre": "Agua Cristal Bolsa 1000g",
    "categoria": "Bebidas",
    "icono": "💧",
    "precio": 0
  },
  {
    "id": "cm-galletas-saltin-pequeno-250g",
    "nombre": "Galletas Saltín Pequeño 250g",
    "categoria": "Snacks",
    "icono": "🍘",
    "precio": 0
  },
  {
    "id": "cm-sardinas-lumar-grande-250g",
    "nombre": "Sardinas Lumar Grande 250g",
    "categoria": "Abarrotes",
    "icono": "🐟",
    "precio": 0
  },
  {
    "id": "cm-cafe-sello-rojo-frasco-1-5l",
    "nombre": "Café Sello Rojo Frasco 1.5L",
    "categoria": "Abarrotes",
    "icono": "☕",
    "precio": 0
  },
  {
    "id": "cm-agua-cristal-zero-1000g",
    "nombre": "Agua Cristal Zero 1000g",
    "categoria": "Bebidas",
    "icono": "💧",
    "precio": 0
  },
  {
    "id": "cm-coca-cola-grande-1000g",
    "nombre": "Coca-Cola Grande 1000g",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-salsa-de-tomate-fruco-pack-500ml",
    "nombre": "Salsa de Tomate Fruco Pack 500ml",
    "categoria": "Abarrotes",
    "icono": "🍅",
    "precio": 0
  },
  {
    "id": "cm-queso-campesino-unidad-250g",
    "nombre": "Queso Campesino Unidad 250g",
    "categoria": "Lácteos",
    "icono": "🧀",
    "precio": 0
  },
  {
    "id": "cm-pepsi-grande-lata",
    "nombre": "Pepsi Grande Lata",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-papas-margarita-pequeno-bolsa",
    "nombre": "Papas Margarita Pequeño Bolsa",
    "categoria": "Snacks",
    "icono": "🥔",
    "precio": 0
  },
  {
    "id": "cm-papel-higienico-familia-frasco-2l",
    "nombre": "Papel Higiénico Familia Frasco 2L",
    "categoria": "Aseo",
    "icono": "🧻",
    "precio": 0
  },
  {
    "id": "cm-arroz-diana-frasco-2l",
    "nombre": "Arroz Diana Frasco 2L",
    "categoria": "Abarrotes",
    "icono": "🍚",
    "precio": 0
  },
  {
    "id": "cm-jabon-heno-de-pravia-pack-1000ml",
    "nombre": "Jabón Heno de Pravia Pack 1000ml",
    "categoria": "Aseo",
    "icono": "🧼",
    "precio": 0
  },
  {
    "id": "cm-leche-colanta-lata-400ml",
    "nombre": "Leche Colanta Lata 400ml",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-galletas-festival-lata-400ml",
    "nombre": "Galletas Festival Lata 400ml",
    "categoria": "Snacks",
    "icono": "🍪",
    "precio": 0
  },
  {
    "id": "cm-papel-higienico-familia-grande-lata",
    "nombre": "Papel Higiénico Familia Grande Lata",
    "categoria": "Aseo",
    "icono": "🧻",
    "precio": 0
  },
  {
    "id": "cm-harina-haz-de-oros-familiar-2l",
    "nombre": "Harina Haz de Oros Familiar 2L",
    "categoria": "Abarrotes",
    "icono": "🌾",
    "precio": 0
  },
  {
    "id": "cm-aceite-premier-pequeno-500g",
    "nombre": "Aceite Premier Pequeño 500g",
    "categoria": "Abarrotes",
    "icono": "🍳",
    "precio": 0
  },
  {
    "id": "cm-toallas-nosotras-lata-500ml",
    "nombre": "Toallas Nosotras Lata 500ml",
    "categoria": "Aseo",
    "icono": "🩹",
    "precio": 0
  },
  {
    "id": "cm-agua-brisa-especial-bolsa",
    "nombre": "Agua Brisa Especial Bolsa",
    "categoria": "Bebidas",
    "icono": "💧",
    "precio": 0
  },
  {
    "id": "cm-coca-cola-frasco-2l",
    "nombre": "Coca-Cola Frasco 2L",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-postobon-bolsa-unidad",
    "nombre": "Postobón Bolsa Unidad",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-papel-higienico-familia-grande-unidad",
    "nombre": "Papel Higiénico Familia Grande Unidad",
    "categoria": "Aseo",
    "icono": "🧻",
    "precio": 0
  },
  {
    "id": "cm-galletas-ducales-pequeno-2l",
    "nombre": "Galletas Ducales Pequeño 2L",
    "categoria": "Snacks",
    "icono": "🍘",
    "precio": 0
  },
  {
    "id": "cm-leche-alpina-familiar-1000g",
    "nombre": "Leche Alpina Familiar 1000g",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-postobon-especial-400ml",
    "nombre": "Postobón Especial 400ml",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-vela-blanca-lata-500g",
    "nombre": "Vela Blanca Lata 500g",
    "categoria": "Hogar",
    "icono": "🕯️",
    "precio": 0
  },
  {
    "id": "cm-hit-especial-unidad",
    "nombre": "Hit Especial Unidad",
    "categoria": "Bebidas",
    "icono": "🧃",
    "precio": 0
  },
  {
    "id": "cm-chocorramo-especial-400ml",
    "nombre": "Chocorramo Especial 400ml",
    "categoria": "Snacks",
    "icono": "🧁",
    "precio": 0
  },
  {
    "id": "cm-cerveza-poker-pack-2l",
    "nombre": "Cerveza Poker Pack 2L",
    "categoria": "Licores",
    "icono": "🍺",
    "precio": 0
  },
  {
    "id": "cm-chocolate-corona-light-1-5l",
    "nombre": "Chocolate Corona Light 1.5L",
    "categoria": "Abarrotes",
    "icono": "🍫",
    "precio": 0
  },
  {
    "id": "cm-cafe-aguila-roja-familiar-1000ml",
    "nombre": "Café Águila Roja Familiar 1000ml",
    "categoria": "Abarrotes",
    "icono": "☕",
    "precio": 0
  },
  {
    "id": "cm-fosforos-el-rey-tradicional-1-5l",
    "nombre": "Fósforos El Rey Tradicional 1.5L",
    "categoria": "Hogar",
    "icono": "🔥",
    "precio": 0
  },
  {
    "id": "cm-frijol-cargamanto-lata-400ml",
    "nombre": "Frijol cargamanto Lata 400ml",
    "categoria": "Abarrotes",
    "icono": "🫘",
    "precio": 0
  },
  {
    "id": "cm-limpido-clorox-grande-bolsa",
    "nombre": "Límpido Clorox Grande Bolsa",
    "categoria": "Aseo",
    "icono": "🧴",
    "precio": 0
  },
  {
    "id": "cm-aceite-premier-familiar-lata",
    "nombre": "Aceite Premier Familiar Lata",
    "categoria": "Abarrotes",
    "icono": "🍳",
    "precio": 0
  },
  {
    "id": "cm-pasta-doria-light-500g",
    "nombre": "Pasta Doria Light 500g",
    "categoria": "Abarrotes",
    "icono": "🍝",
    "precio": 0
  },
  {
    "id": "cm-pasta-doria-familiar-500g",
    "nombre": "Pasta Doria Familiar 500g",
    "categoria": "Abarrotes",
    "icono": "🍝",
    "precio": 0
  },
  {
    "id": "cm-detergente-ariel-zero-1-5l",
    "nombre": "Detergente Ariel Zero 1.5L",
    "categoria": "Aseo",
    "icono": "🧺",
    "precio": 0
  },
  {
    "id": "cm-mr-tea-unidad-2l",
    "nombre": "Mr Tea Unidad 2L",
    "categoria": "Bebidas",
    "icono": "🧊",
    "precio": 0
  },
  {
    "id": "cm-postobon-pequeno-lata",
    "nombre": "Postobón Pequeño Lata",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-crema-colgate-grande-2l",
    "nombre": "Crema Colgate Grande 2L",
    "categoria": "Aseo",
    "icono": "🦷",
    "precio": 0
  },
  {
    "id": "cm-pepsi-frasco-bolsa",
    "nombre": "Pepsi Frasco Bolsa",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-harina-dona-nora-light-unidad",
    "nombre": "Harina Doña Nora Light Unidad",
    "categoria": "Abarrotes",
    "icono": "🌽",
    "precio": 0
  },
  {
    "id": "cm-toallas-nosotras-bolsa-bolsa",
    "nombre": "Toallas Nosotras Bolsa Bolsa",
    "categoria": "Aseo",
    "icono": "🩹",
    "precio": 0
  },
  {
    "id": "cm-trident-lata-500ml",
    "nombre": "Trident Lata 500ml",
    "categoria": "Snacks",
    "icono": "🍬",
    "precio": 0
  },
  {
    "id": "cm-fosforos-el-rey-especial-500ml",
    "nombre": "Fósforos El Rey Especial 500ml",
    "categoria": "Hogar",
    "icono": "🔥",
    "precio": 0
  },
  {
    "id": "cm-mayonesa-fruco-pack-2l",
    "nombre": "Mayonesa Fruco Pack 2L",
    "categoria": "Abarrotes",
    "icono": "🥗",
    "precio": 0
  },
  {
    "id": "cm-pepsi-unidad-400ml",
    "nombre": "Pepsi Unidad 400ml",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-arroz-zulia-tradicional-500g",
    "nombre": "Arroz Zulia Tradicional 500g",
    "categoria": "Abarrotes",
    "icono": "🍚",
    "precio": 0
  },
  {
    "id": "cm-enervon-grande-unidad",
    "nombre": "Enervon Grande Unidad",
    "categoria": "Bebidas",
    "icono": "⚡",
    "precio": 0
  },
  {
    "id": "cm-frijol-cargamanto-light-bolsa",
    "nombre": "Frijol cargamanto Light Bolsa",
    "categoria": "Abarrotes",
    "icono": "🫘",
    "precio": 0
  },
  {
    "id": "cm-queso-doble-crema-familiar-1-5l",
    "nombre": "Queso Doble Crema Familiar 1.5L",
    "categoria": "Lácteos",
    "icono": "🧀",
    "precio": 0
  },
  {
    "id": "cm-coca-cola-pack-1000ml",
    "nombre": "Coca-Cola Pack 1000ml",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-cafe-aguila-roja-bolsa-2l",
    "nombre": "Café Águila Roja Bolsa 2L",
    "categoria": "Abarrotes",
    "icono": "☕",
    "precio": 0
  },
  {
    "id": "cm-salsa-de-tomate-fruco-light-1000g",
    "nombre": "Salsa de Tomate Fruco Light 1000g",
    "categoria": "Abarrotes",
    "icono": "🍅",
    "precio": 0
  },
  {
    "id": "cm-enervon-pack-500ml",
    "nombre": "Enervon Pack 500ml",
    "categoria": "Bebidas",
    "icono": "⚡",
    "precio": 0
  },
  {
    "id": "cm-frijol-cargamanto-pequeno-1000ml",
    "nombre": "Frijol cargamanto Pequeño 1000ml",
    "categoria": "Abarrotes",
    "icono": "🫘",
    "precio": 0
  },
  {
    "id": "cm-chocolate-corona-pequeno-bolsa",
    "nombre": "Chocolate Corona Pequeño Bolsa",
    "categoria": "Abarrotes",
    "icono": "🍫",
    "precio": 0
  },
  {
    "id": "cm-queso-doble-crema-tradicional-500g",
    "nombre": "Queso Doble Crema Tradicional 500g",
    "categoria": "Lácteos",
    "icono": "🧀",
    "precio": 0
  },
  {
    "id": "cm-chocorramo-tradicional-500g",
    "nombre": "Chocorramo Tradicional 500g",
    "categoria": "Snacks",
    "icono": "🧁",
    "precio": 0
  },
  {
    "id": "cm-mantequilla-la-vaquita-frasco-bolsa",
    "nombre": "Mantequilla La Vaquita Frasco Bolsa",
    "categoria": "Lácteos",
    "icono": "🧈",
    "precio": 0
  },
  {
    "id": "cm-limpido-clorox-grande-500ml",
    "nombre": "Límpido Clorox Grande 500ml",
    "categoria": "Aseo",
    "icono": "🧴",
    "precio": 0
  },
  {
    "id": "cm-jabon-rey-familiar-lata",
    "nombre": "Jabón Rey Familiar Lata",
    "categoria": "Aseo",
    "icono": "🧼",
    "precio": 0
  },
  {
    "id": "cm-galletas-ducales-pack-500ml",
    "nombre": "Galletas Ducales Pack 500ml",
    "categoria": "Snacks",
    "icono": "🍘",
    "precio": 0
  },
  {
    "id": "cm-atun-van-camp-s-bolsa-lata",
    "nombre": "Atún Van Camp's Bolsa Lata",
    "categoria": "Abarrotes",
    "icono": "🐟",
    "precio": 0
  },
  {
    "id": "cm-leche-colanta-grande-2l",
    "nombre": "Leche Colanta Grande 2L",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-pan-bimbo-familiar-lata",
    "nombre": "Pan Bimbo Familiar Lata",
    "categoria": "Panadería",
    "icono": "🍞",
    "precio": 0
  },
  {
    "id": "cm-aceite-premier-unidad-500ml",
    "nombre": "Aceite Premier Unidad 500ml",
    "categoria": "Abarrotes",
    "icono": "🍳",
    "precio": 0
  },
  {
    "id": "cm-club-colombia-familiar-lata",
    "nombre": "Club Colombia Familiar Lata",
    "categoria": "Licores",
    "icono": "🍻",
    "precio": 0
  },
  {
    "id": "cm-jugo-hit-unidad-1000g",
    "nombre": "Jugo Hit Unidad 1000g",
    "categoria": "Bebidas",
    "icono": "🧃",
    "precio": 0
  },
  {
    "id": "cm-galletas-saltin-pack-2l",
    "nombre": "Galletas Saltín Pack 2L",
    "categoria": "Snacks",
    "icono": "🍘",
    "precio": 0
  },
  {
    "id": "cm-chocolate-corona-unidad-500g",
    "nombre": "Chocolate Corona Unidad 500g",
    "categoria": "Abarrotes",
    "icono": "🍫",
    "precio": 0
  },
  {
    "id": "cm-mayonesa-fruco-unidad-500g",
    "nombre": "Mayonesa Fruco Unidad 500g",
    "categoria": "Abarrotes",
    "icono": "🥗",
    "precio": 0
  },
  {
    "id": "cm-cafe-sello-rojo-tradicional-250g",
    "nombre": "Café Sello Rojo Tradicional 250g",
    "categoria": "Abarrotes",
    "icono": "☕",
    "precio": 0
  },
  {
    "id": "cm-aceite-gourmet-zero-1000g",
    "nombre": "Aceite Gourmet Zero 1000g",
    "categoria": "Abarrotes",
    "icono": "🍳",
    "precio": 0
  },
  {
    "id": "cm-shampoo-bioexpert-pack-2l",
    "nombre": "Shampoo Bioexpert Pack 2L",
    "categoria": "Aseo",
    "icono": "🧴",
    "precio": 0
  },
  {
    "id": "cm-detergente-ariel-lata-1000g",
    "nombre": "Detergente Ariel Lata 1000g",
    "categoria": "Aseo",
    "icono": "🧺",
    "precio": 0
  },
  {
    "id": "cm-arroz-roa-light-1000ml",
    "nombre": "Arroz Roa Light 1000ml",
    "categoria": "Abarrotes",
    "icono": "🍚",
    "precio": 0
  },
  {
    "id": "cm-cafe-aguila-roja-lata-bolsa",
    "nombre": "Café Águila Roja Lata Bolsa",
    "categoria": "Abarrotes",
    "icono": "☕",
    "precio": 0
  },
  {
    "id": "cm-enervon-tradicional-2l",
    "nombre": "Enervon Tradicional 2L",
    "categoria": "Bebidas",
    "icono": "⚡",
    "precio": 0
  },
  {
    "id": "cm-fosforos-el-rey-pack-2l",
    "nombre": "Fósforos El Rey Pack 2L",
    "categoria": "Hogar",
    "icono": "🔥",
    "precio": 0
  },
  {
    "id": "cm-jabon-rey-pack-bolsa",
    "nombre": "Jabón Rey Pack Bolsa",
    "categoria": "Aseo",
    "icono": "🧼",
    "precio": 0
  },
  {
    "id": "cm-cerveza-aguila-grande-500g",
    "nombre": "Cerveza Águila Grande 500g",
    "categoria": "Licores",
    "icono": "🍺",
    "precio": 0
  },
  {
    "id": "cm-galletas-ducales-pequeno-lata",
    "nombre": "Galletas Ducales Pequeño Lata",
    "categoria": "Snacks",
    "icono": "🍘",
    "precio": 0
  },
  {
    "id": "cm-kumis-alpina-frasco-1000g",
    "nombre": "Kumis Alpina Frasco 1000g",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-fosforos-el-rey-especial-1-5l",
    "nombre": "Fósforos El Rey Especial 1.5L",
    "categoria": "Hogar",
    "icono": "🔥",
    "precio": 0
  },
  {
    "id": "cm-atun-van-camp-s-frasco-500ml",
    "nombre": "Atún Van Camp's Frasco 500ml",
    "categoria": "Abarrotes",
    "icono": "🐟",
    "precio": 0
  },
  {
    "id": "cm-aceite-premier-lata-400ml",
    "nombre": "Aceite Premier Lata 400ml",
    "categoria": "Abarrotes",
    "icono": "🍳",
    "precio": 0
  },
  {
    "id": "cm-leche-colanta-lata-1-5l",
    "nombre": "Leche Colanta Lata 1.5L",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-queso-campesino-zero-2l",
    "nombre": "Queso Campesino Zero 2L",
    "categoria": "Lácteos",
    "icono": "🧀",
    "precio": 0
  },
  {
    "id": "cm-vela-blanca-bolsa-1-5l",
    "nombre": "Vela Blanca Bolsa 1.5L",
    "categoria": "Hogar",
    "icono": "🕯️",
    "precio": 0
  },
  {
    "id": "cm-leche-alqueria-bolsa-1000g",
    "nombre": "Leche Alquería Bolsa 1000g",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-mantequilla-la-vaquita-lata-400ml",
    "nombre": "Mantequilla La Vaquita Lata 400ml",
    "categoria": "Lácteos",
    "icono": "🧈",
    "precio": 0
  },
  {
    "id": "cm-mayonesa-fruco-familiar-500ml",
    "nombre": "Mayonesa Fruco Familiar 500ml",
    "categoria": "Abarrotes",
    "icono": "🥗",
    "precio": 0
  },
  {
    "id": "cm-pasta-doria-grande-1000ml",
    "nombre": "Pasta Doria Grande 1000ml",
    "categoria": "Abarrotes",
    "icono": "🍝",
    "precio": 0
  },
  {
    "id": "cm-pan-bimbo-familiar-1000ml",
    "nombre": "Pan Bimbo Familiar 1000ml",
    "categoria": "Panadería",
    "icono": "🍞",
    "precio": 0
  },
  {
    "id": "cm-chocolate-corona-pack-250g",
    "nombre": "Chocolate Corona Pack 250g",
    "categoria": "Abarrotes",
    "icono": "🍫",
    "precio": 0
  },
  {
    "id": "cm-pasta-doria-grande-bolsa",
    "nombre": "Pasta Doria Grande Bolsa",
    "categoria": "Abarrotes",
    "icono": "🍝",
    "precio": 0
  },
  {
    "id": "cm-enervon-tradicional-500g",
    "nombre": "Enervon Tradicional 500g",
    "categoria": "Bebidas",
    "icono": "⚡",
    "precio": 0
  },
  {
    "id": "cm-frijol-cargamanto-pack-unidad",
    "nombre": "Frijol cargamanto Pack Unidad",
    "categoria": "Abarrotes",
    "icono": "🫘",
    "precio": 0
  },
  {
    "id": "cm-red-bull-pack-2l",
    "nombre": "Red Bull Pack 2L",
    "categoria": "Bebidas",
    "icono": "⚡",
    "precio": 0
  },
  {
    "id": "cm-barra-gala-bolsa-400ml",
    "nombre": "Barra Gala Bolsa 400ml",
    "categoria": "Snacks",
    "icono": "🍰",
    "precio": 0
  },
  {
    "id": "cm-papel-higienico-familia-zero-500ml",
    "nombre": "Papel Higiénico Familia Zero 500ml",
    "categoria": "Aseo",
    "icono": "🧻",
    "precio": 0
  },
  {
    "id": "cm-pasta-doria-grande-1000g",
    "nombre": "Pasta Doria Grande 1000g",
    "categoria": "Abarrotes",
    "icono": "🍝",
    "precio": 0
  },
  {
    "id": "cm-agua-cristal-grande-lata",
    "nombre": "Agua Cristal Grande Lata",
    "categoria": "Bebidas",
    "icono": "💧",
    "precio": 0
  },
  {
    "id": "cm-limpido-clorox-lata-500g",
    "nombre": "Límpido Clorox Lata 500g",
    "categoria": "Aseo",
    "icono": "🧴",
    "precio": 0
  },
  {
    "id": "cm-leche-alqueria-tradicional-1-5l",
    "nombre": "Leche Alquería Tradicional 1.5L",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-agua-cristal-zero-bolsa",
    "nombre": "Agua Cristal Zero Bolsa",
    "categoria": "Bebidas",
    "icono": "💧",
    "precio": 0
  },
  {
    "id": "cm-club-colombia-bolsa-unidad",
    "nombre": "Club Colombia Bolsa Unidad",
    "categoria": "Licores",
    "icono": "🍻",
    "precio": 0
  },
  {
    "id": "cm-pan-bimbo-tradicional-250g",
    "nombre": "Pan Bimbo Tradicional 250g",
    "categoria": "Panadería",
    "icono": "🍞",
    "precio": 0
  },
  {
    "id": "cm-kumis-alpina-pack-500ml",
    "nombre": "Kumis Alpina Pack 500ml",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-agua-brisa-familiar-1-5l",
    "nombre": "Agua Brisa Familiar 1.5L",
    "categoria": "Bebidas",
    "icono": "💧",
    "precio": 0
  },
  {
    "id": "cm-red-bull-unidad-1000g",
    "nombre": "Red Bull Unidad 1000g",
    "categoria": "Bebidas",
    "icono": "⚡",
    "precio": 0
  },
  {
    "id": "cm-jabon-rey-especial-1000g",
    "nombre": "Jabón Rey Especial 1000g",
    "categoria": "Aseo",
    "icono": "🧼",
    "precio": 0
  },
  {
    "id": "cm-trident-lata-400ml",
    "nombre": "Trident Lata 400ml",
    "categoria": "Snacks",
    "icono": "🍬",
    "precio": 0
  },
  {
    "id": "cm-galletas-saltin-especial-unidad",
    "nombre": "Galletas Saltín Especial Unidad",
    "categoria": "Snacks",
    "icono": "🍘",
    "precio": 0
  },
  {
    "id": "cm-cerveza-aguila-tradicional-1-5l",
    "nombre": "Cerveza Águila Tradicional 1.5L",
    "categoria": "Licores",
    "icono": "🍺",
    "precio": 0
  },
  {
    "id": "cm-sal-refisal-bolsa-500g",
    "nombre": "Sal Refisal Bolsa 500g",
    "categoria": "Abarrotes",
    "icono": "🧂",
    "precio": 0
  },
  {
    "id": "cm-pasta-doria-especial-500g",
    "nombre": "Pasta Doria Especial 500g",
    "categoria": "Abarrotes",
    "icono": "🍝",
    "precio": 0
  },
  {
    "id": "cm-cerveza-poker-light-2l",
    "nombre": "Cerveza Poker Light 2L",
    "categoria": "Licores",
    "icono": "🍺",
    "precio": 0
  },
  {
    "id": "cm-galletas-festival-especial-500g",
    "nombre": "Galletas Festival Especial 500g",
    "categoria": "Snacks",
    "icono": "🍪",
    "precio": 0
  },
  {
    "id": "cm-jugo-hit-pack-unidad",
    "nombre": "Jugo Hit Pack Unidad",
    "categoria": "Bebidas",
    "icono": "🧃",
    "precio": 0
  },
  {
    "id": "cm-jabon-heno-de-pravia-lata-250g",
    "nombre": "Jabón Heno de Pravia Lata 250g",
    "categoria": "Aseo",
    "icono": "🧼",
    "precio": 0
  },
  {
    "id": "cm-mayonesa-fruco-frasco-bolsa",
    "nombre": "Mayonesa Fruco Frasco Bolsa",
    "categoria": "Abarrotes",
    "icono": "🥗",
    "precio": 0
  },
  {
    "id": "cm-detergente-ariel-lata-250g",
    "nombre": "Detergente Ariel Lata 250g",
    "categoria": "Aseo",
    "icono": "🧺",
    "precio": 0
  },
  {
    "id": "cm-papas-margarita-especial-2l",
    "nombre": "Papas Margarita Especial 2L",
    "categoria": "Snacks",
    "icono": "🥔",
    "precio": 0
  },
  {
    "id": "cm-fosforos-el-rey-bolsa-500ml",
    "nombre": "Fósforos El Rey Bolsa 500ml",
    "categoria": "Hogar",
    "icono": "🔥",
    "precio": 0
  },
  {
    "id": "cm-lentejas-tradicional-lata",
    "nombre": "Lentejas Tradicional Lata",
    "categoria": "Abarrotes",
    "icono": "🫘",
    "precio": 0
  },
  {
    "id": "cm-salsa-de-tomate-fruco-tradicional-bolsa",
    "nombre": "Salsa de Tomate Fruco Tradicional Bolsa",
    "categoria": "Abarrotes",
    "icono": "🍅",
    "precio": 0
  },
  {
    "id": "cm-atun-van-camp-s-familiar-1000g",
    "nombre": "Atún Van Camp's Familiar 1000g",
    "categoria": "Abarrotes",
    "icono": "🐟",
    "precio": 0
  },
  {
    "id": "cm-crema-colgate-lata-500g",
    "nombre": "Crema Colgate Lata 500g",
    "categoria": "Aseo",
    "icono": "🦷",
    "precio": 0
  },
  {
    "id": "cm-frijol-cargamanto-grande-500ml",
    "nombre": "Frijol cargamanto Grande 500ml",
    "categoria": "Abarrotes",
    "icono": "🫘",
    "precio": 0
  },
  {
    "id": "cm-mr-tea-unidad-1-5l",
    "nombre": "Mr Tea Unidad 1.5L",
    "categoria": "Bebidas",
    "icono": "🧊",
    "precio": 0
  },
  {
    "id": "cm-atun-van-camp-s-light-400ml",
    "nombre": "Atún Van Camp's Light 400ml",
    "categoria": "Abarrotes",
    "icono": "🐟",
    "precio": 0
  },
  {
    "id": "cm-chocolate-corona-light-bolsa",
    "nombre": "Chocolate Corona Light Bolsa",
    "categoria": "Abarrotes",
    "icono": "🍫",
    "precio": 0
  },
  {
    "id": "cm-detergente-ariel-pack-1-5l",
    "nombre": "Detergente Ariel Pack 1.5L",
    "categoria": "Aseo",
    "icono": "🧺",
    "precio": 0
  },
  {
    "id": "cm-hit-zero-1000g",
    "nombre": "Hit Zero 1000g",
    "categoria": "Bebidas",
    "icono": "🧃",
    "precio": 0
  },
  {
    "id": "cm-agua-cristal-tradicional-500g",
    "nombre": "Agua Cristal Tradicional 500g",
    "categoria": "Bebidas",
    "icono": "💧",
    "precio": 0
  },
  {
    "id": "cm-salsa-de-tomate-fruco-zero-500g",
    "nombre": "Salsa de Tomate Fruco Zero 500g",
    "categoria": "Abarrotes",
    "icono": "🍅",
    "precio": 0
  },
  {
    "id": "cm-galletas-ducales-pack-1-5l",
    "nombre": "Galletas Ducales Pack 1.5L",
    "categoria": "Snacks",
    "icono": "🍘",
    "precio": 0
  },
  {
    "id": "cm-queso-doble-crema-zero-500ml",
    "nombre": "Queso Doble Crema Zero 500ml",
    "categoria": "Lácteos",
    "icono": "🧀",
    "precio": 0
  },
  {
    "id": "cm-mantequilla-la-vaquita-grande-2l",
    "nombre": "Mantequilla La Vaquita Grande 2L",
    "categoria": "Lácteos",
    "icono": "🧈",
    "precio": 0
  },
  {
    "id": "cm-red-bull-light-2l",
    "nombre": "Red Bull Light 2L",
    "categoria": "Bebidas",
    "icono": "⚡",
    "precio": 0
  },
  {
    "id": "cm-postobon-grande-unidad",
    "nombre": "Postobón Grande Unidad",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-toallas-nosotras-tradicional-bolsa",
    "nombre": "Toallas Nosotras Tradicional Bolsa",
    "categoria": "Aseo",
    "icono": "🩹",
    "precio": 0
  },
  {
    "id": "cm-galletas-festival-especial-400ml",
    "nombre": "Galletas Festival Especial 400ml",
    "categoria": "Snacks",
    "icono": "🍪",
    "precio": 0
  },
  {
    "id": "cm-arroz-roa-pack-bolsa",
    "nombre": "Arroz Roa Pack Bolsa",
    "categoria": "Abarrotes",
    "icono": "🍚",
    "precio": 0
  },
  {
    "id": "cm-fosforos-el-rey-familiar-500ml",
    "nombre": "Fósforos El Rey Familiar 500ml",
    "categoria": "Hogar",
    "icono": "🔥",
    "precio": 0
  },
  {
    "id": "cm-sal-refisal-unidad-250g",
    "nombre": "Sal Refisal Unidad 250g",
    "categoria": "Abarrotes",
    "icono": "🧂",
    "precio": 0
  },
  {
    "id": "cm-hit-especial-1000ml",
    "nombre": "Hit Especial 1000ml",
    "categoria": "Bebidas",
    "icono": "🧃",
    "precio": 0
  },
  {
    "id": "cm-mayonesa-fruco-frasco-500ml",
    "nombre": "Mayonesa Fruco Frasco 500ml",
    "categoria": "Abarrotes",
    "icono": "🥗",
    "precio": 0
  },
  {
    "id": "cm-shampoo-bioexpert-familiar-250g",
    "nombre": "Shampoo Bioexpert Familiar 250g",
    "categoria": "Aseo",
    "icono": "🧴",
    "precio": 0
  },
  {
    "id": "cm-mantequilla-la-vaquita-zero-400ml",
    "nombre": "Mantequilla La Vaquita Zero 400ml",
    "categoria": "Lácteos",
    "icono": "🧈",
    "precio": 0
  },
  {
    "id": "cm-arroz-roa-especial-unidad",
    "nombre": "Arroz Roa Especial Unidad",
    "categoria": "Abarrotes",
    "icono": "🍚",
    "precio": 0
  },
  {
    "id": "cm-cafe-sello-rojo-lata-1000ml",
    "nombre": "Café Sello Rojo Lata 1000ml",
    "categoria": "Abarrotes",
    "icono": "☕",
    "precio": 0
  },
  {
    "id": "cm-salsa-de-tomate-fruco-bolsa-400ml",
    "nombre": "Salsa de Tomate Fruco Bolsa 400ml",
    "categoria": "Abarrotes",
    "icono": "🍅",
    "precio": 0
  },
  {
    "id": "cm-harina-haz-de-oros-pack-250g",
    "nombre": "Harina Haz de Oros Pack 250g",
    "categoria": "Abarrotes",
    "icono": "🌾",
    "precio": 0
  },
  {
    "id": "cm-pan-bimbo-zero-250g",
    "nombre": "Pan Bimbo Zero 250g",
    "categoria": "Panadería",
    "icono": "🍞",
    "precio": 0
  },
  {
    "id": "cm-leche-alpina-especial-250g",
    "nombre": "Leche Alpina Especial 250g",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-arequipe-alpina-pack-lata",
    "nombre": "Arequipe Alpina Pack Lata",
    "categoria": "Lácteos",
    "icono": "🍯",
    "precio": 0
  },
  {
    "id": "cm-yogurt-alpina-frasco-1000ml",
    "nombre": "Yogurt Alpina Frasco 1000ml",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-galletas-saltin-light-250g",
    "nombre": "Galletas Saltín Light 250g",
    "categoria": "Snacks",
    "icono": "🍘",
    "precio": 0
  },
  {
    "id": "cm-queso-doble-crema-light-lata",
    "nombre": "Queso Doble Crema Light Lata",
    "categoria": "Lácteos",
    "icono": "🧀",
    "precio": 0
  },
  {
    "id": "cm-te-hatsu-pequeno-unidad",
    "nombre": "Te Hatsu Pequeño Unidad",
    "categoria": "Bebidas",
    "icono": "🍵",
    "precio": 0
  },
  {
    "id": "cm-leche-colanta-unidad-lata",
    "nombre": "Leche Colanta Unidad Lata",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-papas-margarita-pack-250g",
    "nombre": "Papas Margarita Pack 250g",
    "categoria": "Snacks",
    "icono": "🥔",
    "precio": 0
  },
  {
    "id": "cm-jabon-heno-de-pravia-familiar-1000ml",
    "nombre": "Jabón Heno de Pravia Familiar 1000ml",
    "categoria": "Aseo",
    "icono": "🧼",
    "precio": 0
  },
  {
    "id": "cm-vela-blanca-bolsa-2l",
    "nombre": "Vela Blanca Bolsa 2L",
    "categoria": "Hogar",
    "icono": "🕯️",
    "precio": 0
  },
  {
    "id": "cm-pony-malta-especial-500ml",
    "nombre": "Pony Malta Especial 500ml",
    "categoria": "Bebidas",
    "icono": "🍺",
    "precio": 0
  },
  {
    "id": "cm-cerveza-poker-familiar-lata",
    "nombre": "Cerveza Poker Familiar Lata",
    "categoria": "Licores",
    "icono": "🍺",
    "precio": 0
  },
  {
    "id": "cm-sal-refisal-light-1000ml",
    "nombre": "Sal Refisal Light 1000ml",
    "categoria": "Abarrotes",
    "icono": "🧂",
    "precio": 0
  },
  {
    "id": "cm-mr-tea-light-1000g",
    "nombre": "Mr Tea Light 1000g",
    "categoria": "Bebidas",
    "icono": "🧊",
    "precio": 0
  },
  {
    "id": "cm-galletas-saltin-familiar-1-5l",
    "nombre": "Galletas Saltín Familiar 1.5L",
    "categoria": "Snacks",
    "icono": "🍘",
    "precio": 0
  },
  {
    "id": "cm-fosforos-el-rey-pequeno-1000ml",
    "nombre": "Fósforos El Rey Pequeño 1000ml",
    "categoria": "Hogar",
    "icono": "🔥",
    "precio": 0
  },
  {
    "id": "cm-vela-blanca-tradicional-bolsa",
    "nombre": "Vela Blanca Tradicional Bolsa",
    "categoria": "Hogar",
    "icono": "🕯️",
    "precio": 0
  },
  {
    "id": "cm-club-colombia-frasco-2l",
    "nombre": "Club Colombia Frasco 2L",
    "categoria": "Licores",
    "icono": "🍻",
    "precio": 0
  },
  {
    "id": "cm-lentejas-lata-unidad",
    "nombre": "Lentejas Lata Unidad",
    "categoria": "Abarrotes",
    "icono": "🫘",
    "precio": 0
  },
  {
    "id": "cm-atun-van-camp-s-frasco-1000g",
    "nombre": "Atún Van Camp's Frasco 1000g",
    "categoria": "Abarrotes",
    "icono": "🐟",
    "precio": 0
  },
  {
    "id": "cm-azucar-incauca-especial-1-5l",
    "nombre": "Azúcar Incauca Especial 1.5L",
    "categoria": "Abarrotes",
    "icono": "🧂",
    "precio": 0
  },
  {
    "id": "cm-yogurt-alpina-pequeno-lata",
    "nombre": "Yogurt Alpina Pequeño Lata",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-queso-doble-crema-lata-2l",
    "nombre": "Queso Doble Crema Lata 2L",
    "categoria": "Lácteos",
    "icono": "🧀",
    "precio": 0
  },
  {
    "id": "cm-jabon-rey-especial-1000ml",
    "nombre": "Jabón Rey Especial 1000ml",
    "categoria": "Aseo",
    "icono": "🧼",
    "precio": 0
  },
  {
    "id": "cm-mr-tea-tradicional-1000g",
    "nombre": "Mr Tea Tradicional 1000g",
    "categoria": "Bebidas",
    "icono": "🧊",
    "precio": 0
  },
  {
    "id": "cm-mr-tea-zero-500g",
    "nombre": "Mr Tea Zero 500g",
    "categoria": "Bebidas",
    "icono": "🧊",
    "precio": 0
  },
  {
    "id": "cm-sardinas-lumar-grande-lata",
    "nombre": "Sardinas Lumar Grande Lata",
    "categoria": "Abarrotes",
    "icono": "🐟",
    "precio": 0
  },
  {
    "id": "cm-aceite-premier-especial-1000g",
    "nombre": "Aceite Premier Especial 1000g",
    "categoria": "Abarrotes",
    "icono": "🍳",
    "precio": 0
  },
  {
    "id": "cm-panela-lata-1000g",
    "nombre": "Panela Lata 1000g",
    "categoria": "Abarrotes",
    "icono": "🟤",
    "precio": 0
  },
  {
    "id": "cm-aceite-premier-pequeno-lata",
    "nombre": "Aceite Premier Pequeño Lata",
    "categoria": "Abarrotes",
    "icono": "🍳",
    "precio": 0
  },
  {
    "id": "cm-jabon-heno-de-pravia-bolsa-unidad",
    "nombre": "Jabón Heno de Pravia Bolsa Unidad",
    "categoria": "Aseo",
    "icono": "🧼",
    "precio": 0
  },
  {
    "id": "cm-toallas-nosotras-zero-250g",
    "nombre": "Toallas Nosotras Zero 250g",
    "categoria": "Aseo",
    "icono": "🩹",
    "precio": 0
  },
  {
    "id": "cm-yogurt-alpina-grande-unidad",
    "nombre": "Yogurt Alpina Grande Unidad",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-leche-colanta-tradicional-1000ml",
    "nombre": "Leche Colanta Tradicional 1000ml",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-jabon-rey-pack-400ml",
    "nombre": "Jabón Rey Pack 400ml",
    "categoria": "Aseo",
    "icono": "🧼",
    "precio": 0
  },
  {
    "id": "cm-agua-brisa-unidad-1000g",
    "nombre": "Agua Brisa Unidad 1000g",
    "categoria": "Bebidas",
    "icono": "💧",
    "precio": 0
  },
  {
    "id": "cm-shampoo-bioexpert-tradicional-400ml",
    "nombre": "Shampoo Bioexpert Tradicional 400ml",
    "categoria": "Aseo",
    "icono": "🧴",
    "precio": 0
  },
  {
    "id": "cm-galletas-ducales-tradicional-1-5l",
    "nombre": "Galletas Ducales Tradicional 1.5L",
    "categoria": "Snacks",
    "icono": "🍘",
    "precio": 0
  },
  {
    "id": "cm-te-hatsu-unidad-400ml",
    "nombre": "Te Hatsu Unidad 400ml",
    "categoria": "Bebidas",
    "icono": "🍵",
    "precio": 0
  },
  {
    "id": "cm-pasta-doria-lata-bolsa",
    "nombre": "Pasta Doria Lata Bolsa",
    "categoria": "Abarrotes",
    "icono": "🍝",
    "precio": 0
  },
  {
    "id": "cm-red-bull-tradicional-500ml",
    "nombre": "Red Bull Tradicional 500ml",
    "categoria": "Bebidas",
    "icono": "⚡",
    "precio": 0
  },
  {
    "id": "cm-leche-alqueria-tradicional-500ml",
    "nombre": "Leche Alquería Tradicional 500ml",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-salsa-de-tomate-fruco-lata-500ml",
    "nombre": "Salsa de Tomate Fruco Lata 500ml",
    "categoria": "Abarrotes",
    "icono": "🍅",
    "precio": 0
  },
  {
    "id": "cm-mr-tea-familiar-lata",
    "nombre": "Mr Tea Familiar Lata",
    "categoria": "Bebidas",
    "icono": "🧊",
    "precio": 0
  },
  {
    "id": "cm-atun-van-camp-s-bolsa-bolsa",
    "nombre": "Atún Van Camp's Bolsa Bolsa",
    "categoria": "Abarrotes",
    "icono": "🐟",
    "precio": 0
  },
  {
    "id": "cm-sardinas-lumar-familiar-2l",
    "nombre": "Sardinas Lumar Familiar 2L",
    "categoria": "Abarrotes",
    "icono": "🐟",
    "precio": 0
  },
  {
    "id": "cm-arroz-zulia-unidad-250g",
    "nombre": "Arroz Zulia Unidad 250g",
    "categoria": "Abarrotes",
    "icono": "🍚",
    "precio": 0
  },
  {
    "id": "cm-frijol-cargamanto-grande-bolsa",
    "nombre": "Frijol cargamanto Grande Bolsa",
    "categoria": "Abarrotes",
    "icono": "🫘",
    "precio": 0
  },
  {
    "id": "cm-agua-cristal-grande-unidad",
    "nombre": "Agua Cristal Grande Unidad",
    "categoria": "Bebidas",
    "icono": "💧",
    "precio": 0
  },
  {
    "id": "cm-pan-bimbo-zero-500g",
    "nombre": "Pan Bimbo Zero 500g",
    "categoria": "Panadería",
    "icono": "🍞",
    "precio": 0
  },
  {
    "id": "cm-mr-tea-especial-1000g",
    "nombre": "Mr Tea Especial 1000g",
    "categoria": "Bebidas",
    "icono": "🧊",
    "precio": 0
  },
  {
    "id": "cm-jugo-hit-tradicional-400ml",
    "nombre": "Jugo Hit Tradicional 400ml",
    "categoria": "Bebidas",
    "icono": "🧃",
    "precio": 0
  },
  {
    "id": "cm-queso-campesino-pack-unidad",
    "nombre": "Queso Campesino Pack Unidad",
    "categoria": "Lácteos",
    "icono": "🧀",
    "precio": 0
  },
  {
    "id": "cm-cerveza-poker-bolsa-500ml",
    "nombre": "Cerveza Poker Bolsa 500ml",
    "categoria": "Licores",
    "icono": "🍺",
    "precio": 0
  },
  {
    "id": "cm-mantequilla-la-vaquita-bolsa-400ml",
    "nombre": "Mantequilla La Vaquita Bolsa 400ml",
    "categoria": "Lácteos",
    "icono": "🧈",
    "precio": 0
  },
  {
    "id": "cm-harina-haz-de-oros-lata-1000ml",
    "nombre": "Harina Haz de Oros Lata 1000ml",
    "categoria": "Abarrotes",
    "icono": "🌾",
    "precio": 0
  },
  {
    "id": "cm-queso-campesino-tradicional-lata",
    "nombre": "Queso Campesino Tradicional Lata",
    "categoria": "Lácteos",
    "icono": "🧀",
    "precio": 0
  },
  {
    "id": "cm-shampoo-bioexpert-lata-250g",
    "nombre": "Shampoo Bioexpert Lata 250g",
    "categoria": "Aseo",
    "icono": "🧴",
    "precio": 0
  },
  {
    "id": "cm-aceite-gourmet-unidad-250g",
    "nombre": "Aceite Gourmet Unidad 250g",
    "categoria": "Abarrotes",
    "icono": "🍳",
    "precio": 0
  },
  {
    "id": "cm-galletas-saltin-grande-500ml",
    "nombre": "Galletas Saltín Grande 500ml",
    "categoria": "Snacks",
    "icono": "🍘",
    "precio": 0
  },
  {
    "id": "cm-arroz-roa-zero-1000g",
    "nombre": "Arroz Roa Zero 1000g",
    "categoria": "Abarrotes",
    "icono": "🍚",
    "precio": 0
  },
  {
    "id": "cm-detodito-grande-1000ml",
    "nombre": "Detodito Grande 1000ml",
    "categoria": "Snacks",
    "icono": "🍟",
    "precio": 0
  },
  {
    "id": "cm-galletas-saltin-light-1000ml",
    "nombre": "Galletas Saltín Light 1000ml",
    "categoria": "Snacks",
    "icono": "🍘",
    "precio": 0
  },
  {
    "id": "cm-fosforos-el-rey-tradicional-1000g",
    "nombre": "Fósforos El Rey Tradicional 1000g",
    "categoria": "Hogar",
    "icono": "🔥",
    "precio": 0
  },
  {
    "id": "cm-yogurt-alpina-lata-500ml",
    "nombre": "Yogurt Alpina Lata 500ml",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-lentejas-grande-unidad",
    "nombre": "Lentejas Grande Unidad",
    "categoria": "Abarrotes",
    "icono": "🫘",
    "precio": 0
  },
  {
    "id": "cm-crema-colgate-pack-1-5l",
    "nombre": "Crema Colgate Pack 1.5L",
    "categoria": "Aseo",
    "icono": "🦷",
    "precio": 0
  },
  {
    "id": "cm-cerveza-poker-pequeno-1000g",
    "nombre": "Cerveza Poker Pequeño 1000g",
    "categoria": "Licores",
    "icono": "🍺",
    "precio": 0
  },
  {
    "id": "cm-barra-gala-frasco-1-5l",
    "nombre": "Barra Gala Frasco 1.5L",
    "categoria": "Snacks",
    "icono": "🍰",
    "precio": 0
  },
  {
    "id": "cm-pepsi-lata-bolsa",
    "nombre": "Pepsi Lata Bolsa",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-azucar-incauca-bolsa-1000ml",
    "nombre": "Azúcar Incauca Bolsa 1000ml",
    "categoria": "Abarrotes",
    "icono": "🧂",
    "precio": 0
  },
  {
    "id": "cm-azucar-incauca-grande-500ml",
    "nombre": "Azúcar Incauca Grande 500ml",
    "categoria": "Abarrotes",
    "icono": "🧂",
    "precio": 0
  },
  {
    "id": "cm-aceite-gourmet-tradicional-400ml",
    "nombre": "Aceite Gourmet Tradicional 400ml",
    "categoria": "Abarrotes",
    "icono": "🍳",
    "precio": 0
  },
  {
    "id": "cm-arroz-roa-zero-1000ml",
    "nombre": "Arroz Roa Zero 1000ml",
    "categoria": "Abarrotes",
    "icono": "🍚",
    "precio": 0
  },
  {
    "id": "cm-cerveza-aguila-pack-unidad",
    "nombre": "Cerveza Águila Pack Unidad",
    "categoria": "Licores",
    "icono": "🍺",
    "precio": 0
  },
  {
    "id": "cm-aceite-gourmet-pequeno-2l",
    "nombre": "Aceite Gourmet Pequeño 2L",
    "categoria": "Abarrotes",
    "icono": "🍳",
    "precio": 0
  },
  {
    "id": "cm-azucar-incauca-frasco-500ml",
    "nombre": "Azúcar Incauca Frasco 500ml",
    "categoria": "Abarrotes",
    "icono": "🧂",
    "precio": 0
  },
  {
    "id": "cm-cafe-aguila-roja-grande-500ml",
    "nombre": "Café Águila Roja Grande 500ml",
    "categoria": "Abarrotes",
    "icono": "☕",
    "precio": 0
  },
  {
    "id": "cm-leche-colanta-unidad-1-5l",
    "nombre": "Leche Colanta Unidad 1.5L",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-salsa-de-tomate-fruco-light-400ml",
    "nombre": "Salsa de Tomate Fruco Light 400ml",
    "categoria": "Abarrotes",
    "icono": "🍅",
    "precio": 0
  },
  {
    "id": "cm-coca-cola-especial-1000g",
    "nombre": "Coca-Cola Especial 1000g",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-leche-alqueria-zero-1000g",
    "nombre": "Leche Alquería Zero 1000g",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-leche-alqueria-pack-250g",
    "nombre": "Leche Alquería Pack 250g",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-arequipe-alpina-frasco-250g",
    "nombre": "Arequipe Alpina Frasco 250g",
    "categoria": "Lácteos",
    "icono": "🍯",
    "precio": 0
  },
  {
    "id": "cm-limpido-clorox-grande-1000g",
    "nombre": "Límpido Clorox Grande 1000g",
    "categoria": "Aseo",
    "icono": "🧴",
    "precio": 0
  },
  {
    "id": "cm-shampoo-bioexpert-light-2l",
    "nombre": "Shampoo Bioexpert Light 2L",
    "categoria": "Aseo",
    "icono": "🧴",
    "precio": 0
  },
  {
    "id": "cm-pepsi-frasco-unidad",
    "nombre": "Pepsi Frasco Unidad",
    "categoria": "Bebidas",
    "icono": "🥤",
    "precio": 0
  },
  {
    "id": "cm-aceite-premier-light-400ml",
    "nombre": "Aceite Premier Light 400ml",
    "categoria": "Abarrotes",
    "icono": "🍳",
    "precio": 0
  },
  {
    "id": "cm-vela-blanca-grande-400ml",
    "nombre": "Vela Blanca Grande 400ml",
    "categoria": "Hogar",
    "icono": "🕯️",
    "precio": 0
  },
  {
    "id": "cm-panela-tradicional-2l",
    "nombre": "Panela Tradicional 2L",
    "categoria": "Abarrotes",
    "icono": "🟤",
    "precio": 0
  },
  {
    "id": "cm-galletas-festival-unidad-lata",
    "nombre": "Galletas Festival Unidad Lata",
    "categoria": "Snacks",
    "icono": "🍪",
    "precio": 0
  },
  {
    "id": "cm-aceite-premier-pequeno-1000g",
    "nombre": "Aceite Premier Pequeño 1000g",
    "categoria": "Abarrotes",
    "icono": "🍳",
    "precio": 0
  },
  {
    "id": "cm-frijol-cargamanto-lata-500ml",
    "nombre": "Frijol cargamanto Lata 500ml",
    "categoria": "Abarrotes",
    "icono": "🫘",
    "precio": 0
  },
  {
    "id": "cm-limpido-clorox-familiar-250g",
    "nombre": "Límpido Clorox Familiar 250g",
    "categoria": "Aseo",
    "icono": "🧴",
    "precio": 0
  },
  {
    "id": "cm-agua-brisa-lata-1-5l",
    "nombre": "Agua Brisa Lata 1.5L",
    "categoria": "Bebidas",
    "icono": "💧",
    "precio": 0
  },
  {
    "id": "cm-mayonesa-fruco-grande-500g",
    "nombre": "Mayonesa Fruco Grande 500g",
    "categoria": "Abarrotes",
    "icono": "🥗",
    "precio": 0
  },
  {
    "id": "cm-galletas-saltin-unidad-2l",
    "nombre": "Galletas Saltín Unidad 2L",
    "categoria": "Snacks",
    "icono": "🍘",
    "precio": 0
  },
  {
    "id": "cm-lentejas-frasco-2l",
    "nombre": "Lentejas Frasco 2L",
    "categoria": "Abarrotes",
    "icono": "🫘",
    "precio": 0
  },
  {
    "id": "cm-harina-haz-de-oros-unidad-1000g",
    "nombre": "Harina Haz de Oros Unidad 1000g",
    "categoria": "Abarrotes",
    "icono": "🌾",
    "precio": 0
  },
  {
    "id": "cm-arroz-roa-bolsa-bolsa",
    "nombre": "Arroz Roa Bolsa Bolsa",
    "categoria": "Abarrotes",
    "icono": "🍚",
    "precio": 0
  },
  {
    "id": "cm-papel-higienico-familia-light-500ml",
    "nombre": "Papel Higiénico Familia Light 500ml",
    "categoria": "Aseo",
    "icono": "🧻",
    "precio": 0
  },
  {
    "id": "cm-detodito-grande-500ml",
    "nombre": "Detodito Grande 500ml",
    "categoria": "Snacks",
    "icono": "🍟",
    "precio": 0
  },
  {
    "id": "cm-aceite-gourmet-lata-2l",
    "nombre": "Aceite Gourmet Lata 2L",
    "categoria": "Abarrotes",
    "icono": "🍳",
    "precio": 0
  },
  {
    "id": "cm-detodito-zero-1000g",
    "nombre": "Detodito Zero 1000g",
    "categoria": "Snacks",
    "icono": "🍟",
    "precio": 0
  },
  {
    "id": "cm-arroz-diana-especial-1-5l",
    "nombre": "Arroz Diana Especial 1.5L",
    "categoria": "Abarrotes",
    "icono": "🍚",
    "precio": 0
  },
  {
    "id": "cm-harina-dona-nora-lata-1000ml",
    "nombre": "Harina Doña Nora Lata 1000ml",
    "categoria": "Abarrotes",
    "icono": "🌽",
    "precio": 0
  },
  {
    "id": "cm-leche-alpina-unidad-2l",
    "nombre": "Leche Alpina Unidad 2L",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-leche-colanta-lata-lata",
    "nombre": "Leche Colanta Lata Lata",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-aceite-gourmet-grande-2l",
    "nombre": "Aceite Gourmet Grande 2L",
    "categoria": "Abarrotes",
    "icono": "🍳",
    "precio": 0
  },
  {
    "id": "cm-panela-familiar-1000g",
    "nombre": "Panela Familiar 1000g",
    "categoria": "Abarrotes",
    "icono": "🟤",
    "precio": 0
  },
  {
    "id": "cm-cafe-aguila-roja-tradicional-lata",
    "nombre": "Café Águila Roja Tradicional Lata",
    "categoria": "Abarrotes",
    "icono": "☕",
    "precio": 0
  },
  {
    "id": "cm-limpido-clorox-pequeno-lata",
    "nombre": "Límpido Clorox Pequeño Lata",
    "categoria": "Aseo",
    "icono": "🧴",
    "precio": 0
  },
  {
    "id": "cm-limpido-clorox-pack-bolsa",
    "nombre": "Límpido Clorox Pack Bolsa",
    "categoria": "Aseo",
    "icono": "🧴",
    "precio": 0
  },
  {
    "id": "cm-chocolate-corona-lata-bolsa",
    "nombre": "Chocolate Corona Lata Bolsa",
    "categoria": "Abarrotes",
    "icono": "🍫",
    "precio": 0
  },
  {
    "id": "cm-red-bull-pack-1000ml",
    "nombre": "Red Bull Pack 1000ml",
    "categoria": "Bebidas",
    "icono": "⚡",
    "precio": 0
  },
  {
    "id": "cm-leche-alqueria-grande-1000ml",
    "nombre": "Leche Alquería Grande 1000ml",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-mr-tea-lata-1000ml",
    "nombre": "Mr Tea Lata 1000ml",
    "categoria": "Bebidas",
    "icono": "🧊",
    "precio": 0
  },
  {
    "id": "cm-sal-refisal-bolsa-500ml",
    "nombre": "Sal Refisal Bolsa 500ml",
    "categoria": "Abarrotes",
    "icono": "🧂",
    "precio": 0
  },
  {
    "id": "cm-leche-alqueria-familiar-1000g",
    "nombre": "Leche Alquería Familiar 1000g",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  },
  {
    "id": "cm-limpido-clorox-zero-1000ml",
    "nombre": "Límpido Clorox Zero 1000ml",
    "categoria": "Aseo",
    "icono": "🧴",
    "precio": 0
  },
  {
    "id": "cm-cafe-aguila-roja-pack-unidad",
    "nombre": "Café Águila Roja Pack Unidad",
    "categoria": "Abarrotes",
    "icono": "☕",
    "precio": 0
  },
  {
    "id": "cm-yogurt-alpina-familiar-1-5l",
    "nombre": "Yogurt Alpina Familiar 1.5L",
    "categoria": "Lácteos",
    "icono": "🥛",
    "precio": 0
  }
];
