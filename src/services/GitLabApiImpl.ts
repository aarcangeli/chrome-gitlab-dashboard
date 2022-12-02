import { GitLabApi, GitLabApiError, GitLabUser, IssueSummary, Label, MergeRequestSummary } from "@src/services/GitLabApi";

class GitLabApiImpl implements GitLabApi {
  constructor(private host: string, private privateToken: string) {}

  async projects(): Promise<unknown> {
    return await this.invokeApi("GET", `/projects`, { membership: "true" });
  }

  async issues(assigneeId: number): Promise<IssueSummary[]> {
    return await this.invokeApi("GET", `/issues`, {
      assignee_id: assigneeId,
      state: "opened",
      // scope is required otherwise we get only issues created by the current user
      scope: "all",
    });
  }

  async mergeRequests(assigneeId: number): Promise<MergeRequestSummary[]> {
    return await this.invokeApi("GET", `/merge_requests`, {
      assignee_id: assigneeId,
      state: "opened",
      // scope is required otherwise we get only issues created by the current user
      scope: "all",
    });
  }

  async mergeRequestsToReview(assigneeId: number): Promise<MergeRequestSummary[]> {
    return await this.invokeApi("GET", `/merge_requests`, {
      reviewer_id: assigneeId,
      state: "opened",
      // scope is required otherwise we get only issues created by the current user
      scope: "all",
    });
  }

  async currentUser(): Promise<GitLabUser> {
    return this.invokeApi("GET", `/user`);
  }

  async getProjectLabels(projectId: number, page: number, perPage: number): Promise<Label[]> {
    return await this.invokeApi("GET", `/projects/${projectId}/labels`, {
      page: page,
      per_page: perPage,
    });
  }

  private async invokeApi(method: string, path: string, query: Record<string, any> = {}, body: any = {}): Promise<any> {
    console.assert(path.startsWith("/"), "Expected path to start with /");

    const url = `https://${this.host}/api/v4${path}`;
    const queryString = Object.keys(query).length > 0 ? `?${new URLSearchParams(query)}` : "";
    const isGet = method === "GET";

    const response = await fetch(url + queryString, {
      method,
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
