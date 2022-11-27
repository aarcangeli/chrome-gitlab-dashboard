import { GitLabApi, GitLabApiError, GitLabUser, IssueSummary } from "@src/services/GitLabApi";
import { waitFor } from "@testing-library/react";

class GitLabApiImpl implements GitLabApi {
  constructor(private host: string, private privateToken: string) {}

  async projects(): Promise<unknown> {
    return await this.invokeApi("GET", `/projects`, { membership: "true" });
  }

  async issues(assigneeId: number): Promise<IssueSummary[]> {
    return await this.invokeApi("GET", `/issues`, {
      assignee_id: assigneeId,
      // scope is required otherwise we get only issues created by the current user
      scope: "all",
    });
  }

  async currentUser(): Promise<GitLabUser> {
    return this.invokeApi("GET", `/user`);
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
