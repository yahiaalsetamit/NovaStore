const express = require('express');
const db = require('../database/database');

const router = express.Router();

// 2. إضافة منتج إلى السلة
router.post('/', (req, res) => {
    const productId = Number(req.body.productId);
    const quantity = Number(req.body.quantity || 1);

    if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Valid productId is required.'
        });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Quantity must be a positive integer.'
        });
    }

    db.get(
        'SELECT * FROM products WHERE id = ?',
        [productId],
        (productError, product) => {
            if (productError) {
                return res.status(500).json({
                    success: false,
                    message: productError.message
                });
            }

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found.'
                });
            }

            if (quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: 'Requested quantity exceeds available stock.'
                });
            }

            db.get(
                'SELECT * FROM cart_items WHERE product_id = ?',
                [productId],
                (cartError, cartItem) => {
                    if (cartError) {
                        return res.status(500).json({
                            success: false,
                            message: cartError.message
                        });
                    }

                    if (cartItem) {
                        const newQuantity = cartItem.quantity + quantity;

                        if (newQuantity > product.stock) {
                            return res.status(400).json({
                                success: false,
                                message: 'Total quantity exceeds available stock.'
                            });
                        }

                        db.run(
                            'UPDATE cart_items SET quantity = ? WHERE product_id = ?',
                            [newQuantity, productId],
                            function (updateError) {
                                if (updateError) {
                                    return res.status(500).json({
                                        success: false,
                                        message: updateError.message
                                    });
                                }

                                return res.json({
                                    success: true,
                                    message: 'Product quantity updated in cart.',
                                    cartItem: {
                                        productId,
                                        quantity: newQuantity
                                    }
                                });
                            }
                        );

                        return;
                    }

                    db.run(
                        `
                        INSERT INTO cart_items (product_id, quantity)
                        VALUES (?, ?)
                        `,
                        [productId, quantity],
                        function (insertError) {
                            if (insertError) {
                                return res.status(500).json({
                                    success: false,
                                    message: insertError.message
                                });
                            }

                            return res.status(201).json({
                                success: true,
                                message: 'Product added to cart.',
                                cartItem: {
                                    id: this.lastID,
                                    productId,
                                    quantity
                                }
                            });
                        }
                    );
                }
            );
        }
    );
});
// عرض السلة وحساب الإجمالي
router.get('/', (req, res) => {
    const sql = `
        SELECT
            cart_items.id AS cart_item_id,
            cart_items.product_id,
            cart_items.quantity,
            products.name,
            products.description,
            products.price,
            products.category,
            products.image,
            products.stock,
            products.price * cart_items.quantity AS subtotal
        FROM cart_items
        INNER JOIN products
            ON products.id = cart_items.product_id
        ORDER BY cart_items.id DESC
    `;

    db.all(sql, [], (error, rows) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        const total = rows.reduce((sum, item) => {
            return sum + item.subtotal;
        }, 0);

        return res.json({
            success: true,
            count: rows.length,
            items: rows,
            total
        });
    });
});
// تعديل كمية منتج في السلة
router.put('/:productId', (req, res) => {
    const productId = Number(req.params.productId);
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Valid productId is required.'
        });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Quantity must be a positive integer.'
        });
    }

    db.get(
        'SELECT * FROM products WHERE id = ?',
        [productId],
        (productError, product) => {
            if (productError) {
                return res.status(500).json({
                    success: false,
                    message: productError.message
                });
            }

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found.'
                });
            }

            if (quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: 'Requested quantity exceeds available stock.'
                });
            }

            db.run(
                `
                UPDATE cart_items
                SET quantity = ?
                WHERE product_id = ?
                `,
                [quantity, productId],
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
                            message: 'Product is not in the cart.'
                        });
                    }

                    return res.json({
                        success: true,
                        message: 'Cart quantity updated successfully.',
                        cartItem: {
                            productId,
                            quantity
                        }
                    });
                }
            );
        }
    );
});
// حذف منتج من السلة
router.delete('/:productId', (req, res) => {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Valid productId is required.'
        });
    }

    db.run(
        'DELETE FROM cart_items WHERE product_id = ?',
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
                    message: 'Product is not in the cart.'
                });
            }

            return res.json({
                success: true,
                message: 'Product removed from cart.'
            });
        }
    );
});
// تفريغ السلة بالكامل
router.delete('/', (req, res) => {
    db.run(
        'DELETE FROM cart_items',
        [],
        function (error) {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message
                });
            }

            return res.json({
                success: true,
                message: 'Cart cleared successfully.',
                deletedItems: this.changes
            });
        }
    );
});

module.exports = router;