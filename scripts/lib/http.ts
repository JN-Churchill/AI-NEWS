// HTTP 头必须是纯 ASCII，中文会导致 ByteString 编码失败
const USER_AGENT = "ai-daily-bot/1.0 (+https://github.com/ai-daily; daily AI digest aggregator)";

export interface FetchOptions {
  timeoutMs?: number;
  retries?: number;
  headers?: Record<string, string>;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 带超时与指数退避重试的文本抓取 */
export async function fetchText(url: string, options: FetchOptions = {}): Promise<string> {
  const { timeoutMs = 15_000, retries = 2, headers = {} } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "*/*", ...headers },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(500 * 2 ** attempt);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export async function fetchJson<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const text = await fetchText(url, {
    ...options,
    headers: { Accept: "application/json", ...(options.headers ?? {}) },
  });
  return JSON.parse(text) as T;
}
