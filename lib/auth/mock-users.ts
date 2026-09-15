import "server-only";

import type { User } from "@/lib/types";

/**
 * Usuarios de prueba para `AUTH_MODE=mock`.
 *
 * Cuando el backend real esté listo, cambia AUTH_MODE=api en el .env y este
 * archivo deja de usarse: el login se delega a `POST {API_URL}/auth/login`.
 */
export interface MockUser extends User {
  password: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: "usr_001",
    name: "Gabriel Ángel",
    email: "admin@hospeda.com",
    password: "Hospeda2026",
    role: "admin",
    avatarUrl: null,
  },
  {
    id: "usr_002",
    name: "Lucía Martínez",
    email: "anfitrion@hospeda.com",
    password: "Hospeda2026",
    role: "host",
    avatarUrl: null,
  },
];

export function findMockUser(email: string, password: string): User | null {
  const match = MOCK_USERS.find(
    (user) =>
      user.email.toLowerCase() === email.trim().toLowerCase() &&
      user.password === password,
  );
  if (!match) return null;

  const { password: _password, ...user } = match;
  void _password;
  return user;
}
