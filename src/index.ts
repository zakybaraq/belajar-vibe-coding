import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import { swagger } from '@elysiajs/swagger';
import { userRoute } from './routes/user-route';

const app = new Elysia()
  .use(cors())
  .use(swagger({
    documentation: {
      info: {
        title: 'Vibe Coding API',
        version: '1.0.0',
        description: 'API untuk autentikasi user'
      },
      tags: [
        { name: 'Users', description: 'User management endpoints' }
      ]
    }
  }))
  .use(staticPlugin({
    assets: 'src/public',
    prefix: '/'
  }))
  .use(userRoute)
  .get('/', ({ redirect }) => redirect('/login.html'))
  .listen(process.env.PORT || 3000);

console.log(`Server running at ${app.server?.url}`);

export { app };