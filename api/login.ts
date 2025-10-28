
import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../lib/prisma';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    // In a real app, you should hash passwords and compare the hash.
    // Here we compare plain text as per the initial setup.
    // FIX: Use snake_case 'password_hash' to match the database schema.
    if (user && (user as any).password_hash.trim() === password.trim()) {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
