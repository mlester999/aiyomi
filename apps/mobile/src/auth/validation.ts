export const PASSWORD_MIN_LENGTH = 12;

export interface AuthValidationResult {
  email?: string;
  password?: string;
  confirmation?: string;
}

export const validateEmail = (email: string): string | undefined => {
  const normalized = email.trim();
  if (!normalized || normalized.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return "Enter a valid email address.";
  }
  return undefined;
};

export const validatePassword = (password: string): string | undefined =>
  password.length < PASSWORD_MIN_LENGTH
    ? `Use at least ${PASSWORD_MIN_LENGTH} characters.`
    : undefined;

export const validateSignUp = (
  email: string,
  password: string,
  confirmation: string,
): AuthValidationResult => ({
  email: validateEmail(email),
  password: validatePassword(password),
  confirmation:
    password !== confirmation ? "Passwords need to match." : undefined,
});
