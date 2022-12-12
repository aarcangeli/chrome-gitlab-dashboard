import { GitLabApi, GitLabApiError, GitLabProject, GitLabUser, IssueSummary, Label, MergeRequestSummary, PaginatedResult, QueryOptions } from "@src/services/GitLabApi";
import { gql, GraphQLClient } from "graphql-request";
import { MinimalProject } from "@src/services/dao";

class GitLabApiImpl implements GitLabApi {
  constructor(private host: string, private privateToken: string) {}

  async projects(query: string | undefined, options: QueryOptions): Promise<PaginatedResult<GitLabProject>> {
    return await this.invokePaginatedApi(`/projects`, options.signal, {
      membership: "true",
      search: query,
      // Pagination (last_activity_at is not supported for keyset pagination)
      per_page: options.perPage,
      order_by: "last_activity_at",
      sort: "desc",
    });
  }

  async projectByIds(ids: number[], signal: AbortSignal): Promise<MinimalProject[]> {
    const result = await this.makeGraphQlClient(signal).request(
      gql`
        {
          projects(ids: ${JSON.stringify(ids.map((p) => `gid://gitlab/Project/${p}`))}) {
            nodes {
              id
              avatarUrl
              nameWithNamespace
              webUrl
            }
          }
        }
      `
    );
    return result.projects.nodes.map((p: any) => {
      return {
        id: parseInt(p.id.split("/").pop()!),
        avatar_url: p.avatarUrl,
        name_with_namespace: p.nameWithNamespace,
        web_url: p.webUrl,
      } as MinimalProject;
    });
  }

  private makeGraphQlClient(signal: AbortSignal) {
    return new GraphQLClient(`https://${this.host}/api/graphql`, {
      headers: {
        authorization: `Bearer ${this.privateToken}`,
      },
      signal,
    });
  }

  async issues(assigneeId: number): Promise<PaginatedResult<IssueSummary>> {
    return await this.invokePaginatedApi(`/issues`, null, {
      assignee_id: assigneeId,
      state: "opened",
      // scope is required otherwise we get only issues created by the current user
      scope: "all",
      // Pagination
      pagination: "keyset",
      per_page: 100,
      order_by: "updated_at",
      sort: "desc",
    });
  }

  async mergeRequests(assigneeId: number): Promise<PaginatedResult<MergeRequestSummary>> {
    return await this.invokePaginatedApi(`/merge_requests`, null, {
      assignee_id: assigneeId,
      state: "opened",
      // scope is required otherwise we get only issues created by the current user
      scope: "all",
      // Pagination
      pagination: "keyset",
      per_page: 100,
      order_by: "updated_at",
      sort: "desc",
    });
  }

  async mergeRequestsToReview(assigneeId: number): Promise<PaginatedResult<MergeRequestSummary>> {
    return await this.invokePaginatedApi(`/merge_requests`, null, {
      reviewer_id: assigneeId,
      state: "opened",
      // scope is required otherwise we get only issues created by the current user
      scope: "all",
      // Pagination
      pagination: "keyset",
      per_page: 100,
      order_by: "updated_at",
      sort: "desc",
    });
  }

  async currentUser(): Promise<GitLabUser> {
    return this.invokeApi("GET", `/user`, null);
  }

  async getProjectLabels(projectId: number, options: QueryOptions): Promise<PaginatedResult<Label>> {
    return await this.invokePaginatedApi(`/projects/${projectId}/labels`, options.signal, {
      // Pagination
      pagination: "keyset",
      per_page: options.perPage,
      order_by: "updated_at",
      sort: "desc",
    });
  }

  fetchNextPage<T>(page: PaginatedResult<T>, signal?: AbortSignal): Promise<PaginatedResult<T>> {
    console.assert(page.nextPageLink, "Expected nextPageLink to be set");
    return this.invokePaginatedApiRaw(page.nextPageLink, signal);
  }

  private async invokeApi(method: string, path: string, signal: AbortSignal | undefined, query: Record<string, any> = {}, body: any = {}): Promise<any> {
    const { bodyResponse } = await this.makeApi(path, query, method, signal, body);
    return bodyResponse;
  }

  private async invokePaginatedApi<T>(path: string, signal: AbortSignal | undefined, query: Record<string, any> = {}, body: any = {}): Promise<PaginatedResult<T>> {
    const url = this.makeUrl(path, query);
    return this.invokePaginatedApiRaw<T>(url, signal);
  }

  private async invokePaginatedApiRaw<T>(url: string, signal: AbortSignal | undefined): Promise<PaginatedResult<T>> {
    const response = await fetch(url, {
      method: "GET",
      signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.privateToken}`,
      },
    });
    const bodyResponse = await response.json();
    if (!response.ok) {
      throw new GitLabApiError(`Failed to invoke GET ${url}: ${bodyResponse.message || response.statusText}`);
    }

    const result: PaginatedResult<T> = { items: bodyResponse };
    response.headers
      .get("link")
      ?.split(/,\s*/)
      .forEach((link) => {
        const match = link.trim().match(/<([^>]+)>; rel="([^"]+)"/);
        if (match) {
          const [, url, rel] = match;
          if (rel === "next") {
            result.nextPageLink = url;
          }
        }
      });
    return result;
  }

  private makeUrl(path: string, query: Record<string, any> | undefined) {
    console.assert(path.startsWith("/"), "Expected path to start with /");
    const queryString = query && Object.keys(query).length > 0 ? `?${new URLSearchParams(query)}` : "";
    return `https://${this.host}/api/v4${path}${queryString}`;
  }

  private async makeApi(path: string, query: Record<string, any>, method: string, signal: AbortSignal, body: any) {
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
    return { bodyResponse, response };
  }
}

export function makeGitLabApi(host = "gitlab.com", privateToken: string): GitLabApi {
  console.assert(privateToken, "privateToken is required");
  console.assert(!host.endsWith("/"));
  return new GitLabApiImpl(host, privateToken);
}
