let pendingVerificationEmail: string | null = null;

export const rememberPendingVerificationEmail = (email: string): void => {
  pendingVerificationEmail = email.trim().toLocaleLowerCase("en-US");
};

export const readPendingVerificationEmail = (): string | null =>
  pendingVerificationEmail;

export const clearPendingVerificationEmail = (): void => {
  pendingVerificationEmail = null;
};
