import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';

const property = new Hono();
const prisma = new PrismaClient();

// Get all properties
property.get('/', async (c) => {
  const properties = await prisma.property.findMany();
  return c.json(properties);
});

// Get a single property
property.get('/:id', async (c) => {
  const id = c.req.param('id');
  const property = await prisma.property.findUnique({
    where: { id: Number(id) },
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
    images,
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
    !images ||
    !title ||
    !description ||
    !price ||
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
      images,
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
    images,
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
    !images ||
    !title ||
    !description ||
    !price ||
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
      images,
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
    return c.text('Property not found', 404);
  }

  await prisma.property.delete({
    where: { id },
  });

  return c.text('Property deleted successfully');
});

export default property;
