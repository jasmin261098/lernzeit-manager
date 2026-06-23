const prisma = require('../prisma');

exports.create = async (req, res) => {
    const { message, scheduledAt } = req.body;
    if (!message || !scheduledAt) {
        return res.status(400).json({ error: 'message und scheduledAt erforderlich' });
    }
    const reminder = await prisma.reminder.create({
        data: { userId: req.user.userId, message, scheduledAt: new Date(scheduledAt) }
    });
    res.status(201).json(reminder);
};

exports.getAll = async (req, res) => {
    const reminders = await prisma.reminder.findMany({
        where: { userId: req.user.userId },
        orderBy: { scheduledAt: 'asc' }
    });
    res.json(reminders);
};
