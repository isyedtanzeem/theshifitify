/**
 * Safely parse JSON from a fetch Response, avoiding "Unexpected token" errors
 * if the server returns HTML (e.g. 404, 500, or proxy error pages).
 */
export async function safeJsonResponse<T = any>(
  response: Response,
  fallbackErrorMessage = 'Unexpected response received from server'
): Promise<{ success: boolean; data?: T; error?: string; status: number }> {
  const status = response.status;
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      const json = await response.json();
      return {
        success: response.ok,
        data: json,
        error: !response.ok ? (json?.error || json?.message || fallbackErrorMessage) : undefined,
        status,
      };
    } catch (parseErr: any) {
      return {
        success: false,
        error: `Failed to parse response: ${parseErr.message}`,
        status,
      };
    }
  }

  // Handle non-JSON responses (HTML error pages, plain text)
  try {
    const rawText = await response.text();
    if (status === 404) {
      return {
        success: false,
        error: 'API endpoint not found (404). Please check deployment routing.',
        status,
      };
    }
    if (status >= 500) {
      return {
        success: false,
        error: 'Server is currently experiencing an error. Please try again later.',
        status,
      };
    }
    return {
      success: false,
      error: rawText.slice(0, 150) || fallbackErrorMessage,
      status,
    };
  } catch {
    return {
      success: false,
      error: fallbackErrorMessage,
      status,
    };
  }
}
