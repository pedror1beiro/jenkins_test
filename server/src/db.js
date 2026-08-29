const { Pool } = require("pg");

let pool;

/**
 * Cria o pool só quando necessário.
 * Assim os testes que não usam DB não rebentam por falta de env/DB.
 */
function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL não definido");
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}

async function query(text, params) {
  const p = getPool();
  return p.query(text, params);
}

module.exports = { query };
