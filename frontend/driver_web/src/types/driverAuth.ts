export interface DriverLoginPayload {
  email: string;
  password: string;
}

export interface DriverLoginResponse {
  access_token: string;
  token_type: string;
  driver_id: string;
  full_name: string;
  email: string;
}

export interface DriverRegisterPayload {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  region_id: string;
  role: "DRIVER";
}

export interface DriverRegisterResponse {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
  created_at: string;
}

export class DriverAuthApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "DriverAuthApiError";
    this.status = status;
  }
}
