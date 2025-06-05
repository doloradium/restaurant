const { Pool } = require('pg');
require('dotenv').config();

// Parse connection info from DATABASE_URL
const dbUrl = new URL(process.env.DATABASE_URL);
const config = {
    user: dbUrl.username,
    password: dbUrl.password,
    host: dbUrl.hostname,
    port: dbUrl.port || 5432,
    database: dbUrl.pathname.substring(1), // Remove leading slash
    ssl: process.env.NODE_ENV === 'production',
};

const pool = new Pool(config);

async function completeMigration() {
    const client = await pool.connect();

    try {
        console.log('Starting to complete migration...');

        // Begin transaction
        await client.query('BEGIN');

        // Check if Order table still has old columns
        const orderResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Order' 
      AND column_name IN ('dateOrdered', 'dateArrived');
    `);

        if (orderResult.rows.length > 0) {
            console.log('Removing old date columns from Order table...');
            await client.query(`
        ALTER TABLE "Order"
        DROP COLUMN IF EXISTS "dateOrdered",
        DROP COLUMN IF EXISTS "dateArrived";
      `);
            console.log('Old columns removed successfully.');
        } else {
            console.log('Order table already fully updated.');
        }

        // Make deliveryTime NOT NULL if it isn't already
        const columnCheckResult = await client.query(`
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Order' 
      AND column_name = 'deliveryTime';
    `);

        if (
            columnCheckResult.rows.length > 0 &&
            columnCheckResult.rows[0].is_nullable === 'YES'
        ) {
            console.log('Making deliveryTime column NOT NULL...');
            await client.query(`
        ALTER TABLE "Order" 
        ALTER COLUMN "deliveryTime" SET NOT NULL;
      `);
        }

        // Commit transaction
        await client.query('COMMIT');
        console.log('Migration completed successfully!');
    } catch (err) {
        // Rollback transaction on error
        await client.query('ROLLBACK');
        console.error('Error completing migration:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

completeMigration().catch((err) => {
    console.error('Failed to complete migration:', err);
    process.exit(1);
});
