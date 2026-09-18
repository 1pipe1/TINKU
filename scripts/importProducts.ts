import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csv from "csv-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parseCurrency = (val: string) => {
  if (!val) return 0;
  const clean = val.replace(/[^0-9.-]+/g, "");
  return parseFloat(clean) || 0;
};

async function importFromCsv() {
  const csvFilePath = path.join(__dirname, "inventario-piloto-tinku.csv");
  if (!fs.existsSync(csvFilePath)) {
    console.error("❌ No se encontró el archivo CSV en:", csvFilePath);
    return;
  }

  const results: any[] = [];
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      console.log(`📦 Procesadas ${results.length} filas del inventario CSV.`);
      const products = results
        .filter((r) => r["Producto"] && r["ID/SKU"] && !r["Producto"].includes("TOTALES"))
        .map((row) => ({
          id: row["ID/SKU"].trim(),
          title: row["Producto"].trim(),
          name: row["Producto"].trim(),
          category: row["Categoría"] ? row["Categoría"].trim() : "General",
          cost: parseCurrency(row["Precio Proveedor (Costo A)"]),
          price: parseCurrency(row["Precio Venta (Público B)"]),
          stock: 20,
          image: "",
        }));

      console.log(`✅ ${products.length} productos válidos listos para importar.`);
    });
}

importFromCsv();
