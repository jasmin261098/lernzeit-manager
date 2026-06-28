import { prisma } from '../prisma.js';

export const getAll = async (req, res) => {
    const goals = await prisma.learningGoal.findMany({
        where: { userId: req.user.userId }
    });
    res.json(goals);
};

export const create = async (req, res) => {
    const { title, description, targetHours, startDate, endDate } = req.body;
    const goal = await prisma.learningGoal.create({
        data: { userId: req.user.userId, title, description, targetHours, startDate: new Date(startDate), endDate: new Date(endDate) }
    });
    res.status(201).json(goal);
};

export const update = async (req, res) => {
    const goal = await prisma.learningGoal.findFirst({
        where: { id: Number(req.params.id), userId:req.user.userId }
    });
    if (!goal) return res.status(404).json({ error: 'Nicht gefunden' });

    const { title, description, targetHours, startDate, endDate, status } = req.body;
    const updated = await prisma.learningGoal.update({
        where: { id: Number(req.params.id) },
        data: {
            ...(title !== undefined       && { title }),
            ...(description !== undefined && { description }),
            ...(targetHours !== undefined && { targetHours }),
            ...(startDate   !== undefined && { startDate: new Date(startDate) }),
            ...(endDate     !== undefined && { endDate:   new Date(endDate) }),
            ...(status      !== undefined && { status }),
        }
    });
    res.json(updated);
};

export const remove = async (req, res) => {
    const goal = await prisma.learningGoal.findFirst({
        where: { id: Number(req.params.id), userId: req.user.userId }
    });
    if(!goal) return res.status(404).json({ error: 'Nicht gefunden' });

    await prisma.learningGoal.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
};

export const updateStatus = async (req, res) => {
    const { status } = req.body;
    if (!['open', 'in_progress', 'done'].includes(status)) {
        return res.status(400).json({ error: 'Ungültiger Status' });
    }
    const updated = await prisma.learningGoal.updateMany({
        where: { id: Number(req.params.id), userId: req.user.userId },
        data: { status }
    });
    res.json(updated);
};