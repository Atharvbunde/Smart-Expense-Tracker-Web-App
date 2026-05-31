import React from "react";
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { api } from '../services/api.js';

export default function Dashboard() {
  const [data, setData] = useState(null);
  async function load() { setData(await api('/dashboard')); }
  useEffect(() => { load(); }, []);
  if (!data) return <p>Loading dashboard...</p>;
  return <>
    <h1>Dashboard</h1>
    <p className="muted">Monthly financial overview, budget alerts and spending charts.</p>
    <section className="cards">
      <div className="card"><span>Total Income</span><h2>₹{data.income}</h2></div>
      <div className="card"><span>Total Expense</span><h2>₹{data.expense}</h2></div>
      <div className="card"><span>Balance</span><h2>₹{data.balance}</h2></div>
      <div className="card"><span>Month</span><h2>{data.month}</h2></div>
    </section>
    <section className="grid2">
      <div className="panel"><h3>Category-wise Spending</h3>
        {data.categoryTotals.length ? <ResponsiveContainer height={280}><PieChart><Pie data={data.categoryTotals} dataKey="amount" nameKey="category" outerRadius={95} label>{data.categoryTotals.map((_, i)=><Cell key={i}/>)}</Pie><Tooltip /></PieChart></ResponsiveContainer> : <p>No expenses yet.</p>}
      </div>
      <div className="panel"><h3>Daily Cashflow</h3>
        {data.daily.length ? <ResponsiveContainer height={280}><BarChart data={data.daily}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="date"/><YAxis/><Tooltip/><Bar dataKey="income"/><Bar dataKey="expense"/></BarChart></ResponsiveContainer> : <p>No daily data yet.</p>}
      </div>
    </section>
    <section className="panel"><h3>Budget Alerts</h3>
      {data.budgets.length === 0 && <p>No budget set. Add one from Budgets page.</p>}
      {data.budgets.map(b => <div className="budget-row" key={b.id}>
        <strong>{b.category}</strong><span>Spent ₹{b.spent} / Limit ₹{b.limit}</span><progress value={Math.min(b.percent,100)} max="100" />
        <b className={b.alert ? 'danger' : 'ok'}>{b.alert ? 'Limit crossed!' : `${b.percent}% used`}</b>
      </div>)}
    </section>
  </>;
}
