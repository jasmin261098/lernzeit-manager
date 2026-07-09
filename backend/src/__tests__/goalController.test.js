import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../prisma.js';
import { getAll, create, update, remove, updateStatus } from '../controllers/goalController.js';

vi.mock('../prisma.js', () => ({
    prisma: {
        learningGoal: {
            findMany: vi.fn(),
            create: vi.fn(),
            findFirst: vi.fn(),
            update: vi.fn(),
            updateMany: vi.fn(),
            delete: vi.fn(),
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
    const res = { status: vi.fn(), json: vi.fn(), send: vi.fn() };
    res.status.mockReturnValue(res);
    return res;
};

describe('goalController — getAll', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns all goals for the user', async () => {
        const goals = [{ id: 1, title: 'Learn JS' }];
        prisma.learningGoal.findMany.mockResolvedValue(goals);

        const res = makeRes();
        await getAll(makeReq(), res);

        expect(res.json).toHaveBeenCalledWith(goals);
    });
});

describe('goalController — create', () => {
    beforeEach(() => vi.clearAllMocks());

    it('creates a goal and returns 201', async () => {
        const goal = { id: 2, title: 'TypeScript', userId: 1 };
        prisma.learningGoal.create.mockResolvedValue(goal);

        const req = makeReq({
            body: { title: 'TypeScript', description: '', targetHours: 20, startDate: '2026-01-01', endDate: '2026-06-01' }
        });
        const res = makeRes();
        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(goal);
    });
});

describe('goalController — update', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns 404 when goal is not found', async () => {
        prisma.learningGoal.findFirst.mockResolvedValue(null);

        const req = makeReq({ params: { id: '99' } });
        const res = makeRes();
        await update(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Nicht gefunden' });
    });

    it('updates and returns the goal when found', async () => {
        const existing = { id: 1, title: 'Old' };
        const updated = { id: 1, title: 'New' };
        prisma.learningGoal.findFirst.mockResolvedValue(existing);
        prisma.learningGoal.update.mockResolvedValue(updated);

        const req = makeReq({ params: { id: '1' }, body: { title: 'New' } });
        const res = makeRes();
        await update(req, res);

        expect(res.json).toHaveBeenCalledWith(updated);
    });
});

describe('goalController — remove', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns 404 when goal is not found', async () => {
        prisma.learningGoal.findFirst.mockResolvedValue(null);

        const req = makeReq({ params: { id: '99' } });
        const res = makeRes();
        await remove(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('deletes the goal and returns 204', async () => {
        prisma.learningGoal.findFirst.mockResolvedValue({ id: 1 });
        prisma.learningGoal.delete.mockResolvedValue({});

        const req = makeReq({ params: { id: '1' } });
        const res = makeRes();
        await remove(req, res);

        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });
});

describe('goalController — updateStatus', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns 400 for an invalid status value', async () => {
        const req = makeReq({ params: { id: '1' }, body: { status: 'invalid' } });
        const res = makeRes();
        await updateStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Ungültiger Status' });
    });

    it.each(['open', 'in_progress', 'done'])('accepts valid status "%s"', async (status) => {
        prisma.learningGoal.updateMany.mockResolvedValue({ count: 1 });

        const req = makeReq({ params: { id: '1' }, body: { status } });
        const res = makeRes();
        await updateStatus(req, res);

        expect(res.json).toHaveBeenCalledWith({ count: 1 });
    });
});
