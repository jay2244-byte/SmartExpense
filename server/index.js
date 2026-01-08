require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initDb, openDb } = require('./db/database');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const JWT_SECRET = 'your-secret-key-change-in-production';

initDb().then(() => {
    console.log('Database initialized');
});

// Middleware to Authenticate Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const db = await openDb();
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.run(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        const userId = result.lastID;

        // Seed Default Categories for New User
        const defaultCategories = [
            { name: 'Food', color: '#FF6384', icon: '🍔' },
            { name: 'Transport', color: '#36A2EB', icon: '🚗' },
            { name: 'Entertainment', color: '#FFCE56', icon: '🎬' },
            { name: 'Health', color: '#4BC0C0', icon: '💊' },
            { name: 'Shopping', color: '#9966FF', icon: '🛍️' },
            { name: 'Utilities', color: '#FF9F40', icon: '💡' },
            { name: 'Other', color: '#C9CBCF', icon: '📦' }
        ];

        for (const cat of defaultCategories) {
            await db.run('INSERT INTO categories (user_id, name, color, icon) VALUES (?, ?, ?, ?)',
                [userId, cat.name, cat.color, cat.icon]);
        }

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Email already exists or other error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const db = await openDb();
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

        if (!user) return res.status(400).json({ error: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Protected API Routes - REQUIRE AUTH

app.get('/api/categories', authenticateToken, async (req, res) => {
    try {
        const db = await openDb();
        const categories = await db.all('SELECT * FROM categories WHERE user_id = ?', [req.user.id]);
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/expenses', authenticateToken, async (req, res) => {
    try {
        const db = await openDb();
        const expenses = await db.all(`
      SELECT e.id, e.amount, e.date, e.description, e.currency, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = ?
      ORDER BY date DESC
    `, [req.user.id]);
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/expenses', authenticateToken, async (req, res) => {
    const { category_id, amount, date, description, currency } = req.body;

    try {
        const db = await openDb();
        const result = await db.run(
            'INSERT INTO expenses (user_id, category_id, amount, date, description, currency) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, category_id, amount, date, description, currency || 'USD']
        );
        res.status(201).json({ id: result.lastID });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/expenses/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const db = await openDb();
        await db.run('DELETE FROM expenses WHERE id = ? AND user_id = ?', [id, req.user.id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/summary/monthly', authenticateToken, async (req, res) => {
    try {
        const db = await openDb();
        const summary = await db.all(`
      SELECT strftime('%Y-%m', date) as month, currency, SUM(amount) as total
      FROM expenses
      WHERE user_id = ?
      GROUP BY month, currency
      ORDER BY month DESC
      LIMIT 12
    `, [req.user.id]);
        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/summary/category', authenticateToken, async (req, res) => {
    try {
        const db = await openDb();
        const summary = await db.all(`
      SELECT c.id, c.name, c.color, c.budget, e.currency, SUM(e.amount) as total
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = ?
      GROUP BY c.id, e.currency
    `, [req.user.id]);
        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/categories/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { budget } = req.body;
    try {
        const db = await openDb();
        await db.run('UPDATE categories SET budget = ? WHERE id = ? AND user_id = ?', [budget, id, req.user.id]);
        res.json({ message: 'Category updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Serve Static Files
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all to serve React App
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
