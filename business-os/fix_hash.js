const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://crm_user:Mineria99%2A@187.77.57.116:5432/crm_db?sslmode=disable' });
pool.query("UPDATE system.users SET password_hash = '$2b$10$TWH4PnOhr6c4fCKoQqVwjuRRaKf0.KMiuk2yWsTt4.z2YcfyAAVw26' WHERE email = 'anchillo00@gmail.com'").then(() => {
    console.log('Hash Updated');
    process.exit(0);
});
