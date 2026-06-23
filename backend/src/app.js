require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const prisma = require('./prisma');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/auth', require('./routes/auth'));
app.use('/goals', require('./routes/goals'));
app.use('/plans', require('./routes/plans'));
app.use('/sessions', require('./routes/sessions'));
app.use('/reminders', require('./routes/reminders'));
app.use('/dashboard', require('./routes/dashboard'));

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