# Feature: Login User

## Deskripsi
Buat sistem login user. Kalau email dan password benar, kasih token UUID.

---

## Yang Perlu Dibuat

### 1. Tabel Database
Nama tabel: `sessions`

Kolom:
- `id` — angka, otomatis naik sendiri
- `token` — teks UUID, wajib diisi
- `user_id` — angka, ambil dari tabel users
- `created_at` — tanggal dan jam, otomatis terisi

---

### 2. Endpoint API

**URL:** `POST /api/users/login`

**Request (yang dikirim):**
```json
{
  "email": "eko@localhost",
  "password": "rahasia"
}
```

**Response Kalau Berhasil:**
```json
{
  "data": "token-yang-dihasilkan"
}
```

**Response Kalau Salah:**
```json
{
  "error": "email atau password salah"
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

### Langkah 1: Install UUID
UUID itu alat untuk buat token unik. Install dulu:
```bash
bun add uuid
@types/uuid
```

### Langkah 2: Tambah Schema Sessions
Buka `src/db/schema.ts`, tambah ini:
```typescript
import { mysqlTable, varchar, int, timestamp, serial } from 'drizzle-orm/mysql-core';

export const sessions = mysqlTable('sessions', {
  id: serial('id').autoincrement().primaryKey(),
  token: varchar('token', { length: 255 }).notNull(),
  userId: int('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### Langkah 3: Tambah Method Login di Service
Buka `src/services/user-service.ts`, tambah method:

```typescript
import { v4 as uuidv4 } from 'uuid';

class UserService {
  async login(email: string, password: string) {
    // Cari user berdasarkan email
    const user = await db.select().from(users).where(eq(users.email, email));
    if (user.length === 0) {
      return { berhasil: false, pesan: 'email atau password salah' };
    }

    // Cek password pakai bcrypt
    const passwordCocok = await bcrypt.compare(password, user[0].password);
    if (!passwordCocok) {
      return { berhasil: false, pesan: 'email atau password salah' };
    }

    // Buat token UUID
    const token = uuidv4();

    // Simpan ke tabel sessions
    await db.insert(sessions).values({
      token: token,
      userId: user[0].id,
    });

    return { berhasil: true, token };
  }
}
```

### Langkah 4: Tambah Route Login
Buka `src/routes/user-route.ts`, tambah:

```typescript
.post('/api/users/login', async ({ body, set }) => {
  const { email, password } = body as {
    email: string;
    password: string;
  };

  if (!email || !password) {
    set.status = 400;
    return { error: 'isi semua field' };
  }

  const hasil = await userService.login(email, password);

  if (!hasil.berhasil) {
    set.status = 401;
    return { error: hasil.pesan };
  }

  set.status = 200;
  return { data: hasil.token };
});
```

### Langkah 5: Sync Database
Jalankan ini untuk buat tabel di database:
```bash
bun run db:push
```

---

## Cara Testing

Pakai curl:
```bash
# Login berhasil
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"eko@localhost","password":"rahasia"}'

# Login gagal
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"eko@localhost","password":"salah"}'
```

---

## Catatan Penting

1. **bcrypt.compare()** — untuk cek password yang diinput sama hash di database
2. **UUID** — selalu generate token baru setiap login
3. **Satu user bisa banyak session** — tidak perlu hapus session lama
4. **Logout** (nanti) — hapus row di tabel sessions berdasarkan token
5. **Midtrans** (nanti) — validasi token dari header request