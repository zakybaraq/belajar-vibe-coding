import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { users } from './db/schema';
import { db } from './db';
import { eq } from 'drizzle-orm';

const app = new Elysia()
  .use(cors())
  .get('/', () => 'Hello World!')
  .listen(process.env.PORT || 3000);

console.log(`Server running at ${app.server?.url}`);

app.post('/users', async ({ body, set }) => {
  try {
    const { username, email, password } = body as { username: string; email: string; password: string };
    
    if (!username || !email || !password) {
      set.status = 400;
      return { error: 'Username, email, and password are required' };
    }

    const [user] = await db.insert(users).values({ username, email, password }).returning();
    set.status = 201;
    return user;
  } catch (error: any) {
    set.status = 500;
    return { error: error.message };
  }
});

app.get('/users', async () => {
  try {
    const allUsers = await db.select().from(users);
    return allUsers;
  } catch (error: any) {
    return { error: error.message };
  }
});

app.get('/users/:id', async ({ params, set }) => {
  try {
    const id = Number(params.id);
    const [user] = await db.select().from(users).where(eq(users.id, id));
    
    if (!user) {
      set.status = 404;
      return { error: 'User not found' };
    }
    
    return user;
  } catch (error: any) {
    set.status = 500;
    return { error: error.message };
  }
});

app.put('/users/:id', async ({ params, body, set }) => {
  try {
    const id = Number(params.id);
    const { username, email, password } = body as { username?: string; email?: string; password?: string };
    
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) {
      set.status = 404;
      return { error: 'User not found' };
    }

    const [updated] = await db.update(users)
      .set({ username, email, password })
      .where(eq(users.id, id))
      .returning();
    
    return updated;
  } catch (error: any) {
    set.status = 500;
    return { error: error.message };
  }
});

app.delete('/users/:id', async ({ params, set }) => {
  try {
    const id = Number(params.id);
    
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) {
      set.status = 404;
      return { error: 'User not found' };
    }

    await db.delete(users).where(eq(users.id, id));
    set.status = 204;
    return { message: 'User deleted successfully' };
  } catch (error: any) {
    set.status = 500;
    return { error: error.message };
  }
});

export { app };
