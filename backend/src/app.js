import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { prisma } from './prisma.js';
import authRoutes from './routes/auth.js';
import goalRoutes from './routes/goals.js';
import planRoutes from './routes/plans.js';
import sessionRoutes from './routes/sessions.js';
import reminderRoutes from './routes/reminders.js';
import dashboardRoutes from './routes/dashboard.js';

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
app.listen(PORT, () => console.log(`Backend läuft auf http://localhost:${PORT}`));

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