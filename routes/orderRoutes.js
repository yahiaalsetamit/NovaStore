const express = require('express');
const db = require('../database/database');

const router = express.Router();

/*
إتمام الطلب.

سننفذ عند إرسال الطلب ما يلي:

قراءة عناصر السلة.
التأكد من أن السلة غير فارغة.
التأكد من توفر المخزون.
إنشاء سجل في جدول orders.
نسخ المنتجات إلى جدول order_items.
خصم الكمية من المخزون.
تفريغ السلة.
*/

router.post('/', (req, res) => {
    const {
        customerName,
        customerPhone,
        customerAddress
    } = req.body;

    if (!customerName || !customerPhone || !customerAddress) {
        return res.status(400).json({
            success: false,
            message: 'Customer name, phone and address are required.'
        });
    }

    const cartSql = `
        SELECT
            cart_items.product_id,
            cart_items.quantity,
            products.name,
            products.price,
            products.stock
        FROM cart_items
        INNER JOIN products
            ON products.id = cart_items.product_id
    `;

    db.all(cartSql, [], (cartError, cartItems) => {
        if (cartError) {
            return res.status(500).json({
                success: false,
                message: cartError.message
            });
        }

        if (cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty.'
            });
        }

        const unavailableProduct = cartItems.find(item => {
            return item.quantity > item.stock;
        });

        if (unavailableProduct) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock for product: ${unavailableProduct.name}`
            });
        }

        const totalPrice = cartItems.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0);

        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            const orderSql = `
                INSERT INTO orders
                (
                    customer_name,
                    customer_phone,
                    customer_address,
                    total_price,
                    status
                )
                VALUES (?, ?, ?, ?, ?)
            `;

            db.run(
                orderSql,
                [
                    customerName,
                    customerPhone,
                    customerAddress,
                    totalPrice,
                    'pending'
                ],
                function (orderError) {
                    if (orderError) {
                        db.run('ROLLBACK');

                        return res.status(500).json({
                            success: false,
                            message: orderError.message
                        });
                    }

                    const orderId = this.lastID;
                    let completedOperations = 0;
                    let transactionFailed = false;

                    cartItems.forEach(item => {
                        const orderItemSql = `
                            INSERT INTO order_items
                            (
                                order_id,
                                product_id,
                                product_name,
                                price,
                                quantity
                            )
                            VALUES (?, ?, ?, ?, ?)
                        `;

                        db.run(
                            orderItemSql,
                            [
                                orderId,
                                item.product_id,
                                item.name,
                                item.price,
                                item.quantity
                            ],
                            orderItemError => {
                                if (transactionFailed) {
                                    return;
                                }

                                if (orderItemError) {
                                    transactionFailed = true;
                                    db.run('ROLLBACK');

                                    return res.status(500).json({
                                        success: false,
                                        message: orderItemError.message
                                    });
                                }

                                db.run(
                                    `
                                    UPDATE products
                                    SET stock = stock - ?
                                    WHERE id = ?
                                    `,
                                    [item.quantity, item.product_id],
                                    stockError => {
                                        if (transactionFailed) {
                                            return;
                                        }

                                        if (stockError) {
                                            transactionFailed = true;
                                            db.run('ROLLBACK');

                                            return res.status(500).json({
                                                success: false,
                                                message: stockError.message
                                            });
                                        }

                                        completedOperations++;

                                        if (completedOperations === cartItems.length) {
                                            db.run(
                                                'DELETE FROM cart_items',
                                                [],
                                                clearCartError => {
                                                    if (clearCartError) {
                                                        transactionFailed = true;
                                                        db.run('ROLLBACK');

                                                        return res.status(500).json({
                                                            success: false,
                                                            message: clearCartError.message
                                                        });
                                                    }

                                                    db.run('COMMIT', commitError => {
                                                        if (commitError) {
                                                            return res.status(500).json({
                                                                success: false,
                                                                message: commitError.message
                                                            });
                                                        }

                                                        return res.status(201).json({
                                                            success: true,
                                                            message: 'Order completed successfully.',
                                                            order: {
                                                                id: orderId,
                                                                customerName,
                                                                customerPhone,
                                                                customerAddress,
                                                                totalPrice,
                                                                status: 'pending',
                                                                items: cartItems
                                                            }
                                                        });
                                                    });
                                                }
                                            );
                                        }
                                    }
                                );
                            }
                        );
                    });
                }
            );
        });
    });
});
// مسار عرض جميع الطلبات
router.get('/', (req, res) => {
    db.all(
        'SELECT * FROM orders ORDER BY id DESC',
        [],
        (error, orders) => {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message
                });
            }

            return res.json({
                success: true,
                count: orders.length,
                orders
            });
        }
    );
});
// مسار عرض طلب واحد مع تفاصيل المنتجات
router.get('/:id', (req, res) => {
    const orderId = Number(req.params.id);

    db.get(
        'SELECT * FROM orders WHERE id = ?',
        [orderId],
        (orderError, order) => {
            if (orderError) {
                return res.status(500).json({
                    success: false,
                    message: orderError.message
                });
            }

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found.'
                });
            }

            db.all(
                'SELECT * FROM order_items WHERE order_id = ?',
                [orderId],
                (itemsError, items) => {
                    if (itemsError) {
                        return res.status(500).json({
                            success: false,
                            message: itemsError.message
                        });
                    }

                    return res.json({
                        success: true,
                        order: {
                            ...order,
                            items
                        }
                    });
                }
            );
        }
    );
});

module.exports = router;