import express from "express";
import session from "express-session";
import cors from "cors";
import bcrypt from "bcrypt";
import { pool } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(cors({
  origin: "https://to-do-list-woad-mu.vercel.app", 
  credentials: true,
}));

app.use(session({
  name: "user-session",
  secret: "superSecretKey",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60,
  },
}));

const requireLogin = (req, res, next) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: "Not logged in" });
  next();
};

// Register
app.post("/register", async (req, res) => {
  try {
    const { username, password, confirm } = req.body;
    if (!username || !password || !confirm) return res.status(400).json({ success: false, message: "All fields are required" });
    if (password !== confirm) return res.status(400).json({ success: false, message: "Passwords do not match" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO user_accounts (username, password, name) VALUES ($1, $2, $3)', [username, hashedPassword, username]);
    res.json({ success: true, message: "Registered successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM user_accounts WHERE username=$1', [username]);
    if (result.rows.length === 0) return res.status(401).json({ success: false, message: "User not found" });

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ success: false, message: "Wrong password" });

    req.session.user = { id: user.id, username: user.username, name: user.name };
    res.json({ success: true, message: "Login success" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Logout
app.post("/logout", (req,res)=>{
  req.session.destroy(()=>res.clearCookie("user-session").json({success:true}));
});

// Get Lists
app.get("/get-list", requireLogin, async (req,res)=>{
  const result = await pool.query(`SELECT l.*, COUNT(i.id)::int AS item_count FROM list l LEFT JOIN items i ON l.id=i.list_id GROUP BY l.id ORDER BY l.id DESC`);
  res.json({success:true, list: result.rows});
});

// Add/Edit/Delete List
app.post("/add-list", requireLogin, async (req,res)=>{
  const { title } = req.body;
  await pool.query('INSERT INTO list (title) VALUES ($1)', [title]);
  res.json({success:true});
});

app.put("/edit-list/:id", requireLogin, async (req,res)=>{
  const { id } = req.params;
  const { title } = req.body;
  await pool.query('UPDATE list SET title=$1 WHERE id=$2', [title, id]);
  res.json({success:true});
});

app.delete("/delete-list/:id", requireLogin, async (req,res)=>{
  const { id } = req.params;
  await pool.query('DELETE FROM list WHERE id=$1', [id]);
  res.json({success:true});
});

// Tasks
app.get("/get-items/:listId", requireLogin, async (req,res)=>{
  const { listId } = req.params;
  const items = await pool.query('SELECT * FROM items WHERE list_id=$1 ORDER BY id ASC', [listId]);
  const listInfo = await pool.query('SELECT * FROM list WHERE id=$1', [listId]);
  res.json({success:true, items: items.rows, listInfo: listInfo.rows[0]});
});

app.post("/add-item", requireLogin, async (req,res)=>{
  const { listId, title } = req.body;
  await pool.query('INSERT INTO items (list_id,title,status) VALUES ($1,$2,$3)', [listId, title, 'pending']);
  res.json({success:true});
});

app.put("/edit-item/:id", requireLogin, async (req,res)=>{
  const { id } = req.params;
  const { title, status } = req.body;
  await pool.query('UPDATE items SET title=$1, status=$2 WHERE id=$3', [title,status,id]);
  res.json({success:true});
});

app.delete("/delete-item/:id", requireLogin, async (req,res)=>{
  const { id } = req.params;
  await pool.query('DELETE FROM items WHERE id=$1', [id]);
  res.json({success:true});
});

app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));
