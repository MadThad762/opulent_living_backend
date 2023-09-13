import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { Clerk } from '@clerk/backend';

interface PropertyData {
  imageUrls: string[];
  title: string;
  description: string;
  price: number;
  numberOfBeds: number;
  numberOfBaths: number;
  sqft: number;
  propertyType: string;
  isFeatured: boolean;
  isActive: boolean;
  isSold: boolean;
}

const property = new Hono();
const prisma = new PrismaClient();
const clerk = Clerk({ apiKey: process.env.CLERK_API_KEY });

const validateData = (data: PropertyData) => {
  const {
    imageUrls,
    title,
    description,
    price,
    numberOfBeds,
    numberOfBaths,
    sqft,
    propertyType,
    isFeatured,
    isActive,
    isSold,
  } = data;

  if (
    !Array.isArray(imageUrls) ||
    typeof title !== 'string' ||
    typeof description !== 'string' ||
    typeof price !== 'number' ||
    typeof numberOfBeds !== 'number' ||
    typeof numberOfBaths !== 'number' ||
    typeof sqft !== 'number' ||
    typeof propertyType !== 'string' ||
    typeof isFeatured !== 'boolean' ||
    typeof isActive !== 'boolean' ||
    typeof isSold !== 'boolean'
  ) {
    return false;
  }
  return true;
};

property.get('/', async (c) => {
  try {
    const properties = await prisma.property.findMany();
    return c.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return c.text('Internal Server Error', 500);
  }
});

property.get('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (property === null) {
      return c.notFound();
    }

    return c.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    return c.text('Internal Server Error', 500);
  }
});

property.post('/', async (c) => {
  const sessionId = c.req.header('sessionId');
  const token = c.req.header('authorization');

  if (sessionId && token) {
    try {
      const session = await clerk.sessions.verifySession(sessionId, token);
      if (session && session.status === 'active') {
        const createdBy = session.userId;
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
          isFeatured,
          isActive,
          isSold,
        } = data;

        const property = await prisma.property.create({
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
            isFeatured,
            isActive,
            isSold,
          },
        });

        return c.json(property);
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

property.put('/:id', async (c) => {
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
          isFeatured,
          isActive,
          isSold,
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
            isFeatured,
            isActive,
            isSold,
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
});

property.delete('/:id', async (c) => {
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
});

export default property;
