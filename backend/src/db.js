import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "site_db.sqlite");
const schemaPath = path.join(__dirname, "..", "sql", "schema.sql");

const db = new Database(dbPath);

// Cria as tabelas automaticamente se ainda não existirem
const schema = fs.readFileSync(schemaPath, "utf8");
db.exec(schema);

// Interface compatível com o antigo pool do mysql2,
// pra não precisar alterar as rotas.
export const pool = {
  query: async (sql, params = []) => {
    const isSelect = sql.trim().toUpperCase().startsWith("SELECT");

    if (isSelect) {
      const rows = db.prepare(sql).all(...params);
      return [rows];
    }

    const info = db.prepare(sql).run(...params);
    return [info];
  },
};
