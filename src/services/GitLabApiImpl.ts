import { GitLabApi, IssueSummary } from "@src/services/GitLabApi";

class GitLabApiImpl implements GitLabApi {
  constructor(private host: string, private privateToken: string) {}

  async projects(): Promise<any> {
    return await this.invokeApi("GET", `/projects`, { membership: "true" });
  }

  async issues(assigneeId: number): Promise<IssueSummary[]> {
    return await this.invokeApi("GET", `/issues`, {
      assignee_id: assigneeId,
      // scope is required otherwise we get only issues created by the current user
      scope: "all",
    });
  }

  private async invokeApi(method: string, path: string, query: Record<string, any> = {}, body: any = {}): Promise<any> {
    console.assert(path.startsWith("/"), "Expected path to start with /");

    const url = `${this.host}/api/v4${path}`;
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
    return response.json();
  }
}

export function makeGitLabApi(host: string = "https://gitlab.com", privateToken: string): GitLabApi {
  console.assert(privateToken, "privateToken is required");
  console.assert(!host.endsWith("/"));
  return new GitLabApiImpl(host, privateToken);
}
