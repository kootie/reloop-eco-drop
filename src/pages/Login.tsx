import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Login({ onLogin, onRegister }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^\d{10,}$/.test(phone)) {
      setError('Enter a valid phone number');
      return;
    }
    // Simulate login
    onLogin({ id: `user-${phone.slice(-4)}`, phone_hash: phone });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="tel"
            className="w-full border rounded p-2"
            placeholder="Phone number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          {error && <div className="text-destructive text-sm">{error}</div>}
          <Button type="submit" variant="eco" className="w-full">Login</Button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-muted-foreground">No account?</span>
          <Button variant="link" className="ml-2" onClick={onRegister}>Register</Button>
        </div>
      </Card>
    </div>
  );
} 