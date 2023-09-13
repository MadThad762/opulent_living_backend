import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { Clerk } from '@clerk/backend';

const property = new Hono();
const prisma = new PrismaClient();
const clerk = Clerk({ apiKey: process.env.CLERK_API_KEY });

// Get all properties
property.get('/', async (c) => {
  const sessionId = c.req.header('sessionId');
  const token = c.req.header('authorization');

  if (sessionId && token) {
    try {
      const session = await clerk.sessions.verifySession(sessionId, token);
      if (session && session.status === 'active') {
        const properties = await prisma.property.findMany();
        return c.json(properties);
      } else {
        return c.text('Unauthorized', 401);
      }
    } catch (error) {
      console.log('Session verification failed:', error);
      return c.text('Unauthorized', 401);
    }
  } else {
    console.log('Unauthorized');
    return c.text('Unauthorized', 401);
  }
});

// session object
/* {
    id: "sess_2VBuZgxBYLJ1kltsX9Xlr40tx5W",
    clientId: "client_2VBuZiOtAW7XzpZJhHlaeFaLaHB",
    userId: "user_2UiyqYgulfvD1l794Ca1Q8Sk53U",
    status: "active",
    lastActiveAt: 1694419572282,
    expireAt: 1694926651459,
    abandonAt: 1696913851459,
    createdAt: 1694321851459,
    updatedAt: 1694568378823
  } */
