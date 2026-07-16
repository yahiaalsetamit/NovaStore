const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database/database');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const app = express();
const port = process.env.PORT || 3000;

const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use(bodyParser.json());
app.use(session({
    name: 'nova_admin_session',

    secret: 'nova-store-admin-secret-key-2026',

    resave: false,

    saveUninitialized: false,

    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 2
    }
}));
app.use(express.static('public'));

app.use('/auth', authRoutes);

app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);






app.get('/database-test', (req, res) => {
    db.get('SELECT datetime("now") AS currentTime', [], (error, row) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        return res.json({
            success: true,
            message: 'SQLite database is connected',
            currentTime: row.currentTime
        });
    });
});




app.listen(port, () => {
    console.log(`server is listening on port ${port}`);
});