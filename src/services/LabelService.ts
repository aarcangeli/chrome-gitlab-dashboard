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
  private pendingLabels = new Map<number, Promise<Label[]>>();

  constructor(private readonly api: GitLabApi, private readonly storage: PersistentStorage) {
    storage.getCache(CACHE_KEY);
  }

  public async getLabelColor(projectId: number, labelName: string): Promise<string> {
    // first check if we have the labels in cache
    let projectLabels = this.storage.getCache(CACHE_KEY).find((projectLabels) => projectLabels.projectId === projectId);
    if (!projectLabels || projectLabels.lastUpdated < Date.now() - TIMEOUT_LABELS) {
      // find in pending requests, or create a new one
      let pending = this.pendingLabels.get(projectId);
      const mustCache = !pending;
      if (!pending) {
        pending = this.loadMethods(projectId);
        this.pendingLabels.set(projectId, pending);
      }

      // load labels
      const allLabels = await pending;
      projectLabels = { labels: allLabels, projectId, lastUpdated: Date.now() };

      // update cache
      if (mustCache) {
        this.cacheValue(projectLabels);
      }
    }

    return projectLabels.labels.find((label) => label.name === labelName)?.color;
  }

  private async loadMethods(projectId: number): Promise<Label[]> {
    const allLabels: Label[] = [];
    let page = 1;
    // eslint-disable-next-line
    while (true) {
      const labels = await this.api.getProjectLabels(projectId, page, 100);
      allLabels.push(...labels);
      if (labels.length < 100) {
        break;
      }
      page++;
    }
    return allLabels;
  }

  private cacheValue(projectLabels: ProjectLabels) {
    const cache = this.storage.getCache(CACHE_KEY);
    const index = cache.findIndex((it) => projectLabels.projectId === it.projectId);
    if (index >= 0) {
      cache[index] = projectLabels;
    } else {
      cache.push(projectLabels);
    }
    this.storage.setCache(CACHE_KEY, cache);
  }
}
