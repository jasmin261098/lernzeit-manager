import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import bcrypt from 'bcrypt';
import { prisma } from './prisma.js';
import authRoutes from './routes/auth.js';
import goalRoutes from './routes/goals.js';
import planRoutes from './routes/plans.js';
import sessionRoutes from './routes/sessions.js';
import reminderRoutes from './routes/reminders.js';
import dashboardRoutes from './routes/dashboard.js';

async function seedDefaultUser() {
  const DEFAULT_EMAIL = 'demo@lernzeit.de';
  const DEFAULT_PASSWORD = 'demo1234';

  const existing = await prisma.user.findUnique({ where: { email: DEFAULT_EMAIL } });
  if (existing) return;

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear(), 11, 31);

  await prisma.user.create({
    data: {
      email: DEFAULT_EMAIL,
      passwordHash,
      goals: {
        create: [
          {
            title: 'TypeScript Grundlagen',
            description: 'TypeScript von Grund auf lernen: Typen, Interfaces, Generics',
            targetHours: 40,
            startDate: startOfYear,
            endDate: new Date(now.getFullYear(), 5, 30),
            status: 'in_progress',
          },
          {
            title: 'React & Vite',
            description: 'Moderne Frontend-Entwicklung mit React 18 und Vite',
            targetHours: 60,
            startDate: startOfYear,
            endDate: endOfYear,
            status: 'in_progress',
          },
          {
            title: 'Datenbanken mit Prisma',
            description: 'ORM-Konzepte, Datenbankdesign und Prisma in der Praxis',
            targetHours: 20,
            startDate: startOfYear,
            endDate: new Date(now.getFullYear(), 3, 30),
            status: 'done',
          },
        ],
      },
      plans: {
        create: [
          {
            title: 'Lernplan ' + now.getFullYear(),
            startDate: startOfYear,
            endDate: endOfYear,
            monthlyPlans: {
              create: [
                { month: 1, year: now.getFullYear(), plannedHours: 20, notes: 'TypeScript Basics' },
                { month: 2, year: now.getFullYear(), plannedHours: 24, notes: 'TypeScript Advanced' },
                { month: 3, year: now.getFullYear(), plannedHours: 20, notes: 'React Grundlagen' },
                { month: 4, year: now.getFullYear(), plannedHours: 28, notes: 'React Hooks & Context' },
                { month: 5, year: now.getFullYear(), plannedHours: 24, notes: 'React + Backend' },
                { month: 6, year: now.getFullYear(), plannedHours: 20, notes: 'Projektwoche' },
              ],
            },
          },
        ],
      },
      sessions: {
        create: [
          {
            startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 9, 0),
            endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 10, 30),
            duration: 90,
            topic: 'TypeScript Interfaces und Typen',
          },
          {
            startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5, 14, 0),
            endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5, 15, 45),
            duration: 105,
            topic: 'React useState und useEffect',
          },
          {
            startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3, 10, 0),
            endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3, 11, 0),
            duration: 60,
            topic: 'Vite Projektkonfiguration',
          },
          {
            startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 16, 0),
            endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 17, 30),
            duration: 90,
            topic: 'TypeScript Generics',
          },
          {
            startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0),
            endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 45),
            duration: 45,
            topic: 'React Context API',
          },
        ],
      },
      reminders: {
        create: [
          {
            message: 'Tägliche Lerneinheit: TypeScript Übungen nicht vergessen!',
            scheduledAt: new Date(now.getTime() + 60 * 60 * 1000),
            sent: false,
          },
          {
            message: 'Wöchentliche Lernziel-Überprüfung',
            scheduledAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            sent: false,
          },
        ],
      },
    },
  });

  console.log(`Seed: default user created (${DEFAULT_EMAIL} / ${DEFAULT_PASSWORD})`);
}

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://frontend:5173'] }));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/goals', goalRoutes);
app.use('/plans', planRoutes);
app.use('/sessions', sessionRoutes);
app.use('/reminders', reminderRoutes);
app.use('/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`);
  await seedDefaultUser();
});

cron.schedule('* * * * *', async () => {
    const due = await prisma.reminder.findMany({
        where: { sent: false, scheduledAt: { lte: new Date() } }
    });
    for (const reminder of due) {
        console.log(`Erinnerung für User ${reminder.userId}: ${reminder.message}`);
        // Hier später: E-Mail oder Push-Notification
        await prisma.reminder.update({ where: { id: reminder.id }, data: { sent: true } });
    }
});