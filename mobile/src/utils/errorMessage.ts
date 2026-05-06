function toAlertString(value: unknown, fallback: string): string {
  if (value == null || value === '') {
    return fallback;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    const parts = value
      .filter((v) => v != null && String(v).trim() !== '')
      .map((v) => String(v));
    return parts.length > 0 ? parts.join('\n') : fallback;
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }
  return String(value);
}

/**
 * Unifica Axios (Nest ValidationPipe suele mandar message: string | string[])
 * y errores JS para mostrarlos en Alert.alert en Android (solo string en el mensaje).
 */
export function formatErrorForAlert(error: unknown, fallback: string): string {
  const err = error as {
    response?: { data?: { message?: unknown } };
    message?: unknown;
  };
  const fromApi = err?.response?.data?.message;
  if (fromApi !== undefined && fromApi !== null && fromApi !== '') {
    return toAlertString(fromApi, fallback);
  }
  const direct = err?.message !== undefined && err?.message !== null ? err.message : error;
  return toAlertString(direct, fallback);
}
