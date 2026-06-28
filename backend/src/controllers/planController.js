import { prisma } from '../prisma.js';

export const getAll = async (req, res) => {
const plans = await prisma.learningPlan.findMany({
    where: { userId: req.user.userId },
    include: { monthlyPlans: true }
});
res.json(plans);
};

export const create = async (req, res) => {
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

export const update = async (req, res) => {
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

export const remove = async (req, res) => {
try {
    const plan = await prisma.learningPlan.findFirst({
        where: { id: Number(req.params.id), userId: req.user.userId }
    });
    if (!plan) return res.status(404).json({ error: 'Nicht gefunden' });

    await prisma.learningPlan.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
} catch (e) {
    console.error('Fehler beim Löschen des Plans:', e);
    res.status(500).json({ error: 'Plan konnte nicht gelöscht werden' });
}
};

export const getMonthly = async (req, res) => {
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

export const createMonthly = async (req, res) => {
const planId = Number(req.params.id);
const plan = await prisma.learningPlan.findFirst({
    where: { id: planId, userId: req.user.userId }
});
if (!plan) return res.status(404).json({ error: 'Plan nicht gefunden' });

const { month, year, plannedHours, notes } = req.body;
const entry = await prisma.monthlyPlan.create({
    data: { learningPlanId: planId, month, year, plannedHours, notes }
});
res.status(201).json(entry);
};

export const updateMonthly = async (req, res) => {
const entry = await prisma.monthlyPlan.findFirst({
    where: {
    id: Number(req.params.monthlyId),
    learningPlan: { userId: req.user.userId }
    }
});
if (!entry) return res.status(404).json({ error: 'Nicht gefunden' });

const { plannedHours, notes } = req.body;
const updated = await prisma.monthlyPlan.update({
    where: { id: Number(req.params.monthlyId) },
    data: {
    ...(plannedHours !== undefined && { plannedHours }),
    ...(notes       !== undefined && { notes }),
    }
});
res.json(updated);
};

export const removeMonthly = async (req, res) => {
try {
    const entry = await prisma.monthlyPlan.findFirst({
        where: {
        id: Number(req.params.monthlyId),
        learningPlan: { userId: req.user.userId }
        }
    });
    if (!entry) return res.status(404).json({ error: 'Nicht gefunden' });

    await prisma.monthlyPlan.delete({ where: { id: Number(req.params.monthlyId) } });
    res.status(204).send();
} catch (e) {
    console.error('Fehler beim Löschen des Monatsplans:', e);
    res.status(500).json({ error: 'Monatseintrag konnte nicht gelöscht werden' });
}
};
