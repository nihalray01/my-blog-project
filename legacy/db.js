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
        
        // Enable foreign keys
        db.run('PRAGMA foreign_keys = ON');

        // Execute schema
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema, (err) => {
            if (err) {
                console.error('Error executing schema', err.message);
            } else {
                console.log('Database tables are ready.');
                
                // Migrations: Add new columns if they don't exist
                const columns = [
                    'github_username TEXT',
                    'bio TEXT',
                    'avatar_url TEXT',
                    'security_question TEXT',
                    'security_answer TEXT'
                ];
                
                columns.forEach(col => {
                    const colName = col.split(' ')[0];
                    db.run(`ALTER TABLE users ADD COLUMN ${col}`, (err) => {
                        if (err && !err.message.includes('duplicate column name')) {
                            console.error(`Error adding ${colName} column:`, err.message);
                        }
                    });
                });
            }
        });
    }
});

module.exports = db;
