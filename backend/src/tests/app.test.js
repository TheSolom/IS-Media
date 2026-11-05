import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';

import app from '../app.js';
import pool from '../configs/database.js';

describe('App Integration', () => {
    let server;
    let baseUrl;

    before(async () => {
        server = app.listen(0);
        const { port } = server.address();
        baseUrl = `http://127.0.0.1:${port}`;
    });

    after(async () => {
        await new Promise((resolve) => server.close(resolve));
        await pool.end();
    });

    it('GET / should return 418 welcome info', async () => {
        const res = await globalThis.fetch(`${baseUrl}/`);
        assert.equal(res.status, 418);
        const data = await res.json();
        assert.equal(data.success, true);
        assert.equal(data.message, 'Welcome to IS Media API V1');
    });

    it('unmatched route should return 404 JSON', async () => {
        const res = await globalThis.fetch(`${baseUrl}/non-existent-endpoint`);
        assert.equal(res.status, 404);
        const data = await res.json();
        assert.equal(data.success, false);
        assert.equal(data.message, 'Route not found');
    });

    it('CORS origin header should be reflected for allowed origins', async () => {
        const res = await globalThis.fetch(`${baseUrl}/`, {
            headers: { Origin: 'http://localhost:3000' },
        });
        assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:3000');
        assert.equal(res.headers.get('access-control-allow-credentials'), 'true');
    });
});
