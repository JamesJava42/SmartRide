export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  rider_id: string;
  full_name: string;
  email: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  role: "RIDER";
}

export interface RegisterResponse {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
  created_at: string;
}

export class AuthApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}
