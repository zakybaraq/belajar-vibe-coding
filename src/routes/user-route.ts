import { Elysia } from 'elysia';
import { userService } from '../services/user-service';

export const userRoute = new Elysia()
  .post('/api/users', async ({ body, set }) => {
    const { name, email, password } = body as {
      name: string;
      email: string;
      password: string;
    };

    if (!name || !email || !password) {
      set.status = 400;
      return { error: 'isi semua field' };
    }

    const hasil = await userService.daftar(name, email, password);

    if (!hasil.berhasil) {
      set.status = 409;
      return { error: hasil.pesan };
    }

    set.status = 201;
    return { data: 'OK' };
  });