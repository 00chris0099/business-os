const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: 'postgres://crm_user:Mineria99%2A@187.77.57.116:5432/crm_db?sslmode=disable' });

const email = 'anchillo00@gmail.com';
const password = 'Mineria99*';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('Generated hash:', hash);

pool.query("UPDATE system.users SET password_hash = $1 WHERE email = $2", [hash, email]).then(() => {
    console.log('Hash Updated properly using prepared statement');
    return pool.query("SELECT password_hash FROM system.users WHERE email = $1", [email]);
}).then(res => {
    const dbHash = res.rows[0].password_hash;
    console.log('Returned DB Hash:', dbHash);
    const match = bcrypt.compareSync(password, dbHash);
    console.log('Match After Update?', match);
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
