require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const { writeDb } = require('./db');

async function seed() {
  const userId = uuid();
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const sample = {
    users: [{ id: userId, name: 'Demo Student', email: 'demo@gmail.com', password: await bcrypt.hash('123456', 10), createdAt: new Date().toISOString() }],
    transactions: [
      { id: uuid(), userId, type: 'income', amount: 15000, category: 'Salary', description: 'Monthly pocket money', date: `${y}-${m}-01`, createdAt: new Date().toISOString() },
      { id: uuid(), userId, type: 'income', amount: 5000, category: 'Freelance', description: 'Freelance website work', date: `${y}-${m}-05`, createdAt: new Date().toISOString() },
      { id: uuid(), userId, type: 'expense', amount: 2200, category: 'Food', description: 'Food and snacks', date: `${y}-${m}-06`, createdAt: new Date().toISOString() },
      { id: uuid(), userId, type: 'expense', amount: 3000, category: 'Rent', description: 'Room rent', date: `${y}-${m}-07`, createdAt: new Date().toISOString() },
      { id: uuid(), userId, type: 'expense', amount: 900, category: 'Travel', description: 'Bus and train pass', date: `${y}-${m}-08`, createdAt: new Date().toISOString() },
      { id: uuid(), userId, type: 'expense', amount: 1400, category: 'Education', description: 'Books and course', date: `${y}-${m}-10`, createdAt: new Date().toISOString() }
    ],
    budgets: [
      { id: uuid(), userId, category: 'Food', month: `${y}-${m}`, limit: 2500 },
      { id: uuid(), userId, category: 'Travel', month: `${y}-${m}`, limit: 1000 },
      { id: uuid(), userId, category: 'Education', month: `${y}-${m}`, limit: 2000 }
    ]
  };
  writeDb(sample);
  console.log('Seed completed. Login: demo@gmail.com / 123456');
}
seed();
