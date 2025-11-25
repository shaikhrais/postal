import React, { useState } from 'react';

export default function Home() {
  const [form, setForm] = useState({ from: 'sender@example.com', to: 'you@example.com', subject: 'Hello', body: 'This is a demo' });
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('http://localhost:3000/api/v2/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      setResult(`status=${res.status}\n` + JSON.stringify(json, null, 2));
    } catch (err) {
      setResult('network error: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, Arial', maxWidth: 720, margin: '32px auto' }}>
      <h1>Postal v2 — Demo UI</h1>
      <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
        <label>
          From
          <input value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} />
        </label>
        <label>
          To
          <input value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} />
        </label>
        <label>
          Subject
          <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        </label>
        <label>
          Body
          <textarea rows={6} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </label>
        <button disabled={loading} type="submit" style={{ padding: '8px 12px' }}>{loading ? 'Sending…' : 'Send'}</button>
      </form>

      <h2>Result</h2>
      <pre style={{ background: '#f6f6f8', padding: 12 }}>{result || '(no attempts yet)'}</pre>
    </div>
  );
}
