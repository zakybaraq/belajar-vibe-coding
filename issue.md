# Feature: Get Current User

## Deskripsi
Ambil data user yang sedang login berdasarkan token dari header Authorization.

---

## Endpoint API

**URL:** `GET /api/users/current`

**Header:**
```
Authorization: Bearer <token>
```

**Response Kalau Berhasil:**
```json
{
  "data": {
    "id": 1,
    "name": "eko",
    "email": "eko@localhost",
    "created_at": "2026-04-03T12:00:00.000Z"
  }
}
```

**Response Kalau Gagal:**
```json
{
  "error": "Unauthorized"
}
```

---

## Struktur Folder

```
src/
├── routes/
│   └── user-route.ts
└── services/
    └── user-service.ts
```

---

## Langkah-Langkah Pengerjaan

### Langkah 1: Tambah Method getCurrentUser di Service
Buka `src/services/user-service.ts`, tambah method:

```typescript
async getCurrentUser(token: string) {
  // Cari token di tabel sessions
  const session = await db.select().from(sessions).where(eq(sessions.token, token));
  if (session.length === 0) {
    return { berhasil: false };
  }

  // Ambil data user berdasarkan user_id
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
```

### Langkah 2: Tambah Route Get Current User
Buka `src/routes/user-route.ts`, tambah:

```typescript
.get('/api/users/current', async ({ headers, set }) => {
  const authHeader = headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    set.status = 401;
    return { error: 'Unauthorized' };
  }

  const token = authHeader.replace('Bearer ', '');
  const hasil = await userService.getCurrentUser(token);

  if (!hasil.berhasil) {
    set.status = 401;
    return { error: 'Unauthorized' };
  }

  set.status = 200;
  return { data: hasil.user };
});
```

---

## Cara Testing

Pakai curl:
```bash
# Login dulu dapat token
TOKEN=$(curl -s -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"eko@localhost","password":"rahasia"}' | jq -r '.data')

# Get current user
curl -X GET http://localhost:3000/api/users/current \
  -H "Authorization: Bearer $TOKEN"

# Tanpa token (harus gagal)
curl -X GET http://localhost:3000/api/users/current
```

---

## Catatan Penting

1. **Authorization header** — format: "Bearer <token>"
2. **Cari di sessions table** — bukan langsung dari token ambil user
3. **401 status** — untuk unauthorized access
4. **401 vs 403** — 401 = tidak ada token/salah token, 403 = tidak punya izin (nanti)
5. **Token expired** (nanti) — cek created_at di sessions tabel