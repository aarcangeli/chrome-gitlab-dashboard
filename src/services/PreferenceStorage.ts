const K_HOST = "host";
const K_TOKEN = "accessToken";
const K_CURRENT_USER_ID = "currentUserId";

export class PreferenceStorage {
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
}
