# Vibe Coding - User Authentication API

REST API untuk autentikasi user dengan fitur registrasi, login, logout, dan manajemen session.

---

## Tech Stack

- **Runtime:** Bun
- **Framework:** ElysiaJS
- **Database:** MySQL
- **ORM:** Drizzle
- **Testing:** Bun Test

---

## Library yang Digunakan

| Library | Fungsi |
|---------|--------|
| elysia | HTTP Framework |
| drizzle-orm | ORM untuk MySQL |
| mysql2 | MySQL driver |
| bcrypt | Password hashing |
| uuid | Token generation |
| @elysiajs/cors | CORS middleware |
| @elysiajs/static | Static file serving |
| drizzle-kit | Database migrations |

---

## Struktur Folder

```
src/
├── index.ts              # Entry point server
├── db/
│   ├── index.ts          # Database connection
│   └── schema.ts         # Schema definition
├── routes/
│   └── user-route.ts    # API route definitions
├── services/
│   └── user-service.ts  # Business logic
└── public/              # Static files (HTML, CSS)
    ├── login.html
    ├── register.html
    ├── dashboard.html
    └── style.css

tests/
├── helpers.ts           # Helper functions for testing
└── user.test.ts         # Unit tests
```

---

## Database Schema

### Table: users

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT |
| name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| password | VARCHAR(255) | NOT NULL (bcrypt hash) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### Table: sessions

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT |
| token | VARCHAR(255) | NOT NULL (UUID) |
| user_id | INT | FOREIGN KEY → users.id |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

## API Endpoints

### 1. POST /api/users
Registrasi user baru.

**Request:**
```json
{
  "name": "eko",
  "email": "eko@localhost",
  "password": "rahasia"
}
```

**Response Success (201):**
```json
{
  "data": "OK"
}
```

**Response Error:**
```json
{
  "error": "email sudah terdaftar"
}
```

---

### 2. POST /api/users/login
Login user.

**Request:**
```json
{
  "email": "eko@localhost",
  "password": "rahasia"
}
```

**Response Success (200):**
```json
{
  "data": "uuid-token"
}
```

**Response Error:**
```json
{
  "error": "email atau password salah"
}
```

---

### 3. GET /api/users/current
Ambil data user yang sedang login.

**Header:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
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

**Response Error:**
```json
{
  "error": "Unauthorized"
}
```

---

### 4. DELETE /api/users/logout
Logout user.

**Header:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "data": "OK"
}
```

**Response Error:**
```json
{
  "error": "Unauthorized"
}
```

---

## Cara Setup Project

### 1. Install Dependencies
```bash
bun install
```

### 2. Setup Environment Variables
Edit file `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=belajar_vibe_coding
PORT=3000
```

### 3. Buat Database
```bash
mysql -uroot -p -e "CREATE DATABASE belajar_vibe_coding"
```

### 4. Sync Schema ke Database
```bash
bun run db:push
```

---

## Cara Run Aplikasi

### Development
```bash
bun run dev
# atau
bun run src/index.ts
```

### Production
```bash
bun run build
bun run start
```

Server akan berjalan di `http://localhost:3000`

---

## Cara Test Aplikasi

### Manual Test dengan curl

```bash
# Registrasi
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"eko","email":"eko@localhost","password":"rahasia"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"eko@localhost","password":"rahasia"}' | jq -r '.data')

# Get Current User
curl -X GET http://localhost:3000/api/users/current \
  -H "Authorization: Bearer $TOKEN"

# Logout
curl -X DELETE http://localhost:3000/api/users/logout \
  -H "Authorization: Bearer $TOKEN"
```

### Unit Tests
```bash
bun test
```

---

## Cara Build

```bash
bun run build
```

Build output akan ada di folder `dist/`.

---

## Catatan

- Password disimpan dalam bentuk bcrypt hash (tidak pernah plain text)
- Session token menggunakan UUID untuk keamanan
- Semua error response menggunakan format `{"error": "message"}`
- Semua success response menggunakan format `{"data": "value"}`
