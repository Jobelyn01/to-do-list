import express from "express";
import session from "express-session";
import cors from "cors";
import bcrypt from "bcrypt";
import { pool } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

// Session setup
app.use(
  session({
    secret: "superSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// ===== REGISTER =====
app.post("/register", async (req, res) => {
  const { username, password, confirm } = req.body;
  if (!username || !password || !confirm)
    return res.status(400).json({ success: false, message: "Missing fields" });
  if (password !== confirm)
    return res.status(400).json({ success: false, message: "Passwords do not match" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO user_accounts (username, password) VALUES ($1, $2)",
      [username, hashed]
    );
    res.json({ success: true, message: "Registered successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "User already exists or DB error" });
  }
});

// ===== LOGIN =====
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: "Missing fields" });

  try {
    const result = await pool.query(
      "SELECT * FROM user_accounts WHERE username=$1",
      [username]
    );
    if (result.rows.length === 0)
      return res.status(400).json({ success: false, message: "User not found" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ success: false, message: "Incorrect password" });

    req.session.userId = user.id;
    res.json({ success: true, message: "Logged in successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "DB error" });
  }
});

// ===== LOGOUT =====
app.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: "Logged out" });
});

// ===== AUTH MIDDLEWARE =====
const auth = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  next();
};

// ===== LIST ROUTES =====
app.get("/get-list", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT l.*, COUNT(i.id) AS item_count FROM list l LEFT JOIN items i ON i.list_id=l.id WHERE l.user_id=$1 GROUP BY l.id ORDER BY l.id DESC",
      [req.session.userId]
    );
    res.json({ success: true, list: result.rows });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.post("/add-list", auth, async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ success: false });
  try {
    await pool.query("INSERT INTO list (title, user_id) VALUES ($1, $2)", [title, req.session.userId]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.put("/edit-list/:id", auth, async (req, res) => {
  const { title, description } = req.body;
  const { id } = req.params;
  try {
    await pool.query(
      "UPDATE list SET title=$1, description=$2 WHERE id=$3 AND user_id=$4",
      [title, description, id, req.session.userId]
    );
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.delete("/delete-list/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM list WHERE id=$1 AND user_id=$2", [id, req.session.userId]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

// ===== ITEMS =====
app.get("/get-items/:listId", auth, async (req, res) => {
  const { listId } = req.params;
  try {
    const listRes = await pool.query("SELECT * FROM list WHERE id=$1 AND user_id=$2", [listId, req.session.userId]);
    if (listRes.rows.length === 0) return res.status(404).json({ success: false });

    const itemsRes = await pool.query("SELECT * FROM items WHERE list_id=$1 ORDER BY id DESC", [listId]);
    res.json({ success: true, items: itemsRes.rows, listInfo: listRes.rows[0] });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.post("/add-item", auth, async (req, res) => {
  const { listId, title } = req.body;
  try {
    await pool.query("INSERT INTO items (list_id, title) VALUES ($1, $2)", [listId, title]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.delete("/delete-item/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM items WHERE id=$1", [id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

// ===== START SERVER =====
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
