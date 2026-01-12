export const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];

    // We expect the token to be exactly 'auth-success-token' for this basic auth implementation
    if (token === 'auth-success-token') {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized: Invalid or missing token' });
    }
};
