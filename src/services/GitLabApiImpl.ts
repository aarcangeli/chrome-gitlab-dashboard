import { GitLabApi, GitLabApiError, GitLabUser, IssueSummary, Label, MergeRequestSummary, QueryOptions } from "@src/services/GitLabApi";
import { GitLabProject } from "@src/services/dao";

class GitLabApiImpl implements GitLabApi {
  constructor(private host: string, private privateToken: string) {}

  async projects(query: string | undefined, options: QueryOptions): Promise<GitLabProject[]> {
    return await this.invokeApi("GET", `/projects`, options.signal, {
      membership: "true",
      sort: "desc",
      order_by: "updated_at",
      search: query,
      // Pagination
      page: options.page,
      per_page: options.perPage,
    });
  }

  async issues(assigneeId: number): Promise<IssueSummary[]> {
    return await this.invokeApi("GET", `/issues`, null, {
      assignee_id: assigneeId,
      state: "opened",
      // scope is required otherwise we get only issues created by the current user
      scope: "all",
      per_page: 100,
    });
  }

  async mergeRequests(assigneeId: number): Promise<MergeRequestSummary[]> {
    return await this.invokeApi("GET", `/merge_requests`, null, {
      assignee_id: assigneeId,
      state: "opened",
      // scope is required otherwise we get only issues created by the current user
      scope: "all",
      per_page: 100,
    });
  }

  async mergeRequestsToReview(assigneeId: number): Promise<MergeRequestSummary[]> {
    return await this.invokeApi("GET", `/merge_requests`, null, {
      reviewer_id: assigneeId,
      state: "opened",
      // scope is required otherwise we get only issues created by the current user
      scope: "all",
      per_page: 100,
    });
  }

  async currentUser(): Promise<GitLabUser> {
    return this.invokeApi("GET", `/user`, null);
  }

  async getProjectLabels(projectId: number, options: QueryOptions): Promise<Label[]> {
    return await this.invokeApi("GET", `/projects/${projectId}/labels`, options.signal, {
      page: options.page,
      per_page: options.perPage,
    });
  }

  private async invokeApi(method: string, path: string, signal: AbortSignal | undefined, query: Record<string, any> = {}, body: any = {}): Promise<any> {
    console.assert(path.startsWith("/"), "Expected path to start with /");

    const url = `https://${this.host}/api/v4${path}`;
    const queryString = Object.keys(query).length > 0 ? `?${new URLSearchParams(query)}` : "";
    const isGet = method === "GET";

    const response = await fetch(url + queryString, {
      method,
      signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.privateToken}`,
      },
      body: isGet ? undefined : JSON.stringify(body),
    });
    const bodyResponse = await response.json();
    if (!response.ok) {
      throw new GitLabApiError(`Failed to invoke ${method} ${url}: ${bodyResponse.message || response.statusText}`);
    }
    return bodyResponse;
  }
}

export function makeGitLabApi(host = "gitlab.com", privateToken: string): GitLabApi {
  console.assert(privateToken, "privateToken is required");
  console.assert(!host.endsWith("/"));
  return new GitLabApiImpl(host, privateToken);
}
