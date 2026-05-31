import React from "react";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setToken } from '../services/api.js';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  async function submit(e) {
    e.preventDefault(); setError('');
    try { const data = await api('/auth/register', { method: 'POST', body: JSON.stringify(form) }); setToken(data.token); navigate('/'); }
    catch (err) { setError(err.message); }
  }
  return <div className="auth-page"><form className="auth-card" onSubmit={submit}>
    <h1>Create Account</h1><p>Start tracking your money smartly.</p>
    {error && <div className="error">{error}</div>}
    <input placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
    <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
    <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
    <button>Register</button>
    <span>Already registered? <Link to="/login">Login</Link></span>
  </form></div>;
}
