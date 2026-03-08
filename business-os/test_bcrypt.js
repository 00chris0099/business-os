const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: 'postgres://crm_user:Mineria99%2A@187.77.57.116:5432/crm_db?sslmode=disable' });

pool.query("SELECT password_hash FROM system.users WHERE email = 'anchillo00@gmail.com'").then(res => {
    const hash = res.rows[0].password_hash;
    const match = bcrypt.compareSync('Mineria99*', hash);
    console.log('Bcrypt Match test:', match);
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
