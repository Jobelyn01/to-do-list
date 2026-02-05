import express from 'express';
import session from 'express-session';
import { pool } from './db.js';
import cors from 'cors';
import bcrypt from 'bcrypt';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.set('trust proxy', 1);

app.use(
  session({
    name: 'user-session',
    secret: 'superSecretKey',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60
    }
  })
);


const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }
  next();
};


app.post('/register', async (req, res) => {
  try {
    const { username, password, confirm } = req.body;

    if (!username || !password || !confirm)
      return res.status(400).json({ success: false, message: "All fields are required" });

    if (password !== confirm)
      return res.status(400).json({ success: false, message: "Passwords do not match" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO user_accounts (username, password, name) VALUES ($1, $2, $3)',
      [username, hashedPassword, username]
    );

    res.json({ success: true, message: "Registered successfully!" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM user_accounts WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ success: false, message: "User not found" });

    const user = result.rows[0];

    const isOk = await bcrypt.compare(password, user.password);

    if (!isOk)
      return res.status(401).json({ success: false, message: "Wrong password" });

    req.session.user = {
      id: user.id,
      username: user.username,
      name: user.name
    };

    res.json({ success: true, message: "Login success" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('user-session');
    res.json({ success: true });
  });
});


app.get('/get-list', requireLogin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.*, COUNT(i.id)::int AS item_count 
      FROM list l 
      LEFT JOIN items i ON l.id = i.list_id 
      GROUP BY l.id 
      ORDER BY l.id DESC
    `);

    res.json({ success: true, list: result.rows });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


app.post('/add-list', requireLogin, async (req, res) => {
  try {
    const { title, description } = req.body;

    await pool.query(
      'INSERT INTO list (title, description) VALUES ($1, $2)',
      [title, description || ""]
    );

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


app.put('/edit-list/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    await pool.query(
      'UPDATE list SET title = $1, description = $2 WHERE id = $3',
      [title, description, id]
    );

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


app.delete('/delete-list/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'DELETE FROM list WHERE id = $1',
      [id]
    );

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


app.get('/get-items/:listId', requireLogin, async (req, res) => {
  try {
    const { listId } = req.params;

    const items = await pool.query(
      'SELECT * FROM items WHERE list_id = $1 ORDER BY id ASC',
      [listId]
    );

    const listInfo = await pool.query(
      'SELECT * FROM list WHERE id = $1',
      [listId]
    );

    res.json({
      success: true,
      items: items.rows,
      listInfo: listInfo.rows[0]
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


app.post('/add-item', requireLogin, async (req, res) => {
  try {
    const { listId, title } = req.body;

    await pool.query(
      'INSERT INTO items (list_id, title, status) VALUES ($1, $2, $3)',
      [listId, title, 'pending']
    );

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


app.put('/edit-item/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status } = req.body;

    await pool.query(
      'UPDATE items SET title = $1, status = $2 WHERE id = $3',
      [title, status, id]
    );

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


app.delete('/delete-item/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'DELETE FROM items WHERE id = $1',
      [id]
    );

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
