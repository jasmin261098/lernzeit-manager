const prisma = require('../prisma');

exports.getAll = async (req, res) => {
const plans = await prisma.learningPlan.findMany({
    where: { userId: req.user.userId },
    include: { monthlyPlans: true }
});
res.json(plans);
};

exports.create = async (req, res) => {
const { title, startDate, endDate } = req.body;
if (!title || !startDate || !endDate) {
    return res.status(400).json({ error: 'title, startDate und endDate erforderlich' });
}
const plan = await prisma.learningPlan.create({
    data: {
    userId: req.user.userId,
    title,
    startDate: new Date(startDate),
    endDate: new Date(endDate)
    }
});
res.status(201).json(plan);
};

exports.update = async (req, res) => {
const plan = await prisma.learningPlan.findFirst({
    where: { id: Number(req.params.id), userId: req.user.userId }
});
if (!plan) return res.status(404).json({ error: 'Nicht gefunden' });

const { title, startDate, endDate } = req.body;
const updated = await prisma.learningPlan.update({
    where: { id: Number(req.params.id) },
    data: {
    ...(title     && { title }),
    ...(startDate && { startDate: new Date(startDate) }),
    ...(endDate   && { endDate:   new Date(endDate) })
    }
});
res.json(updated);
};

exports.remove = async (req, res) => {
const plan = await prisma.learningPlan.findFirst({
    where: { id: Number(req.params.id), userId: req.user.userId }
});
if (!plan) return res.status(404).json({ error: 'Nicht gefunden' });

await prisma.learningPlan.delete({ where: { id: Number(req.params.id) } });
res.status(204).send();
};

exports.getMonthly = async (req, res) => {
const month = Number(req.params.month);
const year  = Number(req.query.year) || new Date().getFullYear();

if (month < 1 || month > 12) {
    return res.status(400).json({ error: 'Monat muss zwischen 1 und 12 liegen' });
}

const monthlyPlans = await prisma.monthlyPlan.findMany({
    where: {
    month,
    year,
    learningPlan: { userId: req.user.userId }
    },
    include: { learningPlan: { select: { title: true } } }
});
res.json(monthlyPlans);
};