import { prisma } from '../prisma.js';

export const create = async (req, res) => {
    const { message, scheduledAt } = req.body;
    if (!message || !scheduledAt) {
        return res.status(400).json({ error: 'message und scheduledAt erforderlich' });
    }
    const reminder = await prisma.reminder.create({
        data: { userId: req.user.userId, message, scheduledAt: new Date(scheduledAt) }
    });
    res.status(201).json(reminder);
};

export const getAll = async (req, res) => {
    const reminders = await prisma.reminder.findMany({
        where: { userId: req.user.userId },
        orderBy: { scheduledAt: 'asc' }
    });
    res.json(reminders);
};

export const remove = async (req, res) => {
    const reminder = await prisma.reminder.findFirst({
        where: { id: Number(req.params.id), userId: req.user.userId }
    });
    if (!reminder) return res.status(404).json({ error: 'Nicht gefunden' });
    await prisma.reminder.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
};
