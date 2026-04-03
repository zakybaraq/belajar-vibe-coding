import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { userRoute } from './routes/user-route';

const app = new Elysia()
  .use(cors())
  .use(userRoute)
  .get('/', () => 'Hello World!')
  .listen(process.env.PORT || 3000);

console.log(`Server running at ${app.server?.url}`);

export { app };