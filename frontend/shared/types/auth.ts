export type DriverRegistrationPayload = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export type DriverLoginPayload = {
  identifier: string;
  password: string;
};

export type AuthUser = {
  userId: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
};

export type AuthSessionResponse = {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
};

export type EmailVerificationStatusResponse = {
  emailVerified: boolean;
};

export type PhoneVerificationStatusResponse = {
  phoneVerified: boolean;
};

export type VerifyPhoneOtpPayload = {
  phone: string;
  otp: string;
};

export type ResendVerificationPayload = {
  email?: string;
  phone?: string;
};
