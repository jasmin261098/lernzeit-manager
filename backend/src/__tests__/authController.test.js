import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { register, login } from '../controllers/authController.js';

vi.mock('bcrypt');
vi.mock('jsonwebtoken');
vi.mock('../prisma.js', () => ({
    prisma: {
        user: {
            create: vi.fn(),
            findUnique: vi.fn(),
        }
    }
}));

const makeRes = () => {
    const res = { status: vi.fn(), json: vi.fn() };
    res.status.mockReturnValue(res);
    return res;
};

describe('authController — register', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns 400 when email is missing', async () => {
        const req = { body: { password: 'pw' } };
        const res = makeRes();
        await register(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Email und Passwort erforderlich' });
    });

    it('returns 400 when password is missing', async () => {
        const req = { body: { email: 'a@b.com' } };
        const res = makeRes();
        await register(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 201 with user data on success', async () => {
        bcrypt.hash.mockResolvedValue('hashed');
        prisma.user.create.mockResolvedValue({ id: 1, email: 'a@b.com' });

        const req = { body: { email: 'a@b.com', password: 'pw' } };
        const res = makeRes();
        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ id: 1, email: 'a@b.com' });
    });

    it('returns 409 when email is already taken', async () => {
        bcrypt.hash.mockResolvedValue('hashed');
        prisma.user.create.mockRejectedValue(new Error('unique constraint'));

        const req = { body: { email: 'dupe@b.com', password: 'pw' } };
        const res = makeRes();
        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ error: 'Email bereits vergeben' });
    });
});

describe('authController — login', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
    });

    it('returns 401 when user is not found', async () => {
        prisma.user.findUnique.mockResolvedValue(null);

        const req = { body: { email: 'x@b.com', password: 'pw' } };
        const res = makeRes();
        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Ungültige Anmeldedaten' });
    });

    it('returns 401 when password is wrong', async () => {
        prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'a@b.com', passwordHash: 'h' });
        bcrypt.compare.mockResolvedValue(false);

        const req = { body: { email: 'a@b.com', password: 'wrong' } };
        const res = makeRes();
        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('returns a token on successful login', async () => {
        prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'a@b.com', passwordHash: 'h' });
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('signed-token');

        const req = { body: { email: 'a@b.com', password: 'pw' } };
        const res = makeRes();
        await login(req, res);

        expect(res.json).toHaveBeenCalledWith({ token: 'signed-token' });
    });
});
