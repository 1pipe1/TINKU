import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csv from "csv-parser";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

// Limpia formatos monetarios "$2,000" -> 2000
const parseCurrency = (val) => {
  if (!val) return 0;
  const clean = val.replace(/[^0-9.-]+/g, "");
  return parseFloat(clean) || 0;
};

async function runSeeding() {
  const results = [];
  const csvFilePath = path.join(__dirname, "inventario-piloto-tinku.csv");

  fs.createReadStream(csvFilePath)
    .pipe(csv()) // Lee nativamente desde la fila 1
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      console.log(`Procesando ${results.length} filas del inventario...`);

      const batch = db.batch();
      let count = 0;

      // Reemplaza esto en el script para cargar los 41 productos:
      results.forEach((row) => {
        const sku = row["ID/SKU"];
        const nombre = row["Producto"];
        const categoria = row["Categoría"];
        const costo = parseCurrency(row["Precio Proveedor (Costo A)"]);
        const precio = parseCurrency(row["Precio Venta (Público B)"]);

        if (!nombre || !sku || nombre.includes("TOTALES")) return;

        // Guarda TODOS los productos sin filtrar por alta rotación
        const docRef = db.collection("productos").doc(sku.trim());

        batch.set(
          docRef,
          {
            sku: sku.trim(),
            nombre: nombre.trim(),
            categoria: categoria ? categoria.trim() : "General",
            costo: costo,
            precio: precio,
            stock: 20,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );

        count++;
      });
      await batch.commit();
      console.log(
        `\n¡ÉXITO TOTAL! 🚀 Se cargaron ${count} productos de alta rotación en Firestore.`,
      );
      process.exit(0);
    });
}

runSeeding().catch(console.error);
