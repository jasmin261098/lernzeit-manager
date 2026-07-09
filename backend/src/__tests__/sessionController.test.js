import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../prisma.js';
import { getAll, start, stop } from '../controllers/sessionController.js';

vi.mock('../prisma.js', () => ({
    prisma: {
        studySession: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        }
    }
}));

const makeReq = (overrides = {}) => ({
    user: { userId: 1 },
    body: {},
    params: {},
    ...overrides,
});

const makeRes = () => {
    const res = { status: vi.fn(), json: vi.fn() };
    res.status.mockReturnValue(res);
    return res;
};

describe('sessionController — getAll', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns sessions ordered by startTime desc', async () => {
        const sessions = [{ id: 2 }, { id: 1 }];
        prisma.studySession.findMany.mockResolvedValue(sessions);

        const res = makeRes();
        await getAll(makeReq(), res);

        expect(res.json).toHaveBeenCalledWith(sessions);
    });
});

describe('sessionController — start', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns 409 when an active session already exists', async () => {
        prisma.studySession.findFirst.mockResolvedValue({ id: 5, endTime: null });

        const res = makeRes();
        await start(makeReq({ body: { topic: 'JS' } }), res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ error: 'Es läuft bereits eine aktive Session' });
    });

    it('creates and returns a new session with status 201', async () => {
        prisma.studySession.findFirst.mockResolvedValue(null);
        const newSession = { id: 10, userId: 1, topic: 'JS' };
        prisma.studySession.create.mockResolvedValue(newSession);

        const res = makeRes();
        await start(makeReq({ body: { topic: 'JS', goalId: 3 } }), res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(newSession);
    });
});

describe('sessionController — stop', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns 404 when session is not found', async () => {
        prisma.studySession.findFirst.mockResolvedValue(null);

        const res = makeRes();
        await stop(makeReq({ params: { id: '99' } }), res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Nicht gefunden' });
    });

    it('returns 400 when session is already stopped', async () => {
        prisma.studySession.findFirst.mockResolvedValue({ id: 1, endTime: new Date(), startTime: new Date() });

        const res = makeRes();
        await stop(makeReq({ params: { id: '1' } }), res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Session bereits beendet' });
    });

    it('stops the session, computes duration, and returns the updated session', async () => {
        const startTime = new Date(Date.now() - 90 * 60000); // 90 minutes ago
        prisma.studySession.findFirst.mockResolvedValue({ id: 1, endTime: null, startTime });
        const updated = { id: 1, duration: 90 };
        prisma.studySession.update.mockResolvedValue(updated);

        const res = makeRes();
        await stop(makeReq({ params: { id: '1' } }), res);

        expect(prisma.studySession.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 1 },
                data: expect.objectContaining({ duration: expect.any(Number) })
            })
        );
        expect(res.json).toHaveBeenCalledWith(updated);
    });
});
