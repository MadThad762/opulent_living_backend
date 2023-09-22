import { Hono } from 'hono';
import { Clerk } from '@clerk/backend';
import { db } from '../lib/db';
import { property } from '../../.drizzle/schema';
import { eq } from 'drizzle-orm';
import { File } from 'buffer';
import { uploadFile, deleteFile, getObjectSignedUrl } from '../lib/aws/s3';
import { v4 as uuidv4 } from 'uuid';

const propertyRoutes = new Hono();
const clerk = Clerk({ apiKey: process.env.CLERK_API_KEY });

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
propertyRoutes.post('/', async (c) => {
  const sessionId = c.req.header('sessionId');
  const token = c.req.header('authorization');

  if (sessionId && token) {
    try {
      const session = await clerk.sessions.verifySession(sessionId, token);
      if (session && session.status === 'active') {
        const createdBy = session.userId;
        const formData = await c.req.formData();

        const imageUrls = formData.get('imageUrls');

        if (imageUrls instanceof File) {
          const buffer = await imageUrls.arrayBuffer();
          const nodeBuffer = Buffer.from(buffer);
          const imageName = uuidv4();
          await uploadFile(nodeBuffer, imageName, imageUrls.type);

          console.log('Image uploaded successfully');
        } else {
          return c.text('No file uploaded', 400);
        }

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

export default propertyRoutes;
