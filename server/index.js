import express from "express";
import session from "express-session";
import cors from "cors";
import bcrypt from "bcrypt";
import { pool } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(
  session({
    name: "user-session",
    secret: "superSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

const requireLogin = (req, res, next) => {
  if (!req.session.user) return res.status(401).json({ success: false });
  next();
};

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { username, password, confirm } = req.body;
    if (!username || !password || !confirm) return res.status(400).json({ success: false });
    if (password !== confirm) return res.status(400).json({ success: false });

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO user_accounts (username, password, name) VALUES ($1, $2, $3)",
      [username, hashedPassword, username]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query("SELECT * FROM user_accounts WHERE username=$1", [username]);
    if (result.rows.length === 0) return res.status(401).json({ success: false });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false });

    req.session.user = { id: user.id, username: user.username };
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// LOGOUT
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("user-session");
    res.json({ success: true });
  });
});

// GET LISTS
app.get("/get-list", requireLogin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.*, COUNT(i.id)::int AS item_count 
      FROM list l
      LEFT JOIN items i ON l.id = i.list_id
      GROUP BY l.id
      ORDER BY l.id DESC
    `);
    res.json({ success: true, list: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// ADD LIST
app.post("/add-list", requireLogin, async (req, res) => {
  try {
    const { title } = req.body;
    await pool.query("INSERT INTO list (title, description) VALUES ($1, '')", [title]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// EDIT LIST
app.put("/edit-list/:id", requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    await pool.query("UPDATE list SET title=$1, description=$2 WHERE id=$3", [title, description, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// DELETE LIST
app.delete("/delete-list/:id", requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM list WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// GET ITEMS
app.get("/get-items/:listId", requireLogin, async (req, res) => {
  try {
    const { listId } = req.params;
    const itemsRes = await pool.query("SELECT * FROM items WHERE list_id=$1 ORDER BY id ASC", [listId]);
    const listRes = await pool.query("SELECT * FROM list WHERE id=$1", [listId]);
    res.json({ success: true, items: itemsRes.rows, listInfo: listRes.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// ADD ITEM
app.post("/add-item", requireLogin, async (req, res) => {
  try {
    const { listId, title } = req.body;
    await pool.query("INSERT INTO items (list_id, title, status) VALUES ($1,$2,'pending')", [listId, title]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// DELETE ITEM
app.delete("/delete-item/:id", requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM items WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
