import pool from '../src/config/db.js';

const seedDatabase = async () => {
    try {
        console.log('Injecting 1,000 dummy requests for performance testing...');
        
        // 1. Create a dummy user and complex to satisfy foreign keys
        const userResult = await pool.query(`
            INSERT INTO users (email, role, complex_id) 
            VALUES ('loadtest@wonderpark.co.za', 'Resident', gen_random_uuid()) 
            RETURNING id, complex_id
        `);
        
        const userId = userResult.rows[0].id;
        const complexId = userResult.rows[0].complex_id;

        // 2. Bulk insert 1,000 service requests
        let values = [];
        for (let i = 1; i <= 1000; i++) {
            values.push(`('WP-TEST-${i}', 'Maintenance', 'Test description ${i}', 'Block A', 'Medium', '${complexId}', '${userId}')`);
        }
        
        await pool.query(`
            INSERT INTO service_requests (reference_number, category, description, location, severity, complex_id, submitted_by)
            VALUES ${values.join(', ')}
        `);

        console.log('✅ Seeding complete!');
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
    } finally {
        pool.end();
    }
};

seedDatabase();