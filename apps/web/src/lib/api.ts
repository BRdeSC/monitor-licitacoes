const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3334/api';

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    cache: 'no-store', // Revalidação dinâmica instantânea
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Envia cookies HTTPOnly de sessão JWT automaticamente
  });

  if (response.status === 401 && typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
    throw new Error('Sessão expirada. Redirecionando...');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.erro || 'Falha na comunicação com o servidor.');
  }

  return data;
}
