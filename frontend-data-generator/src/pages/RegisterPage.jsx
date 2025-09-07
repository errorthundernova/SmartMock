import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('DEBUG: "Create Account" button clicked. Attempting to register with email:', email);

    try {
      const response = await fetch('http://127.0.0.1:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('DEBUG: Received response from server with status:', response.status, response.statusText);

      if (response.ok) {
        console.log('DEBUG: Registration successful! Navigating to login.');
        navigate('/login');
      } else {
        const errorData = await response.json();
        console.error('DEBUG: Registration failed with error from server:', errorData);
        setError(errorData.detail || 'Registration failed.');
      }
    } catch (err) {
      console.error('DEBUG: A network or CORS error occurred during registration:', err);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-sm bg-gray-900 border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Register</CardTitle>
          <CardDescription>Create a new account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-gray-800 border-gray-700"/>
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-gray-800 border-gray-700"/>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full">Create Account</Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account? <Link to="/login" className="underline">Login</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;