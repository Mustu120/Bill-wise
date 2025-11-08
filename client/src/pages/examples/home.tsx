import { useEffect } from 'react';
import HomePage from '../home';

export default function HomePageExample() {
  useEffect(() => {
    localStorage.setItem('mockUser', JSON.stringify({
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Project Manager'
    }));
  }, []);

  return <HomePage />;
}
