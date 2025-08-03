interface ApiError extends Error {
  status?: number;
  data?: any;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`http://localhost:3000${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: ApiError = new Error('API request failed');
      error.status = response.status;
      error.data = await response.json().catch(() => null);
      throw error;
    }

    return response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      status: (error as ApiError).status,
      data: (error as ApiError).data,
    });
    throw error;
  }
}