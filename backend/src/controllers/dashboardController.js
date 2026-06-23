const prisma = require('../prisma');

exports.getDashboard = async (req, res) => {
    const userId = req.user.userId;

    const [goals, sessions] = await Promise.all([
        prisma.learningGoal.findMany({ where: { userId } }),
        prisma.studySession.findMany({ where: { userId, duration: { not: null } } })
    ]);

    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);

    const progress = goals.map(goal => {
        const goalMinutes = sessions
            .filter(s => s.goalId === goal.id)
            .reduce((sum, s) => sum + s.duration, 0);
        return {
            goalId: goal.id,
            title: goal.title,
            targetHours: goal.targetHours,
            loggedHours: Math.round(goalMinutes / 60 * 10) / 10,
            percent: Math.min(100, Math.round((goalMinutes / 60 / goal.targetHours) * 100))
        };
    });

    res.json({ totalHours: Math.round(totalMinutes / 60 * 10) / 10, progress });
};
