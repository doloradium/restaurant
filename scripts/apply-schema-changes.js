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

async function applySchemaChanges() {
    const client = await pool.connect();

    try {
        console.log('Starting database schema changes...');

        // Begin transaction
        await client.query('BEGIN');

        // Create Address table if it doesn't exist
        console.log('Creating Address table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS "Address" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL,
        "city" TEXT NOT NULL,
        "street" TEXT NOT NULL,
        "houseNumber" TEXT NOT NULL,
        "apartment" TEXT,
        "entrance" TEXT,
        "floor" TEXT,
        "intercom" TEXT,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      );
    `);

        // Check if User table has columns to remove
        const userResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name IN ('street', 'house', 'apartment');
    `);

        if (userResult.rows.length > 0) {
            console.log('Removing address fields from User table...');
            await client.query(`
        ALTER TABLE "User"
        DROP COLUMN IF EXISTS "street",
        DROP COLUMN IF EXISTS "house",
        DROP COLUMN IF EXISTS "apartment";
      `);
        } else {
            console.log('User table already updated.');
        }

        // Check if Order table needs updating
        const orderResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Order' 
      AND column_name IN ('dateOrdered', 'dateArrived');
    `);

        if (orderResult.rows.length > 0) {
            console.log('Updating Order table...');

            // Add new columns
            await client.query(`
        ALTER TABLE "Order"
        ADD COLUMN IF NOT EXISTS "addressId" INTEGER,
        ADD COLUMN IF NOT EXISTS "deliveryTime" TIMESTAMP(3);
      `);

            // Copy data from dateOrdered to deliveryTime for existing orders
            await client.query(`
        UPDATE "Order" 
        SET "deliveryTime" = "dateOrdered"
        WHERE "deliveryTime" IS NULL AND "dateOrdered" IS NOT NULL;
      `);

            // Add foreign key constraint (might fail if data doesn't exist)
            try {
                await client.query(`
          ALTER TABLE "Order"
          ADD CONSTRAINT "Order_addressId_fkey" 
          FOREIGN KEY ("addressId") REFERENCES "Address"("id") 
          ON DELETE RESTRICT ON UPDATE CASCADE;
        `);
            } catch (err) {
                console.log(
                    'Warning: Could not add foreign key constraint yet.'
                );
                console.log(
                    'You will need to ensure all orders have a valid addressId.'
                );
            }

            // Drop old columns (commenting out to be safe, uncomment when ready)
            // await client.query(`
            //   ALTER TABLE "Order"
            //   DROP COLUMN IF EXISTS "dateOrdered",
            //   DROP COLUMN IF EXISTS "dateArrived";
            // `);
        } else {
            console.log('Order table already updated.');
        }

        // Commit transaction
        await client.query('COMMIT');
        console.log('Schema changes applied successfully!');
    } catch (err) {
        // Rollback transaction on error
        await client.query('ROLLBACK');
        console.error('Error applying schema changes:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

applySchemaChanges().catch((err) => {
    console.error('Failed to apply schema changes:', err);
    process.exit(1);
});
