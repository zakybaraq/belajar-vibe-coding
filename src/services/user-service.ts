import { db } from '../db';
import { users, sessions } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

class UserService {
  async daftar(name: string, email: string, password: string) {
    const userSudahAda = await db.select().from(users).where(eq(users.email, email));
    if (userSudahAda.length > 0) {
      return { berhasil: false, pesan: 'email sudah terdaftar' };
    }

    const passwordDiacak = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      name,
      email,
      password: passwordDiacak,
    });

    return { berhasil: true };
  }

  async login(email: string, password: string) {
    const user = await db.select().from(users).where(eq(users.email, email));
    if (user.length === 0) {
      return { berhasil: false, pesan: 'email atau password salah' };
    }

    const passwordCocok = await bcrypt.compare(password, user[0].password);
    if (!passwordCocok) {
      return { berhasil: false, pesan: 'email atau password salah' };
    }

    const token = uuidv4();

    await db.insert(sessions).values({
      token: token,
      userId: user[0].id,
    });

    return { berhasil: true, token };
  }

  async getCurrentUser(token: string) {
    const session = await db.select().from(sessions).where(eq(sessions.token, token));
    if (session.length === 0) {
      return { berhasil: false };
    }

    const user = await db.select().from(users).where(eq(users.id, session[0].userId));
    if (user.length === 0) {
      return { berhasil: false };
    }

    return {
      berhasil: true,
      user: {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        createdAt: user[0].createdAt,
      }
    };
  }

  async logout(token: string) {
    const session = await db.select().from(sessions).where(eq(sessions.token, token));
    if (session.length === 0) {
      return { berhasil: false };
    }

    await db.delete(sessions).where(eq(sessions.token, token));

    return { berhasil: true };
  }
}

export const userService = new UserService();