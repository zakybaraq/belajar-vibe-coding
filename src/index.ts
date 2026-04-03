import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import { userRoute } from './routes/user-route';

const app = new Elysia()
  .use(cors())
  .use(staticPlugin({
    assets: 'src/public',
    prefix: '/'
  }))
  .use(userRoute)
  .get('/', ({ redirect }) => redirect('/login.html'))
  .listen(process.env.PORT || 3000);

console.log(`Server running at ${app.server?.url}`);

export { app };