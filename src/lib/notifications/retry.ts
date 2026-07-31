/**
 * إعادة محاولة بتراجع أسّي — لأخطاء الشبكة و 5xx فقط.
 * أخطاء 4xx خطأ في الطلب نفسه ولا تُصلحها إعادة المحاولة (SPEC §7.3).
 */
export class RetryableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RetryableError'
  }
}

const DELAYS_MS = [1000, 4000, 9000]

export async function withRetry<T>(
  operation: () => Promise<T>,
  { attempts = 3, delays = DELAYS_MS }: { attempts?: number; delays?: number[] } = {},
): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      const retryable = error instanceof RetryableError
      const isLast = attempt === attempts - 1

      if (!retryable || isLast) throw error

      await new Promise((resolve) => setTimeout(resolve, delays[attempt] ?? 1000))
    }
  }

  throw lastError
}

/** 5xx و 429 قابلة لإعادة المحاولة، وما دونها ليس كذلك. */
export function classifyHttpStatus(status: number, body: string): Error {
  if (status >= 500 || status === 429) {
    return new RetryableError(`HTTP ${status}: ${body.slice(0, 200)}`)
  }

  return new Error(`HTTP ${status}: ${body.slice(0, 200)}`)
}
