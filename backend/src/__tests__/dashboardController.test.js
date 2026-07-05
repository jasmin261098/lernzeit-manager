import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../prisma.js';
import { getDashboard } from '../controllers/dashboardController.js';

vi.mock('../prisma.js', () => ({
    prisma: {
        learningGoal: { findMany: vi.fn() },
        studySession: { findMany: vi.fn() },
    }
}));

const makeRes = () => {
    const res = { json: vi.fn() };
    return res;
};

describe('dashboardController — getDashboard', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns zero totals when there are no sessions', async () => {
        prisma.learningGoal.findMany.mockResolvedValue([]);
        prisma.studySession.findMany.mockResolvedValue([]);

        const req = { user: { userId: 1 } };
        const res = makeRes();
        await getDashboard(req, res);

        expect(res.json).toHaveBeenCalledWith({ totalHours: 0, progress: [] });
    });

    it('calculates totalHours across all sessions', async () => {
        prisma.learningGoal.findMany.mockResolvedValue([]);
        prisma.studySession.findMany.mockResolvedValue([
            { goalId: null, duration: 60 },
            { goalId: null, duration: 30 },
        ]);

        const req = { user: { userId: 1 } };
        const res = makeRes();
        await getDashboard(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ totalHours: 1.5 })
        );
    });

    it('computes per-goal loggedHours and percent correctly', async () => {
        prisma.learningGoal.findMany.mockResolvedValue([
            { id: 1, title: 'JS', targetHours: 10 },
        ]);
        prisma.studySession.findMany.mockResolvedValue([
            { goalId: 1, duration: 300 }, // 5 hours
        ]);

        const req = { user: { userId: 1 } };
        const res = makeRes();
        await getDashboard(req, res);

        expect(res.json).toHaveBeenCalledWith({
            totalHours: 5,
            progress: [
                { goalId: 1, title: 'JS', targetHours: 10, loggedHours: 5, percent: 50 }
            ]
        });
    });

    it('caps progress percent at 100', async () => {
        prisma.learningGoal.findMany.mockResolvedValue([
            { id: 1, title: 'JS', targetHours: 2 },
        ]);
        // 240 minutes = 4 hours, which is 200% of 2h target → capped at 100
        prisma.studySession.findMany.mockResolvedValue([
            { goalId: 1, duration: 240 },
        ]);

        const req = { user: { userId: 1 } };
        const res = makeRes();
        await getDashboard(req, res);

        const call = res.json.mock.calls[0][0];
        expect(call.progress[0].percent).toBe(100);
    });

    it('does not count sessions from other goals toward a goal', async () => {
        prisma.learningGoal.findMany.mockResolvedValue([
            { id: 1, title: 'Goal A', targetHours: 10 },
            { id: 2, title: 'Goal B', targetHours: 10 },
        ]);
        prisma.studySession.findMany.mockResolvedValue([
            { goalId: 1, duration: 120 },
            { goalId: 2, duration: 60 },
        ]);

        const req = { user: { userId: 1 } };
        const res = makeRes();
        await getDashboard(req, res);

        const call = res.json.mock.calls[0][0];
        expect(call.progress[0].loggedHours).toBe(2);
        expect(call.progress[1].loggedHours).toBe(1);
    });
});
