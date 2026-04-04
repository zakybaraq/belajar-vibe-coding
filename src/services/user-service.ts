import { db } from '../db';
import { users, sessions } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

class UserService {
  /**
   * Mendaftarkan user baru ke sistem.
   * 
   * Validasi input:
   * - Nama tidak boleh lebih dari 255 karakter
   * - Password minimal 6 karakter
   * - Email tidak boleh sudah terdaftar
   * 
   * Password di-hash menggunakan bcrypt sebelum disimpan ke database.
   * 
   * @param name - Nama user
   * @param email - Email user (harus unik)
   * @param password - Password user (akan di-hash)
   * @returns Object dengan status berhasil dan pesan error jika gagal
   */
  async daftar(name: string, email: string, password: string) {
    if (name.length > 255) {
      return { berhasil: false, pesan: 'Nama tidak boleh lebih dari 255 karakter' };
    }

    if (password.length < 6) {
      return { berhasil: false, pesan: 'Password minimal 6 karakter' };
    }

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

  /**
   * Melakukan proses login user.
   * 
   * Proses:
   * 1. Mencari user berdasarkan email
   * 2. Memeriksa password menggunakan bcrypt.compare()
   * 3. Membuat token UUID baru untuk session
   * 4. Menyimpan session ke database
   * 
   * @param email - Email user
   * @param password - Password user
   * @returns Object dengan token jika berhasil, atau pesan error jika gagal
   */
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

  /**
   * Mengambil data user yang sedang login berdasarkan token.
   * 
   * Proses:
   * 1. Mencari session berdasarkan token
   * 2. Jika tidak ada session, return gagal
   * 3. Mengambil data user berdasarkan user_id dari session
   * 4. Mengembalikan data user (id, name, email, createdAt)
   * 
   * @param token - Token UUID dari header Authorization
   * @returns Object dengan data user jika token valid, atau gagal jika invalid
   */
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

  /**
   * Melakukan proses logout user dengan menghapus session.
   * 
   * Proses:
   * 1. Mencari session berdasarkan token
   * 2. Jika tidak ada session, return gagal
   * 3. Menghapus session dari database
   * 
   * Setelah logout, token tidak bisa digunakan lagi untuk akses API.
   * 
   * @param token - Token UUID dari header Authorization
   * @returns Object dengan status berhasil atau gagal
   */
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