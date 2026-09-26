# 🚀 Hoja de Ruta y Mejoras Futuras - TINKU POS

Documento estratégico de evolución técnica y de producto para **TINKU**, el sistema de punto de venta optimizado para tiendas de barrio y minimarkets en Colombia.

---

## 📌 Estado Actual del Proyecto (Logros Clave)
- ⚡ **Venta Ultrarrápida y Producto Express:** Creación de ítems virtuales y digitación de precios al vuelo sin frenar la cola de clientes.
- ⏸️ **Ventas Pausadas / Suspendidas:** Retención de carritos en paralelo cuando el cliente olvida algo o va por dinero.
- 💵 **Calculadora de Vueltas Instantánea:** Atajos de billetes colombianos ($1.000 a $100.000) y cálculo automático de cambio.
- 📡 **Offline-First & Reducción Drástica de Cuota:** 
  - Caché persistente en disco (`persistentLocalCache` en IndexedDB).
  - Peticiones limitadas (`limit(50)`) y 0 consultas innecesarias en eventos de foco móvil.
  - Consumo diario optimizado de ~24.000 lecturas a <200 lecturas por usuario.

---

## 🗺️ Mapa de Ruta: Próximas Mejoras

### 1. 📖 Módulo de Fiados (Libreta Digital de Cuentas por Cobrar)
> **Impacto de Negocio:** Alto (El 30%-40% de las ventas en una tienda colombiana se basan en la confianza vecinal).
- **Funcionalidad:**
  - Agregar método de pago: **"Fiado / Cuenta Vecino"**.
  - Directorio simple de clientes habituales (Nombre, Teléfono, Límite de crédito opcional).
  - Al completar la venta, el saldo se añade a la libreta del cliente.
  - Registro de abonos parciales o totales cuando el cliente viene a pagar ("Don Carlos abonó $20.000").
  - Historial claro de movimientos por cliente para evitar disputas ("¿Cuándo me llevé esa leche?").

---

### 2. 💵 Cierre y Cuadre de Caja Diario (Arqueo / Turno)
> **Impacto Operativo:** Alto (Evita descuadres al final de la jornada y facilita el control si atienden varios familiares o empleados).
- **Funcionalidad:**
  - **Base Inicial:** Registro del sencillo con el que abre el día (ej. $50.000 en monedas y billetes).
  - **Entradas:** Suma automática de ventas cobradas en efectivo.
  - **Salidas de Dinero / Gastos Menores:** Botón para registrar pagos rápidos desde la caja (ej. *"Salida de $15.000 para pagarle al proveedor de pan"*).
  - **Cuadre Final:** Total que debe haber físicamente en la gaveta = `Base Inicial + Ventas Efectivo - Salidas de Dinero`.
  - Resumen exportable o visible en 1 pantalla antes de cerrar la reja.

---

### 3. 🧾 Comprobante por WhatsApp e Impresión Térmica Bluetooth
> **Impacto de Usuario:** Medio-Alto (Profesionaliza el negocio y ahorra papel innecesario).
- **Funcionalidad:**
  - **Enviar Ticket por WhatsApp:** Botón que genera un enlace `wa.me/?text=...` con el desglose ordenado y emoji:
    ```text
    🏪 Minimarket Tinku
    --------------------------------
    1x Leche Entera 1.1L   $4.800
    1x Pan Tajado Familiar $5.500
    --------------------------------
    TOTAL: $10.300
    Pago: Efectivo | Vueltas: $9.700
    ¡Muchas gracias por su compra!
    ```
  - **Soporte para Impresoras Térmicas POS-58 (Bluetooth):** Conexión vía Web Bluetooth API para emitir tirillas de 58mm en impresoras portátiles económicas.

---

### 4. 📅 Paginación Histórica y Filtros por Fecha en Ventas
> **Impacto Técnico:** Medio (Mantiene la app ligera sin perder acceso al pasado).
- **Contexto:** Actualmente las ventas cargan con `limit(50)` para proteger la cuota de Firebase.
- **Funcionalidad:**
  - Selector de rango de fechas: *"Ver ventas de una fecha específica"*.
  - Botón: *"Cargar 30 ventas anteriores"* (paginación con cursor `startAfter` en Firestore).
  - Búsqueda por rango en el almacenamiento local primero antes de consultar la nube.

---

### 5. 💾 Copia de Seguridad y Exportación a Excel / CSV
> **Impacto de Confianza:** Alto (Paz mental para el tendero).
- **Funcionalidad:**
  - Botón en Ajustes: **"Descargar respaldo de mi inventario y ventas"**.
  - Generación en el navegador de archivos `.csv` o `.xlsx` (con librerías ligeras como SheetJS o generador nativo de CSV).
  - Permite llevar la contabilidad al contador o guardar registros históricos fuera de la plataforma.

---

### 6. 🛡️ Seguridad Multi-Tenant y Preparación para Escala (10+ Tiendas)
- **Reglas de Seguridad (`firestore.rules`):**
  - Asegurar que todas las rutas `usuarios/{uid}/**` tengan validación estricta `request.auth.uid == uid`.
  - Impedir que ningún usuario pueda leer o escribir en datos de otra tienda.
- **Modo Demostración / Portafolio (LinkedIn):**
  - Mantener un interruptor de "Modo Demo" que trabaje exclusivamente en memoria local (`localStorage`), permitiendo que evaluadores o reclutadores prueben la app sin consumir recursos del proyecto real de Firebase.
