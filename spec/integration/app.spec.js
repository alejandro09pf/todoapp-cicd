/**
 * Integration tests for the ToDoApp REST API.
 * Uses SQLite in-memory (no MYSQL_HOST set) so no external DB is needed.
 */
const request = require('supertest');
const express = require('express');

// Bootstrap the app inline to avoid starting the real server
let app;
let db;

beforeAll(async () => {
    app = express();
    db = require('../../src/persistence');
    const getItems  = require('../../src/routes/getItems');
    const addItem   = require('../../src/routes/addItem');
    const updateItem = require('../../src/routes/updateItem');
    const deleteItem = require('../../src/routes/deleteItem');

    app.use(express.json());
    app.get('/items',    getItems);
    app.post('/items',   addItem);
    app.put('/items/:id', updateItem);
    app.delete('/items/:id', deleteItem);

    await db.init();
});

afterAll(async () => {
    await db.teardown();
});

describe('GET /items', () => {
    it('returns 200 with an array', async () => {
        const res = await request(app).get('/items');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});

describe('POST /items', () => {
    it('creates a new item and returns it', async () => {
        const res = await request(app)
            .post('/items')
            .send({ name: 'Buy milk' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({ name: 'Buy milk', completed: false });
        expect(res.body.id).toBeDefined();
    });
});

describe('PUT /items/:id', () => {
    it('updates an existing item', async () => {
        const createRes = await request(app)
            .post('/items')
            .send({ name: 'Walk the dog' });

        const id = createRes.body.id;

        const updateRes = await request(app)
            .put(`/items/${id}`)
            .send({ name: 'Walk the dog', completed: true });

        expect(updateRes.statusCode).toBe(200);
    });
});

describe('DELETE /items/:id', () => {
    it('deletes an item and returns 200', async () => {
        const createRes = await request(app)
            .post('/items')
            .send({ name: 'Item to delete' });

        const id = createRes.body.id;

        const deleteRes = await request(app).delete(`/items/${id}`);
        expect(deleteRes.statusCode).toBe(200);
    });
});
