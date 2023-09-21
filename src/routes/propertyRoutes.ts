import { Hono } from 'hono';
import { Clerk } from '@clerk/backend';
import { PropertyData } from '../lib/types/PropertyTypes';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../lib/db';
import { property } from '../../.drizzle/schema';
import { eq } from 'drizzle-orm';
import { File } from 'buffer';

const propertyRoutes = new Hono();
const clerk = Clerk({ apiKey: process.env.CLERK_API_KEY });

const propertySchema = z.object({
  title: z.string(),
  description: z.string(),
  imageUrls: z.any(),
  numberOfBeds: z.string(),
  numberOfBaths: z.string(),
  sqft: z.string(),
  price: z.string(),
});

// get single property (finished)
propertyRoutes.get('/', async (c) => {
  try {
    const result = await db.query.property.findMany();
    return c.json(result);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return c.text('Internal Server Error', 500);
  }
});

// get single property by id (finished)
propertyRoutes.get('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const result = await db.select().from(property).where(eq(property.id, id));

    if (result === null) {
      return c.notFound();
    }

    return c.json(result);
  } catch (error) {
    console.error('Error fetching property:', error);
    return c.text('Internal Server Error', 500);
  }
});

// create property (working on it)
propertyRoutes.post('/', zValidator('form', propertySchema), async (c) => {
  const sessionId = c.req.header('sessionId');
  const token = c.req.header('authorization');

  if (sessionId && token) {
    try {
      const session = await clerk.sessions.verifySession(sessionId, token);
      if (session && session.status === 'active') {
        const createdBy = session.userId;
        const FormData = await c.req.formData();

        /* const {
          imageUrls,
          title,
          description,
          price,
          numberOfBeds,
          numberOfBaths,
          sqft,
          propertyType,
        } = data; */

        const imageFile = 

        /* const property = await prisma.property.create({
          data: {
            createdBy,
            imageUrls,
            title,
            description,
            price,
            numberOfBeds,
            numberOfBaths,
            sqft,
            propertyType,
          },
        }); */

        /* return c.json(property); */
        return c.text('Property created successfully', 200);
      } else {
        return c.text('Unauthorized', 401);
      }
    } catch (error) {
      console.error('Error creating property:', error);
      return c.text('Internal Server Error', 500);
    }
  } else {
    return c.text('Unauthorized', 401);
  }
});

/* propertyRoutes.put('/:id', async (c) => {
  const sessionId = c.req.header('sessionId');
  const token = c.req.header('authorization');

  if (sessionId && token) {
    try {
      const session = await clerk.sessions.verifySession(sessionId, token);
      if (session && session.status === 'active') {
        const userIdFromSession = session.userId;
        const id = Number(c.req.param('id'));

        const existingProperty = await prisma.property.findUnique({
          where: { id },
        });

        if (!existingProperty) {
          return c.notFound();
        }

        if (existingProperty.createdBy !== userIdFromSession) {
          return c.text('Unauthorized to update this property', 401);
        }

        const data = await c.req.json();

        if (!validateData(data)) {
          return c.text('Invalid input data', 400);
        }

        const {
          imageUrls,
          title,
          description,
          price,
          numberOfBeds,
          numberOfBaths,
          sqft,
          propertyType,
        } = data;

        const property = await prisma.property.update({
          where: { id },
          data: {
            imageUrls,
            title,
            description,
            price,
            numberOfBeds,
            numberOfBaths,
            sqft,
            propertyType,
          },
        });

        return c.json(property);
      } else {
        return c.text('Unauthorized', 401);
      }
    } catch (error) {
      console.error('Error updating property:', error);
      return c.text('Internal Server Error', 500);
    }
  } else {
    return c.text('Unauthorized', 401);
  }
}); */

/* propertyRoutes.delete('/:id', async (c) => {
  const sessionId = c.req.header('sessionId');
  const token = c.req.header('authorization');

  if (sessionId && token) {
    try {
      const session = await clerk.sessions.verifySession(sessionId, token);
      if (session && session.status === 'active') {
        const userIdFromSession = session.userId;
        const id = Number(c.req.param('id'));

        const existingProperty = await prisma.property.findUnique({
          where: { id },
        });

        if (!existingProperty) {
          return c.notFound();
        }

        if (existingProperty.createdBy !== userIdFromSession) {
          return c.text('Unauthorized to delete this property', 401);
        }

        const property = await prisma.property.delete({
          where: { id },
        });

        return c.json(property);
      } else {
        return c.text('Unauthorized', 401);
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      return c.text('Internal Server Error', 500);
    }
  } else {
    return c.text('Unauthorized', 401);
  }
}); */

export default propertyRoutes;
