const express = require('express');

const router = express.Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

router.post('/login', (req, res) => {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'اسم المستخدم وكلمة المرور مطلوبان.'
        });
    }

    if (
        username !== ADMIN_USERNAME ||
        password !== ADMIN_PASSWORD
    ) {
        return res.status(401).json({
            success: false,
            message: 'اسم المستخدم أو كلمة المرور غير صحيحة.'
        });
    }

    req.session.isAdmin = true;
    req.session.adminUsername = ADMIN_USERNAME;

    return res.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح.',
        admin: {
            username: ADMIN_USERNAME
        }
    });
});

router.get('/status', (req, res) => {
    const authenticated = Boolean(
        req.session && req.session.isAdmin
    );

    return res.json({
        success: true,
        authenticated,
        admin: authenticated
            ? {
                username: req.session.adminUsername
            }
            : null
    });
});

router.post('/logout', (req, res) => {
    if (!req.session) {
        return res.json({
            success: true,
            message: 'تم تسجيل الخروج.'
        });
    }

    req.session.destroy(error => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: 'تعذر تسجيل الخروج.'
            });
        }

        res.clearCookie('nova_admin_session');

        return res.json({
            success: true,
            message: 'تم تسجيل الخروج بنجاح.'
        });
    });
});

module.exports = router;