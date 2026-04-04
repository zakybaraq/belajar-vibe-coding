# Bug: Validasi Input Registration

## Deskripsi
Saat user daftar dengan nama lebih dari 255 karakter, API mengembalikan error message yang tidak jelas: "Failed query". User tidak tahu mengapa gagal.

---

## Masalah

### Sekarang
- POST /api/users tidak ada validasi panjang input
- Kalau nama > 255 karakter, error dari database: "Failed query"
- User bingung karena tidak tahu max panjang nama

### Seharusnya
- Validasi di service sebelum insert ke database
- Error message yang jelas: "Nama tidak boleh lebih dari 255 karakter"

---

## Struktur Folder

```
src/
├── services/
│   └── user-service.ts
```

---

## Langkah-Langkah Perbaikan

### Langkah 1: Tambah Validasi di Service
Buka `src/services/user-service.ts`, ubah method `daftar`:

```typescript
async daftar(name: string, email: string, password: string) {
  // Validasi panjang nama
  if (name.length > 255) {
    return { berhasil: false, pesan: 'Nama tidak boleh lebih dari 255 karakter' };
  }

  // Validasi panjang password (nanti bisa disesuaikan)
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
```

---

## Cara Testing

```bash
# Nama > 255 karakter (harus gagal dengan pesan jelas)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"a...a (256 karakter)","email":"test@test.com","password":"rahasia"}'

# Response harus:
{"error":"Nama tidak boleh lebih dari 255 karakter"}
```

---

## Catatan

1. **Validasi di service** — lebih aman dari validasi di route
2. **Password validation** — sambil tambahkan juga validasi password minimal
3. **Email validation** — format email bisa ditambahkan (nanti)
4. **Cleanup** — hapus komentar dalam bahasa asing di code