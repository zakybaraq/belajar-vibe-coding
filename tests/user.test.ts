import { describe, it, expect, beforeEach } from 'bun:test';
import { cleanup, registerUser, loginUser, getCurrentUser, logoutUser } from './helpers';

const BASE_URL = 'http://localhost:3000';

describe('User API', () => {
  beforeEach(async () => {
    await cleanup();
  });

  describe('POST /api/users', () => {
    it('should register new user successfully', async () => {
      const res = await registerUser('test', 'test@test.com', 'password123');
      const data = await res.json();
      expect(res.status).toBe(201);
      expect(data.data).toBe('OK');
    });

    it('should fail with duplicate email', async () => {
      await registerUser('test', 'test@test.com', 'password123');
      const res = await registerUser('test2', 'test@test.com', 'password123');
      const data = await res.json();
      expect(res.status).toBe(409);
      expect(data.error).toBe('email sudah terdaftar');
    });

    it('should fail with empty name', async () => {
      const res = await registerUser('', 'test@test.com', 'password123');
      const data = await res.json();
      expect(res.status).toBe(400);
    });

    it('should fail with empty email', async () => {
      const res = await registerUser('test', '', 'password123');
      const data = await res.json();
      expect(res.status).toBe(400);
    });

    it('should fail with empty password', async () => {
      const res = await registerUser('test', 'test@test.com', '');
      const data = await res.json();
      expect(res.status).toBe(400);
    });

    it('should fail with name > 255 characters', async () => {
      const longName = 'a'.repeat(256);
      const res = await registerUser(longName, 'longname@test.com', 'password123');
      const data = await res.json();
      expect([400, 409]).toContain(res.status);
      expect(data.error).toBe('Nama tidak boleh lebih dari 255 karakter');
    });

    it('should fail with password < 6 characters', async () => {
      const res = await registerUser('test', 'shortpass@test.com', 'abc');
      const data = await res.json();
      expect([400, 409]).toContain(res.status);
      expect(data.error).toBe('Password minimal 6 karakter');
    });
  });

  describe('POST /api/users/login', () => {
    it('should login successfully with correct credentials', async () => {
      await registerUser('test', 'test@test.com', 'password123');
      const res = await loginUser('test@test.com', 'password123');
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.data).toBeDefined();
    });

    it('should fail with unregistered email', async () => {
      const res = await loginUser('notexist@test.com', 'password123');
      const data = await res.json();
      expect(res.status).toBe(401);
      expect(data.error).toBe('email atau password salah');
    });

    it('should fail with wrong password', async () => {
      await registerUser('test', 'test@test.com', 'password123');
      const res = await loginUser('test@test.com', 'wrongpassword');
      const data = await res.json();
      expect(res.status).toBe(401);
      expect(data.error).toBe('email atau password salah');
    });

    it('should fail with empty email', async () => {
      const res = await loginUser('', 'password123');
      const data = await res.json();
      expect(res.status).toBe(400);
    });

    it('should fail with empty password', async () => {
      const res = await loginUser('test@test.com', '');
      const data = await res.json();
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/users/current', () => {
    it('should get current user with valid token', async () => {
      await registerUser('test', 'test@test.com', 'password123');
      const loginRes = await loginUser('test@test.com', 'password123');
      const loginData = await loginRes.json();
      const token = loginData.data;

      const res = await getCurrentUser(token);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.data.name).toBe('test');
      expect(data.data.email).toBe('test@test.com');
    });

    it('should fail without token header', async () => {
      const res = await fetch(`${BASE_URL}/api/users/current`);
      const data = await res.json();
      expect(res.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should fail with invalid token', async () => {
      const res = await getCurrentUser('invalid-token');
      const data = await res.json();
      expect(res.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should fail after logout', async () => {
      await registerUser('test', 'test@test.com', 'password123');
      const loginRes = await loginUser('test@test.com', 'password123');
      const loginData = await loginRes.json();
      const token = loginData.data;

      await logoutUser(token);

      const res = await getCurrentUser(token);
      const data = await res.json();
      expect(res.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('DELETE /api/users/logout', () => {
    it('should logout successfully with valid token', async () => {
      await registerUser('test', 'test@test.com', 'password123');
      const loginRes = await loginUser('test@test.com', 'password123');
      const loginData = await loginRes.json();
      const token = loginData.data;

      const res = await logoutUser(token);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.data).toBe('OK');
    });

    it('should fail without token header', async () => {
      const res = await fetch(`${BASE_URL}/api/users/logout`, { method: 'DELETE' });
      const data = await res.json();
      expect(res.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should fail with invalid token', async () => {
      const res = await logoutUser('invalid-token');
      const data = await res.json();
      expect(res.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should fail after logout (login -> logout -> get current)', async () => {
      await registerUser('test', 'test@test.com', 'password123');
      const loginRes = await loginUser('test@test.com', 'password123');
      const loginData = await loginRes.json();
      const token = loginData.data;

      await logoutUser(token);

      const res = await getCurrentUser(token);
      const data = await res.json();
      expect(res.status).toBe(401);
    });
  });
});
