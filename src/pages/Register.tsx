import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Register({ onRegister, onLogin }) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!/^\d{10,}$/.test(phone)) {
      setError('Enter a valid phone number');
      return;
    }
    // Simulate registration
    onRegister({ id: `user-${phone.slice(-4)}`, phone_hash: phone, name });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Phone Number</label>
            <input
              type="tel"
              className="w-full border rounded px-3 py-2"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="e.g. 0712345678"
              required
            />
          </div>
          {error && <div className="text-destructive text-sm">{error}</div>}
          <Button type="submit" className="w-full">Register</Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <button className="text-primary underline" onClick={onLogin}>Login</button>
        </div>
      </Card>
    </div>
  );
} 