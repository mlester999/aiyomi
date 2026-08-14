import * as SecureStore from "expo-secure-store";

const CHUNK_SIZE = 1_800;
const MANIFEST_SUFFIX = ".manifest";

const chunkKey = (key: string, index: number) => `${key}.chunk.${index}`;

const removeChunks = async (key: string, count: number) => {
  await Promise.all(
    Array.from({ length: count }, (_, index) =>
      SecureStore.deleteItemAsync(chunkKey(key, index)),
    ),
  );
};

export const secureSessionStorage = {
  async getItem(key: string): Promise<string | null> {
    const manifest = await SecureStore.getItemAsync(`${key}${MANIFEST_SUFFIX}`);
    if (!manifest) return SecureStore.getItemAsync(key);

    const count = Number.parseInt(manifest, 10);
    if (!Number.isInteger(count) || count < 1 || count > 64) return null;

    const chunks = await Promise.all(
      Array.from({ length: count }, (_, index) =>
        SecureStore.getItemAsync(chunkKey(key, index)),
      ),
    );

    return chunks.every((chunk): chunk is string => chunk !== null)
      ? chunks.join("")
      : null;
  },

  async setItem(key: string, value: string): Promise<void> {
    const previousManifest = await SecureStore.getItemAsync(
      `${key}${MANIFEST_SUFFIX}`,
    );
    const previousCount = Number.parseInt(previousManifest ?? "0", 10) || 0;
    const chunks = value.match(new RegExp(`.{1,${CHUNK_SIZE}}`, "gs")) ?? [""];

    await Promise.all(
      chunks.map((chunk, index) =>
        SecureStore.setItemAsync(chunkKey(key, index), chunk),
      ),
    );
    await SecureStore.setItemAsync(
      `${key}${MANIFEST_SUFFIX}`,
      String(chunks.length),
    );
    await SecureStore.deleteItemAsync(key);

    if (previousCount > chunks.length) {
      await Promise.all(
        Array.from(
          { length: previousCount - chunks.length },
          (_, offset) =>
            SecureStore.deleteItemAsync(chunkKey(key, chunks.length + offset)),
        ),
      );
    }
  },

  async removeItem(key: string): Promise<void> {
    const manifest = await SecureStore.getItemAsync(`${key}${MANIFEST_SUFFIX}`);
    const count = Number.parseInt(manifest ?? "0", 10) || 0;

    await Promise.all([
      SecureStore.deleteItemAsync(key),
      SecureStore.deleteItemAsync(`${key}${MANIFEST_SUFFIX}`),
      removeChunks(key, count),
    ]);
  },
};
