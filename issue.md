# Feature: Swagger Documentation

## Goal
Tambah dokumentasi API menggunakan Swagger/OpenAPI agar user lain mudah melihat dan mengetes API.

---

## Yang Perlu Dibuat

### 1. Install Swagger Plugin untuk ElysiaJS
ElysiaJS punya plugin resmi untuk Swagger. Tinggal install dan configure.

---

## Langkah-Langkah Pengerjaan

### Langkah 1: Install Plugin
Install package `@elysiajs/swagger`:
```bash
bun add @elysiajs/swagger
```

### Langkah 2: Konfigurasi Swagger di Server
Buka `src/index.ts`, tambah konfigurasi:

```typescript
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import { swagger } from '@elysiajs/swagger';
import { userRoute } from './routes/user-route';

const app = new Elysia()
  .use(cors())
  .use(swagger({
    documentation: {
      info: {
        title: 'Vibe Coding API',
        version: '1.0.0',
        description: 'API untuk autentikasi user'
      },
      tags: [
        { name: 'Users', description: 'User management endpoints' }
      ]
    }
  }))
  .use(staticPlugin({
    assets: 'src/public',
    prefix: '/'
  }))
  .use(userRoute)
  .get('/', ({ redirect }) => redirect('/login.html'))
  .listen(process.env.PORT || 3000);

console.log(`Server running at ${app.server?.url}`);

export { app };
```

### Langkah 3: Akses Swagger
Setelah di-restart, buka:
```
http://localhost:3000/swagger
```

---

## Cara Testing

1. Run server: `bun run dev`
2. Buka browser: `http://localhost:3000/swagger`
3. Harus muncul halaman Swagger UI dengan semua endpoint

---

## Catatan

1. **Auto-generated** — Swagger plugin会自动 baca semua route yang ada
2. **Grup endpoint** — Bisa tambah tag untuk grouping
3. **Tidak perlu manual** — Semua endpoint yang ada di `userRoute`会自动 muncul
4. **Deskripsi** — Bisa tambah deskripsi per endpoint di route handler (nanti)
