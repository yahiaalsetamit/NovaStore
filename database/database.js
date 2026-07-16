const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// إنشاء مجلد data إذا لم يكن موجودًا
const dataDirectory = path.join(__dirname, '..', 'data');

if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
}

// مسار ملف قاعدة البيانات
const databasePath =
    process.env.DATABASE_PATH ||
    path.join(dataDirectory, 'store.db');

// فتح قاعدة البيانات أو إنشاؤها تلقائيًا
const db = new sqlite3.Database(databasePath, (error) => {
    if (error) {
        console.error('Database connection error:', error.message);
        return;
    }

    console.log(`Connected to SQLite database: ${databasePath}`);
});

// تشغيل العلاقات بين الجداول
db.run('PRAGMA foreign_keys = ON');

// إنشاء الجداول
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL CHECK(price >= 0),
            category TEXT NOT NULL,
            image TEXT,
            stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL UNIQUE,
            quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0),

            FOREIGN KEY (product_id)
            REFERENCES products(id)
            ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            customer_address TEXT NOT NULL,
            total_price REAL NOT NULL CHECK(total_price >= 0),
            status TEXT NOT NULL DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            price REAL NOT NULL,
            quantity INTEGER NOT NULL CHECK(quantity > 0),

            FOREIGN KEY (order_id)
            REFERENCES orders(id)
            ON DELETE CASCADE,

            FOREIGN KEY (product_id)
            REFERENCES products(id)
        )
    `);
});

module.exports = db;