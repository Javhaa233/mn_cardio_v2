import { useQuery } from "@tanstack/react-query";

import Helper from "helper";

const normalizeBaseResponse = (res) => {
  if (!res) {
    return { success: false, data: null, message: "Алдаа гарлаа" };
  }

  if (typeof res.success === "boolean") {
    return res;
  }

  if (typeof res.Success === "boolean") {
    return {
      success: res.Success,
      data: res.Data,
      message: res.Message,
      option: res.Option,
      authError: res.AuthError,
    };
  }

  return res;
};

export const baseObjectKeys = {
  config: (objectName) => ["baseObject", "config", objectName],
  list: (objectName, searchOption) => [
    "baseObject",
    "list",
    objectName,
    searchOption,
  ],
};

export function useBaseObjectConfig(objectName, options = {}) {
  return useQuery({
    queryKey: baseObjectKeys.config(objectName),
    enabled: Boolean(objectName) && (options.enabled ?? true),
    queryFn: async () => {
      const res = await new Promise((resolve) => {
        Helper.BaseCrudHelper.GetConfigData(objectName, resolve);
      });
      const normalized = normalizeBaseResponse(res);
      if (normalized && normalized.success === false) {
        const error = new Error(normalized.message || "Алдаа гарлаа");
        error.authError = normalized.authError;
        throw error;
      }
      return normalized;
    },
    staleTime: options.staleTime ?? 10 * 60 * 1000,
    ...options,
  });
}
