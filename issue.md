# Feature: Form Pendaftaran User

## Deskripsi
Buat halaman form untuk daftar user baru. Simpan data user ke database.

---

## Yang Perlu Dibuat

### 1. Tabel Database
Nama tabel: `users`

Kolom:
- `id` — angka, otomatis naik sendiri
- `name` — teks, wajib diisi
- `email` — teks, wajib diisi, tidak boleh sama dengan user lain
- `password` — teks, wajib diisi, nanti diacak dulu sebelum disimpan
- `created_at` — tanggal dan jam, otomatis terisi

---

### 2. Endpoint API

**URL:** `POST /api/users`

**Request (yang dikirim):**
```json
{
  "name": "eko",
  "email": "eko@localhost",
  "password": "rahasia"
}
```

**Response Kalau Berhasil:**
```json
{
  "data": "OK"
}
```

**Response Kalau Email Sudah Ada:**
```json
{
  "error": "email sudah terdaftar"
}
```

---

## Struktur Folder

```
src/
├── routes/          # Tempat simpan routing API
│   └── user-route.ts
├── services/        # Tempat simpan logic bisnis
│   └── user-service.ts
└── db/             # Tempat simpan koneksi dan schema database
```

---

## Langkah-Langkah Pengerjaan

### Langkah 1: Install Bcrypt
Bcrypt itu工具 untuk mengacak password. Install dulu:
```bash
bun add bcrypt
```

### Langkah 2: Ubah Schema Database
Buka `src/db/schema.ts`, ganti jadi:
```typescript
import { mysqlTable, varchar, int, timestamp } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### Langkah 3: Buat Service
Buat file `src/services/user-service.ts`:

```typescript
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

class UserService {
  async daftar(name: string, email: string, password: string) {
    // Cek apakah email sudah terdaftar
    const userSudahAda = await db.select().from(users).where(eq(users.email, email));
    if (userSudahAda.length > 0) {
      return { berhasil: false, pesan: 'email sudah terdaftar' };
    }

    // Acak password pakai bcrypt
    const passwordDiacak = await bcrypt.hash(password, 10);

    // Simpan ke database
    await db.insert(users).values({
      name: name,
      email: email,
      password: passwordDiacak,
    });

    return { berhasil: true };
  }
}

export const userService = new UserService();
```

### Langkah 4: Buat Route
Buat file `src/routes/user-route.ts`:

```typescript
import { Elysia } from 'elysia';

export const userRoute = new Elysia()
  .post('/api/users', async ({ body, set }) => {
    const { name, email, password } = body as {
      name: string;
      email: string;
      password: string;
    };

    // Validasi sederhana
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
```

Tambah import di atas:
```typescript
import { userService } from '../services/user-service';
```

### Langkah 5: Pasang Route ke Server
Buka `src/index.ts`, tambah import dan use:

```typescript
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { userRoute } from './routes/user-route';

const app = new Elysia()
  .use(cors())
  .use(userRoute)
  .listen(process.env.PORT || 3000);

console.log(`Server running at ${app.server?.url}`);
```

### Langkah 6: Sync Database
Jalankan ini untuk buat tabel di database:
```bash
bun run db:push
```

---

## Cara Testing

Pakai curl:
```bash
# Daftar user baru
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"eko","email":"eko@localhost","password":"rahasia"}'

# Coba daftar lagi dengan email yang sama
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"eko","email":"eko@localhost","password":"rahasia"}'
```

---

## Catatan Penting

1. **Password jangan disimpan mentah** — selalu pakai bcrypt untuk mengacak
2. **bcrypt.hash()** — untuk menyimpan password
3. **bcrypt.compare()** — untuk verifikasi password saat login (nanti)
4. **Salt rounds = 10** — itu angka standar, aman dan tidak lambat
5. **Email harus unik** — kalau sama, tolak dengan pesan "email sudah terdaftar"
