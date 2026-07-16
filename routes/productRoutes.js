const express = require('express');
const db = require('../database/database');

const router = express.Router();


// 1. إضافة منتج جديد
router.post('/', (req, res) => {
    const {
        name,
        description,
        price,
        category,
        image,
        stock
    } = req.body;

    if (!name || price === undefined || !category) {
        return res.status(400).json({
            success: false,
            message: 'Name, price and category are required.'
        });
    }

    if (Number(price) < 0 || Number(stock || 0) < 0) {
        return res.status(400).json({
            success: false,
            message: 'Price and stock cannot be negative.'
        });
    }

    const sql = `
        INSERT INTO products
        (name, description, price, category, image, stock)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
        name,
        description || '',
        Number(price),
        category,
        image || '',
        Number(stock || 0)
    ];

    db.run(sql, values, function (error) {
        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        return res.status(201).json({
            success: true,
            message: 'Product created successfully.',
            product: {
                id: this.lastID,
                name,
                description: description || '',
                price: Number(price),
                category,
                image: image || '',
                stock: Number(stock || 0)
            }
        });
    });
});
// 2. عرض جميع المنتجات مع البحث والتصنيف
router.get('/', (req, res) => {
    const search = req.query.search;
    const category = req.query.category;

    let sql = 'SELECT * FROM products';
    const conditions = [];
    const values = [];

    if (search) {
        conditions.push('(name LIKE ? OR description LIKE ?)');
        values.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
        conditions.push('category = ?');
        values.push(category);
    }

    if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' ORDER BY id DESC';

    db.all(sql, values, (error, rows) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        return res.json({
            success: true,
            count: rows.length,
            products: rows
        });
    });
});
// 3. عرض منتج محدد
router.get('/:id', (req, res) => {
    const productId = req.params.id;

    db.get(
        'SELECT * FROM products WHERE id = ?',
        [productId],
        (error, product) => {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message
                });
            }

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found.'
                });
            }

            return res.json({
                success: true,
                product
            });
        }
    );
});
// 4. حذف منتج
router.delete('/:id', (req, res) => {
    const productId = req.params.id;

    db.run(
        'DELETE FROM products WHERE id = ?',
        [productId],
        function (error) {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found.'
                });
            }

            return res.json({
                success: true,
                message: 'Product deleted successfully.'
            });
        }
    );
});

// تعديل منتج
router.put('/:id', (req, res) => {
    const productId = req.params.id;

    const {
        name,
        description,
        price,
        category,
        image,
        stock
    } = req.body;

    if (!name || price === undefined || !category) {
        return res.status(400).json({
            success: false,
            message: 'Name, price and category are required.'
        });
    }

    if (Number(price) < 0 || Number(stock || 0) < 0) {
        return res.status(400).json({
            success: false,
            message: 'Price and stock cannot be negative.'
        });
    }

    const sql = `
        UPDATE products
        SET name = ?,
            description = ?,
            price = ?,
            category = ?,
            image = ?,
            stock = ?
        WHERE id = ?
    `;

    const values = [
        name,
        description || '',
        Number(price),
        category,
        image || '',
        Number(stock || 0),
        productId
    ];

    db.run(sql, values, function (error) {
        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.'
            });
        }

        db.get(
            'SELECT * FROM products WHERE id = ?',
            [productId],
            (selectError, product) => {
                if (selectError) {
                    return res.status(500).json({
                        success: false,
                        message: selectError.message
                    });
                }

                return res.json({
                    success: true,
                    message: 'Product updated successfully.',
                    product
                });
            }
        );
    });
});

module.exports = router;