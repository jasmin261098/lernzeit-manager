import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';

export const register = async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({ error: 'Email und Passwort erforderlich' });

    const passwordHash = await bcrypt.hash(password, 12);
    try {
        const user = await prisma.user.create({ data: { email, passwordHash } });
        res.status(201).json({ id: user.id, email: user.email });
    } catch {
        res.status(409).json({ error: 'Email bereits vergeben' });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique( {where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
};