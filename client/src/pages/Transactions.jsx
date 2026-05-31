import React from "react";
import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

const cats = ['Food','Rent','Travel','Shopping','Bills','Education','Salary','Freelance','Other'];

export default function Transactions() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All');
  const [editing, setEditing] = useState(null);
  const empty = { type: 'expense', amount: '', category: 'Food', description: '', date: new Date().toISOString().slice(0,10) };
  const [form, setForm] = useState(empty);
  async function load() { setItems(await api(`/transactions?category=${filter}`)); }
  useEffect(() => { load(); }, [filter]);
  async function save(e) {
    e.preventDefault();
    if (editing) await api(`/transactions/${editing}`, { method: 'PUT', body: JSON.stringify(form) });
    else await api('/transactions', { method: 'POST', body: JSON.stringify(form) });
    setEditing(null); setForm(empty); load();
  }
  function edit(t) { setEditing(t.id); setForm({ type:t.type, amount:t.amount, category:t.category, description:t.description, date:t.date }); }
  async function remove(id) { if (confirm('Delete this transaction?')) { await api(`/transactions/${id}`, { method:'DELETE' }); load(); } }
  return <>
    <h1>Transactions</h1><p className="muted">Add income/expense, auto/manual category, edit, delete and filter transactions.</p>
    <section className="grid2">
      <form className="panel form" onSubmit={save}><h3>{editing ? 'Edit Transaction' : 'Add Transaction'}</h3>
        <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="expense">Expense</option><option value="income">Income</option></select>
        <input type="number" placeholder="Amount" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/>
        <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{cats.map(c=><option key={c}>{c}</option>)}</select>
        <input placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
        <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
        <button>{editing ? 'Update' : 'Save'}</button>
        {editing && <button type="button" className="secondary" onClick={()=>{setEditing(null);setForm(empty)}}>Cancel</button>}
      </form>
      <div className="panel"><h3>Filter</h3><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option>{cats.map(c=><option key={c}>{c}</option>)}</select></div>
    </section>
    <section className="panel"><h3>Transaction List</h3><div className="table-wrap"><table><thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th>Amount</th><th>Action</th></tr></thead><tbody>
      {items.map(t => <tr key={t.id}><td>{t.date}</td><td>{t.type}</td><td>{t.category}</td><td>{t.description}</td><td>₹{t.amount}</td><td><button className="small" onClick={()=>edit(t)}>Edit</button><button className="small danger-btn" onClick={()=>remove(t.id)}>Delete</button></td></tr>)}
    </tbody></table></div></section>
  </>;
}
