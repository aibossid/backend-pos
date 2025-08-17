const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Load data dari file
const products = JSON.parse(fs.readFileSync("products.json"));
let cart = JSON.parse(fs.readFileSync("cart.json"));

// Helper untuk save cart
function saveCart() {
  fs.writeFileSync("cart.json", JSON.stringify(cart, null, 2));
}

// =============== ROUTES =============== //

// Semua produk
app.get("/products", (req, res) => {
  res.json(products);
});

// Detail produk by ID
app.get("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = products.find((p) => p.id === id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

// Lihat cart
app.get("/cart", (req, res) => {
  res.json(cart);
});

// Tambah ke cart
app.post("/cart", (req, res) => {
  const { productId, qty } = req.body;
  if (!productId || !qty) {
    return res.status(400).json({ message: "productId and qty required" });
  }

  const product = products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const existing = cart.find((c) => c.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      qty,
    });
  }

  saveCart();
  res.json(cart);
});

// Hapus dari cart
app.delete("/cart/:id", (req, res) => {
  const id = Number(req.params.id);
  cart = cart.filter((item) => item.id !== id);
  saveCart();
  res.json(cart);
});

// Update qty di cart
app.patch("/cart/:id", (req, res) => {
  const id = Number(req.params.id);
  const { qty } = req.body;
  if (qty == null) return res.status(400).json({ message: "qty required" });

  cart = cart.map((item) =>
    item.id === id ? { ...item, qty: Number(qty) } : item
  );

  saveCart();
  res.json(cart);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
