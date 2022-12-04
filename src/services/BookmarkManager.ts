import { PersistentStorage } from "@src/services/PersistentStorage";

export class BookmarkManager {
  private bookmarks: string[];

  constructor(private readonly storage: PersistentStorage) {
    this.load();
  }

  isBookmarked(id: string): boolean {
    return this.bookmarks.includes(id);
  }

  setBookmarkState(id: string, state: boolean): void {
    if (state) {
      this.setBookmark(id);
    } else {
      this.removeBookmark(id);
    }
  }

  setBookmark(id: string): void {
    if (!this.isBookmarked(id)) {
      this.load();
      this.bookmarks.push(id);
      this.storage.set("bookmarks", this.bookmarks);
    }
  }

  removeBookmark(id: string): void {
    if (this.isBookmarked(id)) {
      this.load();
      this.bookmarks = this.bookmarks.filter((bookmark) => bookmark !== id);
      this.storage.set("bookmarks", this.bookmarks);
    }
  }

  private load() {
    this.bookmarks = this.storage.get("bookmarks", []);
  }
}
