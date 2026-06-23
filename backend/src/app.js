require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/auth', require('./routes/auth'));
app.use('/goals', require('./routes/goals'));
app.use('/plans', require('./routes/plans'));
app.use('sessions', require('./routes/sessions'));
app.use('/reminders', require('./routes/reminders'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend läuft auf http://localhost:${PORT}`));