const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();

const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: "n10051957",
    database: process.env.NODE_ENV === "test" ? "shopping_test" : "shopping_db",
    port: 5432
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


if (process.env.NODE_ENV === "test") {
    app.post("/api/test/reset", async (req, res) => {
        try {
            // Исправлено: используем shopping_carts вместо carts
            await pool.query("TRUNCATE TABLE shopping_carts RESTART IDENTITY CASCADE");
            res.status(200).send("Database reset");
        } catch (err) {
            res.status(500).send("Reset failed");
        }
    });
}

// GET all
app.get("/api/carts", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM shopping_carts ORDER BY id");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// GET by ID
app.get("/api/carts/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ error: "Invalid cart ID" });

        const result = await pool.query("SELECT * FROM shopping_carts WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Cart not found" });
        
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// POST create
app.post("/api/carts", async (req, res) => {
    try {
        const { customer_id, items, status } = req.body;
        if (!customer_id || !Array.isArray(items)) {
            return res.status(400).json({ error: "Invalid input" });
        }

        const result = await pool.query(
            "INSERT INTO shopping_carts (customer_id, items, status) VALUES ($1, $2, $3) RETURNING *",
            [customer_id, JSON.stringify(items), status || "open"]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// PUT update
app.put("/api/carts/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { customer_id, items, status } = req.body;
        
        if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

        const result = await pool.query(
            "UPDATE shopping_carts SET customer_id = $1, items = $2, status = $3 WHERE id = $4 RETURNING *",
            [customer_id, JSON.stringify(items), status, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: "Cart not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// DELETE
app.delete("/api/carts/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await pool.query("DELETE FROM shopping_carts WHERE id = $1 RETURNING *", [id]);
        
        if (result.rows.length === 0) return res.status(404).json({ error: "Cart not found" });
        res.json({ message: "Cart deleted" });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Current ENV: ${process.env.NODE_ENV}`);
    });
}

module.exports = { app, pool };

module.exports = { app, pool };