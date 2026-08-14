export const signOutAfterDeviceCleanup = async <Result>(
  cleanupDeviceRegistration: () => Promise<void>,
  signOutLocally: () => Promise<Result>,
): Promise<Result> => {
  await cleanupDeviceRegistration();
  return signOutLocally();
};
