import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import property from './routes/property';

const app = new Hono();
const port = process.env.PORT || 8080;

app.use(
  '/*',
  cors({
    origin:
      process.env.APP_ENV === 'production'
        ? 'app.com'
        : 'http://localhost:3000',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);

app.use(logger());

app.route('/properties', property);

console.log(`Server listening on port ${port}`);

export default {
  port: port,
  fetch: app.fetch,
};
