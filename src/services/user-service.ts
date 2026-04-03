import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

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
}

export const userService = new UserService();