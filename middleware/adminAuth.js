function requireAdmin(req, res, next) {
    if (!req.session || !req.session.isAdmin) {
        return res.status(401).json({
            success: false,
            message: 'يجب تسجيل الدخول كمسؤول للوصول إلى هذه الصفحة.'
        });
    }

    next();
}

module.exports = requireAdmin;