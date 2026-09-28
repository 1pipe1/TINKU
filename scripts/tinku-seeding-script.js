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
  if (typeof val === "number") return val;
  const clean = val.toString().replace(/[^0-9.-]+/g, "");
  return parseFloat(clean) || 0;
};

// Genera un SKU limpio a partir de un nombre o índice
const generateSku = (nombre, index) => {
  if (!nombre) return `TNK-${String(index + 1).padStart(3, "0")}`;
  const slug = nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 15);
  return `TNK-${String(index + 1).padStart(3, "0")}-${slug}`;
};

async function runSeeding() {
  const results = [];
  // Permite pasar el nombre del archivo como argumento: node scripts/tinku-seeding-script.js mi-archivo.csv
  const targetFile = process.argv[2] || "inventario-piloto-tinku.csv";
  const csvFilePath = path.isAbsolute(targetFile)
    ? targetFile
    : path.join(__dirname, targetFile);

  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ No se encontró el archivo CSV en: ${csvFilePath}`);
    console.error("Asegúrate de colocar el archivo en la carpeta 'scripts' o pasar la ruta como argumento.");
    process.exit(1);
  }

  console.log(`📖 Leyendo archivo CSV: ${csvFilePath}`);

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      console.log(`Procesando ${results.length} filas del inventario...`);

      const batch = db.batch();
      let count = 0;

      results.forEach((row, index) => {
        // Detección flexible de columnas (formato detallado o formato simple nombre,categoria,precio)
        const nombre =
          row["nombre"] ||
          row["Nombre"] ||
          row["Producto"] ||
          row["producto"] ||
          row["name"];

        const categoria =
          row["categoria"] ||
          row["Categoría"] ||
          row["Categoria"] ||
          row["category"] ||
          "General";

        const precio = parseCurrency(
          row["precio"] ||
          row["Precio"] ||
          row["Precio Venta (Público B)"] ||
          row["price"] ||
          0
        );

        const costo = parseCurrency(
          row["costo"] ||
          row["Costo"] ||
          row["Precio Proveedor (Costo A)"] ||
          row["cost"] ||
          0
        );

        const rawSku =
          row["sku"] ||
          row["SKU"] ||
          row["ID/SKU"] ||
          row["codigo"] ||
          row["id"];

        if (!nombre || nombre.includes("TOTALES")) return;

        // Si no trae SKU en el CSV, se le genera uno único automáticamente
        const sku = (rawSku && rawSku.toString().trim()) || generateSku(nombre, index);
        const docId = sku.replace(/\//g, "_").trim();

        const docRef = db.collection("productos").doc(docId);

        batch.set(
          docRef,
          {
            sku: sku.trim(),
            nombre: nombre.toString().trim(),
            categoria: categoria ? categoria.toString().trim() : "General",
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
        `\n¡ÉXITO TOTAL! 🚀 Se cargaron ${count} productos en Firestore (/productos).`,
      );
      process.exit(0);
    });
}

runSeeding().catch(console.error);
