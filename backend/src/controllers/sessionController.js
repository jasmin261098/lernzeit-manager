const prisma = require('../prisma');

exports.getAll = async (req, res) => {
    const sessions = await prisma.studySession.findMany({
        where: { userId: req.user.userId },
        orderBy: { startTime: 'desc' },
        include: { goal: { select: { title: true } } }
    });
    res.json(sessions);
};

exports.start = async (req, res) => {
    const { goalId, topic } = req.body;
    const session = await prisma.studySession.create({
        data: { userId: req.user.userId, goalId, startTime: new Date(), topic }
    });
    res.status(201).json(session);
};

exports.stop = async (req, res) => {
    const id = Number(req.params.id);
    const session = await prisma.studySession.findFirst({
        where: { id, userId: req.user.userId }
    });
    if (!session) return res.status(404).json({ error: 'Nicht gefunden' });
    if (session.endTime) return res.status(400).json({ error: 'Session bereits beendet' });

    const now = new Date();
    const duration = Math.round((now - session.startTime) / 60000);
    const updated = await prisma.studySession.update({
        where: { id },
        data: { endTime: now, duration }
    });
    res.json(updated);
};
