// run-manual-migration.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Path to migration SQL file
const migrationSqlPath = path.join(
    __dirname,
    '..',
    'prisma',
    'migrations',
    'manual_migration.sql'
);

try {
    // Get database URL from .env file or use default
    require('dotenv').config();
    const databaseUrl =
        process.env.DATABASE_URL ||
        'postgresql://postgres:postgres@localhost:5432/mosaic_sushi';

    console.log('Starting manual database migration...');

    // Read SQL file content
    const sqlContent = fs.readFileSync(migrationSqlPath, 'utf8');

    // Create temporary file with SQL command to pipe to psql
    const tempSqlFile = path.join(__dirname, 'temp_migration.sql');
    fs.writeFileSync(tempSqlFile, sqlContent);

    // Extract connection parameters from DATABASE_URL
    const dbUrl = new URL(databaseUrl);
    const host = dbUrl.hostname;
    const port = dbUrl.port || '5432';
    const database = dbUrl.pathname.substring(1); // Remove leading slash
    const user = dbUrl.username;
    const password = dbUrl.password;

    // Set PGPASSWORD environment variable for psql
    const env = { ...process.env, PGPASSWORD: password };

    // Run SQL using psql
    console.log('Applying SQL migration...');
    execSync(
        `psql -h ${host} -p ${port} -U ${user} -d ${database} -f ${tempSqlFile}`,
        {
            env,
            stdio: 'inherit',
        }
    );

    // Clean up temp file
    fs.unlinkSync(tempSqlFile);

    // Generate Prisma client
    console.log('Generating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    console.log('Migration completed successfully!');
} catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
}
