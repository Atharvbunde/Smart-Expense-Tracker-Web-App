import React from "react";
import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
const cats = ['Food','Rent','Travel','Shopping','Bills','Education','Other'];

export default function Budgets() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ category: 'Food', month: new Date().toISOString().slice(0,7), limit: '' });
  async function load() { setItems(await api('/budgets')); }
  useEffect(() => { load(); }, []);
  async function save(e) { e.preventDefault(); await api('/budgets', { method:'POST', body: JSON.stringify(form) }); setForm({...form, limit:''}); load(); }
  async function remove(id) { await api(`/budgets/${id}`, { method:'DELETE' }); load(); }
  return <>
    <h1>Budgets</h1><p className="muted">Set category-wise monthly budget limits and see alerts on dashboard.</p>
    <form className="panel form horizontal" onSubmit={save}>
      <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{cats.map(c=><option key={c}>{c}</option>)}</select>
      <input type="month" value={form.month} onChange={e=>setForm({...form,month:e.target.value})}/>
      <input type="number" placeholder="Budget limit" value={form.limit} onChange={e=>setForm({...form,limit:e.target.value})}/>
      <button>Save Budget</button>
    </form>
    <section className="panel"><h3>Saved Budgets</h3><div className="table-wrap"><table><thead><tr><th>Month</th><th>Category</th><th>Limit</th><th>Action</th></tr></thead><tbody>
      {items.map(b => <tr key={b.id}><td>{b.month}</td><td>{b.category}</td><td>₹{b.limit}</td><td><button className="small danger-btn" onClick={()=>remove(b.id)}>Delete</button></td></tr>)}
    </tbody></table></div></section>
  </>;
}
