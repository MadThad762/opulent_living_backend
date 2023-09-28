import { Hono } from 'hono';
import { Clerk } from '@clerk/backend';
import { db } from '../lib/db';
import { property } from '../../.drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { File } from 'buffer';
import { v4 as uuidv4 } from 'uuid';
import cloudinary from '../lib/cloudinary';

const propertyRoutes = new Hono();
const clerk = Clerk({ apiKey: process.env.CLERK_API_KEY });

// get all properties
propertyRoutes.get('/', async (c) => {
  try {
    let query = db.select().from(property);

    const isFeatured = c.req.query('isFeatured');
    if (isFeatured) {
      query = query.where(eq(property.isFeatured, isFeatured === 'true'));
    }

    const limit = c.req.query('limit');
    if (limit) {
      query = query.limit(Number(limit));
    }

    const results = await query.execute();

    return c.json(results);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return c.text('Internal Server Error', 500);
  }
});

// get all properties for a user
propertyRoutes.get('/user/:createdBy', async (c) => {
  try {
    const createdBy = c.req.param('createdBy');

    let conditions = [eq(property.createdBy, createdBy)];

    const isFeatured = c.req.query('isFeatured');
    if (isFeatured) {
      conditions.push(eq(property.isFeatured, isFeatured === 'true'));
    }

    let query = db
      .select()
      .from(property)
      .where(and(...conditions));

    const limit = c.req.query('limit');
    if (limit) {
      query = query.limit(Number(limit));
    }

    const results = await query.execute();

    return c.json(results);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return c.text('Internal Server Error', 500);
  }
});

// get single property by id
propertyRoutes.get('/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const results = await db.select().from(property).where(eq(property.id, id));

    if (Array.isArray(results) && results.length > 0) {
      return c.json(results[0]);
    } else {
      return c.notFound();
    }
  } catch (error) {
    console.error('Error fetching property:', error);
    return c.text('Internal Server Error', 500);
  }
});

// create property
propertyRoutes.post('/', async (c) => {
  const sessionId = c.req.header('sessionId');
  const token = c.req.header('authorization');

  if (sessionId && token) {
    try {
      const session = await clerk.sessions.verifySession(sessionId, token);
      if (session && session.status === 'active') {
        const formData = await c.req.formData();

        const createdBy = session.userId as string;
        const imageFile = formData.get('imageFile');
        const imageName = uuidv4();
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const propertyType = formData.get('propertyType') as string;
        const numberOfBeds = parseInt(
          formData.get('numberOfBeds') as string,
          10,
        );
        const numberOfBaths = parseInt(
          formData.get('numberOfBaths') as string,
          10,
        );
        const sqft = parseInt(formData.get('sqft') as string, 10);
        const price = parseInt(formData.get('price') as string, 10);

        if (imageFile instanceof File) {
          const buffer = await imageFile.arrayBuffer();
          const nodeBuffer = Buffer.from(buffer);

          return new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  resource_type: 'image',
                  public_id: imageName,
                  folder: 'property_listings',
                },
                async (error, result) => {
                  if (error) {
                    if (
                      error.http_code === 200 &&
                      /invalid JSON response/.test(error.message)
                    ) {
                      console.warn(
                        'Image uploaded successfully but received an unexpected response from Cloudinary. Proceeding with the given imageName.',
                      );
                      resolve(imageName);
                    } else {
                      console.error('Error uploading to Cloudinary:', error);
                      reject(new Error('Failed to upload image'));
                    }
                  } else {
                    resolve(imageName);
                  }
                },
              )
              .end(nodeBuffer);
          })
            .then(async (resolvedImageName: any) => {
              await db.insert(property).values({
                createdBy,
                title,
                description,
                imagePublicId: imageName,
                propertyType,
                numberOfBeds,
                numberOfBaths,
                sqft,
                price,
              });

              return c.json(200);
            })
            .catch((error) => {
              console.error('Error:', error.message);
              return c.text(error.message, 500);
            });
        } else {
          console.error(
            'Error creating property listing: imageUrls not instanceof File',
          );
          return c.text(
            'Failed to create property listing: imageUrls was not instanceof File',
            400,
          );
        }
      } else {
        console.error('Error creating property listing: session not active');
        return c.text('Unauthorized', 401);
      }
    } catch (error) {
      console.error('Error creating property listing:', error);
      return c.text('Internal Server Error', 500);
    }
  } else {
    console.error(
      'Error creating property listing: sessionId or token missing',
    );
    return c.text('Unauthorized', 401);
  }
});

// delete property
propertyRoutes.delete('/:id', async (c) => {
  const sessionId = c.req.header('sessionId');
  const token = c.req.header('authorization');

  if (sessionId && token) {
    try {
      const session = await clerk.sessions.verifySession(sessionId, token);
      if (session && session.status === 'active') {
        const propertyId = Number(c.req.param('id'));
        const results = await db
          .select()
          .from(property)
          .where(eq(property.id, propertyId));

        if (Array.isArray(results) && results.length === 0) {
          return c.notFound();
        }

        const listing = results[0];

        if (listing.createdBy !== session.userId) {
          return c.text('Unauthorized', 401);
        }

        // Delete the image from Cloudinary
        cloudinary.uploader.destroy(listing.imagePublicId);

        // Delete the listing from the database
        await db.delete(property).where(eq(property.id, propertyId)).execute();

        return c.json({ message: 'Listing successfully deleted.' });
      } else {
        console.error('Error deleting property listing: session not active');
        return c.text('Unauthorized', 401);
      }
    } catch (error) {
      console.error('Error deleting property listing:', error);
      return c.text('Internal Server Error', 500);
    }
  } else {
    console.error(
      'Error deleting property listing: sessionId or token missing',
    );
    return c.text('Unauthorized', 401);
  }
});

export default propertyRoutes;
