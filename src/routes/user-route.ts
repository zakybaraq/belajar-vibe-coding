import { Elysia } from 'elysia';
import { userService } from '../services/user-service';

export const userRoute = new Elysia()
  .post('/api/users', async ({ body, set }) => {
    const { name, email, password } = body as {
      name: string;
      email: string;
      password: string;
    };

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
  }, {
    detail: {
      tags: ['Users'],
      summary: 'Register new user',
      description: 'Mendaftarkan user baru ke sistem',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'eko' },
                email: { type: 'string', example: 'eko@localhost' },
                password: { type: 'string', example: 'rahasia' }
              },
              required: ['name', 'email', 'password']
            }
          }
        }
      },
      responses: {
        201: {
          description: 'User registered successfully',
          content: {
            'application/json': {
              example: { data: 'OK' }
            }
          }
        },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              example: { error: 'isi semua field' }
            }
          }
        },
        409: {
          description: 'Email already registered',
          content: {
            'application/json': {
              example: { error: 'email sudah terdaftar' }
            }
          }
        }
      }
    }
  })
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
  }, {
    detail: {
      tags: ['Users'],
      summary: 'User login',
      description: 'Login user dan mendapatkan token',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string', example: 'eko@localhost' },
                password: { type: 'string', example: 'rahasia' }
              },
              required: ['email', 'password']
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              example: { data: 'uuid-token-disini' }
            }
          }
        },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              example: { error: 'isi semua field' }
            }
          }
        },
        401: {
          description: 'Invalid credentials',
          content: {
            'application/json': {
              example: { error: 'email atau password salah' }
            }
          }
        }
      }
    }
  })
  .get('/api/users/current', async ({ headers, set }) => {
    const authHeader = headers['authorization'] as string;
    
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
  }, {
    detail: {
      tags: ['Users'],
      summary: 'Get current user',
      description: 'Ambil data user yang sedang login',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              example: { data: { id: 1, name: 'eko', email: 'eko@localhost', createdAt: '2026-04-03T12:00:00.000Z' } }
            }
          }
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              example: { error: 'Unauthorized' }
            }
          }
        }
      }
    }
  })
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
  }, {
    detail: {
      tags: ['Users'],
      summary: 'User logout',
      description: 'Logout user dan hapus session',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Logout successful',
          content: {
            'application/json': {
              example: { data: 'OK' }
            }
          }
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              example: { error: 'Unauthorized' }
            }
          }
        }
      }
    }
  });