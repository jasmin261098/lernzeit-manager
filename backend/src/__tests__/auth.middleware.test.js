import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middleware/auth.js';

vi.mock('jsonwebtoken');

const makeRes = () => {
    const res = { status: vi.fn(), json: vi.fn() };
    res.status.mockReturnValue(res);
    return res;
};

describe('auth middleware', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
    });

    it('returns 401 when Authorization header is missing', () => {
        const req = { headers: {} };
        const res = makeRes();
        const next = vi.fn();

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Kein Token' });
        expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when header does not start with Bearer', () => {
        const req = { headers: { authorization: 'Basic abc123' } };
        const res = makeRes();
        const next = vi.fn();

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Kein Token' });
        expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when token is invalid', () => {
        jwt.verify.mockImplementation(() => { throw new Error('invalid'); });
        const req = { headers: { authorization: 'Bearer bad-token' } };
        const res = makeRes();
        const next = vi.fn();

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Ungültiges Token' });
        expect(next).not.toHaveBeenCalled();
    });

    it('sets req.user and calls next() for a valid token', () => {
        const payload = { userId: 42 };
        jwt.verify.mockReturnValue(payload);
        const req = { headers: { authorization: 'Bearer valid-token' } };
        const res = makeRes();
        const next = vi.fn();

        authMiddleware(req, res, next);

        expect(req.user).toEqual(payload);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });
});
