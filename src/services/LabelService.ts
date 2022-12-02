import { CacheKey, PersistentStorage } from "@src/services/PersistentStorage";
import { GitLabApi, Label } from "@src/services/GitLabApi";

interface ProjectLabels {
  projectId: number;
  labels: Label[];
  lastUpdated: number;
}

const CACHE_KEY = new CacheKey<ProjectLabels[]>("labels", []);
const TIMEOUT_LABELS = 1000 * 60 * 60 * 10; // 10 minutes

export class LabelService {
  private pendingLabels = new Map<string, Promise<Label[]>>();

  constructor(private readonly api: GitLabApi, private readonly storage: PersistentStorage) {
    storage.getCache(CACHE_KEY);
  }

  public async getLabelColor(projectId: number, labelName: string): Promise<string> {
    // first check if we have the labels in cache
    let projectLabels = this.storage.getCache(CACHE_KEY).find((projectLabels) => projectLabels.projectId === projectId);
    if (!projectLabels || projectLabels.lastUpdated < Date.now() - TIMEOUT_LABELS) {
      // find in pending requests, or create a new one
      let pending = this.pendingLabels.get(projectId.toString());
      if (!pending) {
        pending = this.api.getProjectLabels(projectId, 1, 1000);
        this.pendingLabels.set(projectId.toString(), pending);
      }

      // load labels
      const allLabels = await pending;
      projectLabels = { labels: allLabels, projectId, lastUpdated: Date.now() };

      // update cache
      this.cacheValue(projectLabels);
    }

    return projectLabels.labels.find((label) => label.name === labelName)?.color ?? "";
  }

  private cacheValue(projectLabels: ProjectLabels) {
    const cache = this.storage.getCache(CACHE_KEY);
    const index = cache.findIndex((projectLabels) => projectLabels.projectId === projectLabels.projectId);
    if (index >= 0) {
      cache[index] = projectLabels;
    } else {
      cache.push(projectLabels);
    }
    this.storage.setCache(CACHE_KEY, cache);
  }
}
