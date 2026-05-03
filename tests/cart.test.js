const request = require("supertest");
const { app } = require("../src/server");
const { Pool } = require("pg");

jest.mock("pg", () => {
    const mClient = {
        query: jest.fn(),
    };
    return { Pool: jest.fn(() => mClient) };
});

const db = new Pool();

describe("Cart API", () => {

    beforeAll(async () => {

        await db.query("TRUNCATE TABLE shopping_carts RESTART IDENTITY CASCADE");    });

    beforeEach(() => jest.clearAllMocks());

    it("1. GET /api/carts - success", async () => {
        db.query.mockResolvedValueOnce({ rows: [{ id: 1, customer_id: 1, items: [], status: "open" }] });
        const res = await request(app).get("/api/carts");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("2. GET /api/carts/:id - success", async () => {
        db.query.mockResolvedValueOnce({ rows: [{ id: 1, customer_id: 1 }] });
        const res = await request(app).get("/api/carts/1");
        expect(res.statusCode).toBe(200);
        expect(res.body.id).toBe(1);
    });

    it("3. GET /api/carts/:id - invalid ID format", async () => {
        const res = await request(app).get("/api/carts/abc");
        expect(res.statusCode).toBe(400);
    });

    it("4. GET /api/carts/:id - not found", async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const res = await request(app).get("/api/carts/999");
        expect(res.statusCode).toBe(404);
    });

    it("5. POST /api/carts - success", async () => {
        db.query.mockResolvedValueOnce({ rows: [{ id: 10, customer_id: 1 }] });
        const res = await request(app)
            .post("/api/carts")
            .send({ customer_id: 1, items: [{ name: "Test", price: 10, quantity: 1 }], status: "open" });
        expect(res.statusCode).toBe(201);
    });

    it("6. POST /api/carts - missing customer_id", async () => {
        const res = await request(app).post("/api/carts").send({ items: [] });
        expect(res.statusCode).toBe(400);
    });

    it("7. PUT /api/carts/:id - success", async () => {
        db.query.mockResolvedValueOnce({ rows: [{ id: 1, status: "closed" }] });
        const res = await request(app)
            .put("/api/carts/1")
            .send({ customer_id: 1, items: [], status: "closed" });
        expect(res.statusCode).toBe(200);
    });

    it("8. PUT /api/carts/:id - not found", async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const res = await request(app).put("/api/carts/99").send({ customer_id: 1, items: [], status: "open" });
        expect(res.statusCode).toBe(404);
    });

    it("9. DELETE /api/carts/:id - success", async () => {
        db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
        const res = await request(app).delete("/api/carts/1");
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Cart deleted");
    });

    it("10. DELETE /api/carts/:id - not found", async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const res = await request(app).delete("/api/carts/999");
        expect(res.statusCode).toBe(404);
    });

    it("11. GET /api/carts - database error handling", async () => {
        db.query.mockRejectedValueOnce(new Error("DB Fail"));
        const res = await request(app).get("/api/carts");
        expect(res.statusCode).toBe(500);
    });

    it("12. POST /api/carts - invalid items type", async () => {
        const res = await request(app).post("/api/carts").send({ customer_id: 1, items: "not-an-array" });
        expect(res.statusCode).toBe(400);
    });
});