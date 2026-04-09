const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'blog.db');
const schemaPath = path.join(__dirname, 'schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Execute schema
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema, (err) => {
            if (err) {
                console.error('Error executing schema', err.message);
            } else {
                console.log('Database tables are ready.');
                
                // Add security columns if they don't exist (Migrate existing DB)
                db.run('ALTER TABLE users ADD COLUMN security_question TEXT', (err) => {
                    if (err && !err.message.includes('duplicate column name')) {
                        console.error('Error adding security_question column', err.message);
                    }
                });
                db.run('ALTER TABLE users ADD COLUMN security_answer TEXT', (err) => {
                    if (err && !err.message.includes('duplicate column name')) {
                        console.error('Error adding security_answer column', err.message);
                    }
                });
            }
        });
    }
});

module.exports = db;
