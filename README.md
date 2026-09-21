# 🏪 TINKU POS — La Armadura Digital de la Economía Popular

> **Sistema de Punto de Venta (POS), Inteligencia Operativa y Control Financiero Fullstack** diseñado para eliminar la fuga invisible de dinero y digitalizar las tiendas de barrio con velocidad de combate.

---

## 🦁 El Manifiesto TINKU

En Colombia y Latinoamérica, la tienda de barrio es la columna vertebral de la comunidad. Sin embargo, miles de tenderos pierden dinero a diario por descuadres en la caja, fiados olvidados, vuelto mal entregado y falta de claridad sobre su ganancia neta real.

**TINKU no es software corporativo pesado.** Es una herramienta quirúrgica, ergonómica y defensiva, nacida en Sabaneta (Antioquia) para proteger la caja del tendero, optimizar su tiempo y garantizar la sostenibilidad de la economía popular.

---

## ⚡ Pilares del Sistema (MVP v1.0)

### 1. 🚀 Cobro Express (Calculadora de Combate)
* **Venta a la Ráfaga:** Registra cobros en 2 segundos digitando únicamente el monto en dinero en una calculadora táctil gigante.
* **Cero Bloqueos:** Diseñado para la hora pico. No obliga a buscar ni a inventariar productos cuando hay fila en el mostrador.

### 2. 🛡️ Arquitectura Multi-Tenant Antisísmica
* **Aislamiento Total por Tienda:** Colecciones atómicas e independientes en Firebase Firestore (`usuarios/{uid}`).
* **Transacciones Atómicas:** Garantiza que cada venta y descuento de inventario se ejecute sin condiciones de carrera ni duplicación de datos.

### 3. 📦 Resiliencia & Caché Offline (Zustand)
* **Persistencia en Memoria Local:** El inventario se mantiene en la memoria del cliente con el middleware `persist`, permitiendo operar incluso si falla el internet del local.
* **Consumo Mínimo de Servidor:** Reduce en un 95% las lecturas a la base de datos, manteniendo la app ultra veloz y con costos de infraestructura insignificantes.

### 4. 📊 Balance Financiero Inteligente (Cero Malgasto)
* **Diferenciación de Caja:** Separa automáticamente la venta bruta de la utilidad neta libre.
* **Prorrateo de Costos Fijos:** Descuenta al vuelo los costos de arriendo y servicios públicos para que el tendero sepa exactamente cuánto dinero puede llevar a su casa.

### 5. 📱 Diseño Ergonomico & Mobile-First
* **Operación a un Solo Dedo:** Botones grandes, contrastes de alta visibilidad y zonas táctiles despejadas (`pb-28`) adaptadas al entorno real del mostrador en celulares y tablets.

---

## 🚀 La Cúspide Tecnológica & Roadmap de Escala

### 🎙️ Asistente de Voz por IA (Ultra-Zero Click)
* Dictado continuo con procesamiento semántico mediante **Gemini Flash API** + **Web Speech API**.
* Parsea de una sola frase los productos, cantidades y el método de pago (*"2 papas de limón, 1 cerveza y paga por transferencia"*), pre-seleccionando la transacción para confirmación en **1 solo clic**.

### 🧾 Mapeo Inteligente por SKU & Aliases de Factura
* **Respeto al Lenguaje del Tendero:** El usuario conserva sus nombres sencillos en pantalla (*"Coca Cola Personal"*).
* **Traducción Automática:** La máquina reconcilia facturas electrónicas (XML DIAN / OCR) vinculando la descripción del proveedor con el código de barras (`sku`) y una tabla de aliases aprendidos.

### 🚨 Radar de Reposición & Pedidos por WhatsApp
* Filtro instantáneo de productos agotados o con stock crítico (`<= 10 un.`).
* Genera automáticamente el presupuesto de reposición a precio de costo y exporta la orden formateada en texto listo para enviar al proveedor por WhatsApp.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite |
| **Estilos** | Tailwind CSS (Diseño Mobile-First / UI Adaptativa) |
| **Estado Global** | Zustand (Caché local offline persistente) |
| **Backend & BD** | Firebase Firestore (Transacciones Atómicas) & Firebase Auth |
| **Inteligencia Artificial** | Gemini Flash API (Parseo semántico JSON) & Web Speech API |

---

## 💡 Modelo de Negocio & Retención Orgánica

* **Suscripción Accesible:** **$50.000 COP / mes** (~$1.666 COP/día, equivalente a la ganancia de vender 1 sola gaseosa personal al día).
* **Prueba Completa (14 Días):** El tendero experimenta el 100% de la tecnología ("Toda la Magia") sin restricciones desde el primer día.
* **Candado Anti-Abuso Natural:** El verdadero activo del tendero es el historial acumulado de su negocio, sus fiados y su catálogo organizado; esa acumulación de valor garantiza la retención y la lealtad orgánica al sistema.

---

*Desarrollado con propósito y rigor técnico para la economía popular.*
