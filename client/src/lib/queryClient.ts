import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage;
    try {
      // Try to parse error as JSON
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
    } catch (e) {
      // If not JSON, get text
      try {
        errorMessage = await res.text();
      } catch (e2) {
        errorMessage = res.statusText;
      }
    }
    
    // Create user-friendly error message
    if (res.status === 401) {
      throw new Error("You are not authorized. Please log in again.");
    } else if (res.status === 403) {
      throw new Error("You don't have permission to perform this action.");
    } else if (res.status === 404) {
      throw new Error("The requested resource was not found.");
    } else if (res.status === 400) {
      throw new Error(`Invalid request: ${errorMessage}`);
    } else if (res.status >= 500) {
      throw new Error("Server error. Please try again later.");
    } else {
      throw new Error(`${res.status}: ${errorMessage}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
