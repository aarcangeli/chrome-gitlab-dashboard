const K_HOST = "host";
const K_TOKEN = "accessToken";
const K_CURRENT_USER_ID = "currentUserId";

export class CacheKey<T> {
  public readonly key: string;
  public readonly defaultValue: string;

  constructor(key: string, defaultValue: T) {
    this.key = `cache-${key}`;
    this.defaultValue = JSON.stringify(defaultValue);
  }

  toString(): string {
    return this.key;
  }
}

export class PersistentStorage {
  private readonly storage: Storage = window.localStorage;

  getAccessToken(): string {
    return this.storage.getItem(K_TOKEN);
  }

  init(host: string, accessToken: string, currentUserId: number): void {
    this.storage.setItem(K_HOST, host || "gitlab.com");
    this.storage.setItem(K_TOKEN, accessToken);
    this.storage.setItem(K_CURRENT_USER_ID, String(currentUserId));
  }

  isAccessTokenSet(): boolean {
    return Boolean(this.getAccessToken());
  }

  getHost(): string {
    return this.storage.getItem(K_HOST) || "gitlab.com";
  }

  getCurrentUserId(): number {
    return Number(this.storage.getItem(K_CURRENT_USER_ID));
  }

  getCache<T>(key: CacheKey<T>): T {
    return JSON.parse(this.storage.getItem(key.toString()) || key.defaultValue);
  }

  setCache<T>(key: CacheKey<T>, value: T): void {
    this.storage.setItem(key.toString(), JSON.stringify(value));
  }

  getFlag(key: string, defaultValue: boolean): boolean {
    const value = this.storage.getItem(key);
    return value === null ? defaultValue : value === "true";
  }

  setFlag(key: string, value: boolean): void {
    this.storage.setItem(key, String(value));
  }
}
