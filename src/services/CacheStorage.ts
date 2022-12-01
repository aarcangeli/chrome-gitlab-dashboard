export class CacheKey<T> {
  public defaultValue: string;

  constructor(public readonly key: string, defaultValue: T) {
    this.defaultValue = JSON.stringify(defaultValue);
  }

  toString(): string {
    return this.key;
  }
}

export class CacheStorage {
  private readonly storage: Storage = window.localStorage;

  get<T>(key: CacheKey<T>): T {
    return JSON.parse(this.storage.getItem(key.toString()) || key.defaultValue);
  }

  set<T>(key: CacheKey<T>, value: T): void {
    this.storage.setItem(key.toString(), JSON.stringify(value));
  }
}
