import express from "express";
import session from "express-session";
import cors from "cors";
import bcrypt from "bcrypt";
import { pool } from "./db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", 1); 

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL, 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(session({
  name: "user-session",
  secret: process.env.SESSION_SECRET || "super-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: true, 
    sameSite: 'none', 
    httpOnly: true, 
    maxAge: 24 * 60 * 60 * 1000 
  },
}));

function auth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  next();
}

// REGISTER FIX: Hinihingi ang 'confirm' field
app.post("/register", async (req, res) => {
  const { username, password, confirm } = req.body;
  if (!username || !password || password !== confirm) {
    return res.status(400).json({ success: false, message: "Invalid input or passwords don't match" });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO user_accounts(username, password) VALUES($1, $2)", [username, hash]);
    res.json({ success: true, message: "Registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Username might be taken." });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM user_accounts WHERE username=$1", [username]);
    if (result.rows.length === 0) return res.status(400).json({ success: false, message: "User not found" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false, message: "Incorrect password" });

    req.session.userId = user.id;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("user-session", { sameSite: 'none', secure: true });
    res.json({ success: true });
  });
});

app.get("/get-list", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT l.id, l.title, COUNT(i.id) AS item_count FROM list l LEFT JOIN items i ON l.id=i.list_id WHERE l.user_id=$1 GROUP BY l.id", 
      [req.session.userId]
    );
    res.json({ success: true, list: result.rows });
  } catch (err) { res.status(500).json({ success: false }); }
});

app.post("/add-list", auth, async (req, res) => {
  const { title } = req.body;
  try {
    await pool.query("INSERT INTO list(title, user_id) VALUES($1, $2)", [title, req.session.userId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false }); }
});

app.put("/edit-list/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  await pool.query("UPDATE list SET title=$1 WHERE id=$2 AND user_id=$3", [title, id, req.session.userId]);
  res.json({ success: true });
});

app.delete("/delete-list/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM items WHERE list_id=$1", [id]);
    await pool.query("DELETE FROM list WHERE id=$1 AND user_id=$2", [id, req.session.userId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false }); }
});

app.get("/get-items/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    const items = await pool.query("SELECT * FROM items WHERE list_id=$1 ORDER BY id ASC", [id]);
    const listInfo = await pool.query("SELECT * FROM list WHERE id=$1 AND user_id=$2", [id, req.session.userId]);
    res.json({ items: items.rows, listInfo: listInfo.rows[0] });
  } catch (err) { res.status(500).json({ success: false }); }
});

app.post("/add-item", auth, async (req, res) => {
  const { listId, title } = req.body;
  try {
    await pool.query("INSERT INTO items(list_id, title) VALUES($1, $2)", [listId, title]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false }); }
});

app.put("/edit-item/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  try {
    await pool.query("UPDATE items SET title=$1 WHERE id=$2", [title, id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false }); }
});

app.delete("/delete-item/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM items WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false }); }
});

app.listen(PORT, () => console.log("Server running on port", PORT));