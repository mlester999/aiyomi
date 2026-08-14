import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createAdminSupabaseClient } from "@/lib/supabase/server";

export class AdminDataError extends Error {
  constructor(message = "The requested admin data is unavailable.") {
    super(message);
    this.name = "AdminDataError";
  }
}

type RpcResult = Promise<{
  data: unknown;
  error: { message: string } | null;
}>;

interface RpcCapableClient {
  rpc: (name: string, args?: Record<string, unknown>) => RpcResult;
}

const asRpcClient = (client: SupabaseClient) =>
  client as unknown as RpcCapableClient;

export const callAdminRpc = async (
  name: string,
  args?: Record<string, unknown>,
) => {
  const client = await createAdminSupabaseClient();
  const { data, error } = await asRpcClient(client).rpc(name, args);

  if (error) {
    console.error("Admin RPC failed", { operation: name, message: error.message });
    throw new AdminDataError();
  }

  return data;
};

export const callAdminRpcWithClient = async (
  client: SupabaseClient,
  name: string,
  args?: Record<string, unknown>,
) => {
  const { data, error } = await asRpcClient(client).rpc(name, args);

  if (error) {
    console.error("Admin RPC failed", { operation: name, message: error.message });
    throw new AdminDataError();
  }

  return data;
};
