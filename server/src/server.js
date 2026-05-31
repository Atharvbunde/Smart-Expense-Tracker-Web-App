require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const { readDb, writeDb } = require('./db');
const { createToken, authRequired } = require('./auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());

const categories = ['Food', 'Rent', 'Travel', 'Shopping', 'Bills', 'Education', 'Salary', 'Freelance', 'Other'];
function autoCategory(text = '', type = 'expense') {
  const d = text.toLowerCase();
  if (type === 'income') return d.includes('freelance') ? 'Freelance' : 'Salary';
  if (d.includes('rent') || d.includes('room')) return 'Rent';
  if (d.includes('zomato') || d.includes('food') || d.includes('cafe') || d.includes('swiggy')) return 'Food';
  if (d.includes('bus') || d.includes('train') || d.includes('uber') || d.includes('travel')) return 'Travel';
  if (d.includes('amazon') || d.includes('flipkart') || d.includes('shop')) return 'Shopping';
  if (d.includes('bill') || d.includes('electric') || d.includes('wifi')) return 'Bills';
  if (d.includes('college') || d.includes('book') || d.includes('course')) return 'Education';
  return 'Other';
}
function currentMonthKey(date = new Date()) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function cleanUser(user) {
  const { password, ...safe } = user;
  return safe;
}

app.get('/', (req, res) => res.json({ message: 'Smart Expense Tracker API running' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    const db = readDb();
    const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return res.status(409).json({ message: 'Email already registered' });
    const user = { id: uuid(), name, email: email.toLowerCase(), password: await bcrypt.hash(password, 10), createdAt: new Date().toISOString() };
    db.users.push(user);
    writeDb(db);
    res.json({ user: cleanUser(user), token: createToken(user) });
  } catch (error) {
    res.status(500).json({ message: 'Register failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const db = readDb();
  const user = db.users.find(u => u.email.toLowerCase() === String(email || '').toLowerCase());
  if (!user || !(await bcrypt.compare(password || '', user.password))) return res.status(401).json({ message: 'Invalid email or password' });
  res.json({ user: cleanUser(user), token: createToken(user) });
});

app.get('/api/profile', authRequired, (req, res) => {
  const db = readDb();
  const user = db.users.find(u => u.id === req.user.id);
  res.json({ user: cleanUser(user) });
});

app.get('/api/categories', authRequired, (req, res) => res.json(categories));

app.get('/api/transactions', authRequired, (req, res) => {
  const db = readDb();
  const { category, type, search } = req.query;
  let items = db.transactions.filter(t => t.userId === req.user.id);
  if (category && category !== 'All') items = items.filter(t => t.category === category);
  if (type && type !== 'All') items = items.filter(t => t.type === type);
  if (search) items = items.filter(t => (t.description || '').toLowerCase().includes(String(search).toLowerCase()));
  items.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(items);
});

app.post('/api/transactions', authRequired, (req, res) => {
  const { type, amount, category, description, date } = req.body;
  if (!['income', 'expense'].includes(type)) return res.status(400).json({ message: 'Type must be income or expense' });
  const value = Number(amount);
  if (!value || value <= 0) return res.status(400).json({ message: 'Amount must be greater than 0' });
  const transaction = {
    id: uuid(),
    userId: req.user.id,
    type,
    amount: value,
    category: category || autoCategory(description, type),
    description: description || '',
    date: date || new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString()
  };
  const db = readDb();
  db.transactions.push(transaction);
  writeDb(db);
  res.status(201).json(transaction);
});

app.put('/api/transactions/:id', authRequired, (req, res) => {
  const db = readDb();
  const index = db.transactions.findIndex(t => t.id === req.params.id && t.userId === req.user.id);
  if (index === -1) return res.status(404).json({ message: 'Transaction not found' });
  const old = db.transactions[index];
  db.transactions[index] = { ...old, ...req.body, amount: Number(req.body.amount || old.amount), updatedAt: new Date().toISOString() };
  writeDb(db);
  res.json(db.transactions[index]);
});

app.delete('/api/transactions/:id', authRequired, (req, res) => {
  const db = readDb();
  const before = db.transactions.length;
  db.transactions = db.transactions.filter(t => !(t.id === req.params.id && t.userId === req.user.id));
  if (db.transactions.length === before) return res.status(404).json({ message: 'Transaction not found' });
  writeDb(db);
  res.json({ message: 'Deleted successfully' });
});

app.get('/api/budgets', authRequired, (req, res) => {
  const db = readDb();
  res.json(db.budgets.filter(b => b.userId === req.user.id));
});

app.post('/api/budgets', authRequired, (req, res) => {
  const { category, month, limit } = req.body;
  const value = Number(limit);
  if (!category || !value || value <= 0) return res.status(400).json({ message: 'Category and valid limit are required' });
  const db = readDb();
  const item = { id: uuid(), userId: req.user.id, category, month: month || currentMonthKey(), limit: value };
  db.budgets = db.budgets.filter(b => !(b.userId === req.user.id && b.category === item.category && b.month === item.month));
  db.budgets.push(item);
  writeDb(db);
  res.status(201).json(item);
});

app.delete('/api/budgets/:id', authRequired, (req, res) => {
  const db = readDb();
  db.budgets = db.budgets.filter(b => !(b.id === req.params.id && b.userId === req.user.id));
  writeDb(db);
  res.json({ message: 'Budget removed' });
});

app.get('/api/dashboard', authRequired, (req, res) => {
  const db = readDb();
  const month = req.query.month || currentMonthKey();
  const txns = db.transactions.filter(t => t.userId === req.user.id && String(t.date).startsWith(month));
  const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const expense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const categoryTotals = categories.map(category => ({
    category,
    amount: txns.filter(t => t.type === 'expense' && t.category === category).reduce((s, t) => s + Number(t.amount), 0)
  })).filter(x => x.amount > 0);
  const daily = {};
  txns.forEach(t => {
    daily[t.date] = daily[t.date] || { date: t.date, income: 0, expense: 0 };
    daily[t.date][t.type] += Number(t.amount);
  });
  const budgets = db.budgets.filter(b => b.userId === req.user.id && b.month === month).map(b => {
    const spent = txns.filter(t => t.type === 'expense' && t.category === b.category).reduce((s, t) => s + Number(t.amount), 0);
    return { ...b, spent, remaining: b.limit - spent, percent: Math.round((spent / b.limit) * 100), alert: spent >= b.limit };
  });
  res.json({ month, income, expense, balance: income - expense, categoryTotals, daily: Object.values(daily).sort((a,b)=>a.date.localeCompare(b.date)), budgets, recent: txns.slice(-5).reverse() });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
