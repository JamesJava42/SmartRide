export type AppRole = "driver" | "admin" | "rider";

export type AuthUser = {
  id: string;
  user_id: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone_number: string;
  role: AppRole;
};

export type AuthResponse = {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user: AuthUser;
};

export type RegistrationRegion = {
  id: string;
  name: string;
  city?: string | null;
  state?: string | null;
};
