# Feature: Logout User

## Deskripsi
Hapus session user yang sedang login baseado token dari header Authorization.

---

## Endpoint API

**URL:** `DELETE /api/users/logout`

**Header:**
```
Authorization: Bearer <token>
```

**Response Kalau Berhasil:**
```json
{
  "data": "OK"
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

### Langkah 1: Tambah Method logout di Service
Buka `src/services/user-service.ts`, tambah method:

```typescript
async logout(token: string) {
  // Cari token di tabel sessions
  const session = await db.select().from(sessions).where(eq(sessions.token, token));
  if (session.length === 0) {
    return { berhasil: false };
  }

  // Hapus session
  await db.delete(sessions).where(eq(sessions.token, token));

  return { berhasil: true };
}
```

### Langkah 2: Tambah Route Logout
Buka `src/routes/user-route.ts`, tambah:

```typescript
.delete('/api/users/logout', async ({ headers, set }) => {
  const authHeader = headers['authorization'] as string;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    set.status = 401;
    return { error: 'Unauthorized' };
  }

  const token = authHeader.replace('Bearer ', '');
  const hasil = await userService.logout(token);

  if (!hasil.berhasil) {
    set.status = 401;
    return { error: 'Unauthorized' };
  }

  set.status = 200;
  return { data: 'OK' };
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

# Logout
curl -X DELETE http://localhost:3000/api/users/logout \
  -H "Authorization: Bearer $TOKEN"

# Coba get current user (harus gagal karena sudah logout)
curl -X GET http://localhost:3000/api/users/current \
  -H "Authorization: Bearer $TOKEN"
```

---

## Catatan Penting

1. **Hapus dari sessions table** — bukan dari users table
2. **Satu token satu session** — hapus berdasarkan token saja
3. **Setelah logout** — token tidak bisa digunakan lagi
4. **Multiple sessions** — user bisa punya banyak token, logout hanya hapus yang ini
5. **Auto logout** (nanti) — hapus session yang sudah lama (nanti cek created_at)