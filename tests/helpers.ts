import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'P@blo7272',
  database: 'belajar_vibe_coding',
});

export async function cleanup() {
  await pool.execute('DELETE FROM sessions');
  await pool.execute('DELETE FROM users');
}

export async function registerUser(name: string, email: string, password: string) {
  const res = await fetch('http://localhost:3000/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  return res;
}

export async function loginUser(email: string, password: string) {
  const res = await fetch('http://localhost:3000/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res;
}

export async function getCurrentUser(token: string) {
  const res = await fetch('http://localhost:3000/api/users/current', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res;
}

export async function logoutUser(token: string) {
  const res = await fetch('http://localhost:3000/api/users/logout', {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res;
}
