require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Datastore = require("@seald-io/nedb");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const dataDir = path.join(__dirname, "data");
fs.mkdirSync(dataDir, { recursive: true });

const users = new Datastore({ filename: path.join(dataDir, "users.db"), autoload: true });
const favorites = new Datastore({ filename: path.join(dataDir, "favorites.db"), autoload: true });

users.ensureIndex({ fieldName: "email", unique: true }, (err) => {
    if (err) console.error("users ensureIndex error:", err);
  });
  favorites.ensureIndex({ fieldName: "key", unique: true }, (err) => {
    if (err) console.error("favorites ensureIndex error:", err);
  });

const sign = (user) =>
  jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

const auth = (req, _res, next) => {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return next({ status: 401, message: "Missing token" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    next({ status: 401, message: "Invalid token" });
  }
};

const mapDoc = (doc) => (doc ? { id: doc._id, ...Object.fromEntries(Object.entries(doc).filter(([k]) => k !== "_id")) } : doc);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/auth/register", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const existing = await users.findOne({ email });
    if (existing) return res.status(409).json({ error: "User already exists" });

    const password_hash = bcrypt.hashSync(password, 10);
    const user = await users.insert({ email, password_hash, created_at: new Date().toISOString() });

    return res.status(201).json({ token: sign(user), user: { id: user._id, email: user.email } });
  } catch (e) {
    next(e);
  }
});

app.post("/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const user = await users.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: "Incorrect password" });

    return res.json({ token: sign(user), user: { id: user._id, email: user.email } });
  } catch (e) {
    next(e);
  }
});

app.get("/me", auth, async (req, res, next) => {
  try {
    const user = await users.findOne({ _id: req.userId });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ id: user._id, email: user.email });
  } catch (e) {
    next(e);
  }
});

app.get("/favorites", auth, (req, res, next) => {
  favorites
    .find({ userId: req.userId })
    .sort({ created_at: -1 })
    .exec((err, list) => {
      if (err) return next(err);
      res.json(list.map((doc) => ({ id: doc._id, ...Object.fromEntries(Object.entries(doc).filter(([k]) => k !== "_id")) })));
    });
});

app.post("/favorites", auth, async (req, res, next) => {
  try {
    const { recipe_id, name, image, cuisine } = req.body || {};
    if (!recipe_id || !name) return res.status(400).json({ error: "recipe_id and name required" });

    const key = `${req.userId}:${recipe_id}`;
    const exists = await favorites.findOne({ key });
    if (exists) return res.status(409).json({ error: "Already in favorites" });

    const doc = await favorites.insert({
      userId: req.userId,
      recipe_id,
      key,
      name,
      image,
      cuisine,
      note: "",
      rating: 0,
      created_at: new Date().toISOString()
    });

    res.status(201).json(mapDoc(doc));
  } catch (e) {
    next(e);
  }
});

app.patch("/favorites/:id", auth, async (req, res, next) => {
  try {
    const { note, rating } = req.body || {};
    await favorites.update(
      { _id: req.params.id, userId: req.userId },
      { $set: { ...(note !== undefined ? { note } : {}), ...(rating !== undefined ? { rating } : {}) } }
    );
    const updated = await favorites.findOne({ _id: req.params.id, userId: req.userId });
    if (!updated) return res.status(404).json({ error: "Favorite not found" });
    res.json(mapDoc(updated));
  } catch (e) {
    next(e);
  }
});

app.delete("/favorites/:id", auth, async (req, res, next) => {
  try {
    const numRemoved = await favorites.remove({ _id: req.params.id, userId: req.userId }, { multi: false });
    if (!numRemoved) return res.status(404).json({ error: "Favorite not found" });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});


app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
