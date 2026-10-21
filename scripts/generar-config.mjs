// Lee .env y escribe config.js, que la app carga al arrancar.
// config.js está en .gitignore: tus claves nunca se suben al repositorio.
// Uso: node scripts/generar-config.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const RUTA_ENV = new URL("../.env", import.meta.url);
const RUTA_CONFIG = new URL("../config.js", import.meta.url);

if (!existsSync(RUTA_ENV)) {
  console.error("No encontré .env. Copia .env.example como .env y llena tus datos.");
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(RUTA_ENV, "utf8")
    .split(/\r?\n/)
    .filter(l => l.trim() && !l.trim().startsWith("#") && l.includes("="))
    .map(l => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    })
);

const url = env.SUPABASE_URL || "";
const clave = env.SUPABASE_ANON_KEY || "";
if (!url || !clave) {
  console.error("Faltan SUPABASE_URL o SUPABASE_ANON_KEY en .env.");
  process.exit(1);
}
if (/service_role/i.test(clave)) {
  console.error("Esa parece la clave service_role. Usa la clave pública (anon).");
  process.exit(1);
}

writeFileSync(RUTA_CONFIG,
  "// Generado por scripts/generar-config.mjs. No lo subas al repositorio.\n"
  + `export default ${JSON.stringify({ SUPABASE_URL: url, SUPABASE_ANON_KEY: clave }, null, 2)};\n`);
console.log("Listo: config.js creado. La app ya se conecta a tu Supabase.");
