import React from "react";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setToken } from '../services/api.js';

export default function Login() {
  const [form, setForm] = useState({ email: 'demo@gmail.com', password: '123456' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  async function submit(e) {
    e.preventDefault(); setError('');
    try { const data = await api('/auth/login', { method: 'POST', body: JSON.stringify(form) }); setToken(data.token); navigate('/'); }
    catch (err) { setError(err.message); }
  }
  return <div className="auth-page"><form className="auth-card" onSubmit={submit}>
    <h1>Login</h1><p>Demo: demo@gmail.com / 123456</p>
    {error && <div className="error">{error}</div>}
    <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
    <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
    <button>Login</button>
    <span>New user? <Link to="/register">Create account</Link></span>
  </form></div>;
}
