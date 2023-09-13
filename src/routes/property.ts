import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { Clerk } from '@clerk/backend';

const property = new Hono();
const prisma = new PrismaClient();
const clerk = Clerk({ apiKey: process.env.CLERK_API_KEY });

// Get all properties
property.get('/', async (c) => {
  try {
    const properties = await prisma.property.findMany();
    return c.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return c.text('Internal Server Error', 500);
  }
});

// Get a single property
property.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const property = await prisma.property.findUnique({
    where: { id },
  });

  if (property === null) {
    return c.notFound();
  }

  return c.json(property);
});

// Create a property
property.post('/', async (c) => {
  const data = await c.req.json();

  const {
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
  } = data;

  if (
    !createdBy ||
    !imageUrls ||
    !title ||
    !description ||
    price === undefined ||
    numberOfBeds === undefined ||
    numberOfBaths === undefined ||
    !sqft === undefined ||
    !propertyType ||
    isFeatured === undefined ||
    isActive === undefined ||
    isSold === undefined
  ) {
    return c.text('All fields must be provided', 400);
  }

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
});

// Update a property by ID
property.put('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const data = await c.req.json();

  const {
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
  } = data;

  if (
    !createdBy ||
    !imageUrls ||
    !title ||
    !description ||
    price === undefined ||
    numberOfBeds === undefined ||
    numberOfBaths === undefined ||
    !sqft ||
    !propertyType ||
    isFeatured === undefined ||
    isActive === undefined ||
    isSold === undefined
  ) {
    return c.text('All fields must be provided', 400);
  }

  const property = await prisma.property.update({
    where: { id },
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
});

// Delete a property by ID
property.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));

  // Check if property exists before deleting
  const existingProperty = await prisma.property.findUnique({
    where: { id },
  });

  if (existingProperty === null) {
    return c.notFound();
  }

  await prisma.property.delete({
    where: { id },
  });

  return c.text('Property deleted successfully');
});

export default property;
