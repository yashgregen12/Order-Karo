import express from 'express';

const router = express.Router();

router.post('/login', (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.APP_PASSWORD;

    if (password === adminPassword) {
        // Return a simple token or success message. 
        // For "basic" auth, we can just return a fixed token that the frontend stores.
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token: 'auth-success-token' // In a real app, use JWT
        });
    } else {
        return res.status(401).json({
            success: false,
            message: 'Invalid password'
        });
    }
});

export default router;
