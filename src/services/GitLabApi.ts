import { GitLabProject } from "@src/services/dao";

/**
 * Gives direct access to the GitLab API.
 * All requests are authenticated with the user's access token.
 */

export interface GitLabApi {
  /**
   * Get a list of projects the current user is a member of.
   */
  projects(query: string | undefined, options: QueryOptions): Promise<GitLabProject[]>;

  issues(assigneeId: number): Promise<IssueSummary[]>;

  mergeRequests(assigneeId: number): Promise<MergeRequestSummary[]>;
  mergeRequestsToReview(assigneeId: number): Promise<MergeRequestSummary[]>;

  currentUser(): Promise<GitLabUser>;

  /**
   * @param projectId the project id
   * @param page page number, starting at 1
   * @param perPage number of items per page
   */
  getProjectLabels(projectId: number, options: QueryOptions): Promise<Label[]>;
}

export interface QueryOptions {
  /** page number, starting at 1 */
  page: number;
  /** number of items per page */
  perPage: number;
  /** abort signal to cancel the request */
  signal?: AbortSignal;
}

/**
 * Common properties between the issues and merge requests.
 */
export interface CommonItemSummary {
  id: number;
  iid: number;
  title: string;
  web_url: string;
  project_id: number;
  description: string;
  state: string;

  author: GitLabUser;
  assignees: GitLabUser[];

  labels: string[];

  upvotes: number;
  downvotes: number;
  user_notes_count: number;
  references: { short: string; relative: string; full: string };
}

/**
 * Summary of an issue.
 * See https://docs.gitlab.com/ee/api/issues.html#list-issues
 */
export interface IssueSummary extends CommonItemSummary {
  type: string;
  merge_requests_count: number;
}

/**
 * Merge request summary.
 * See https://docs.gitlab.com/ee/api/merge_requests.html#list-merge-requests
 */
export interface MergeRequestSummary extends CommonItemSummary {
  reviewers: GitLabUser[];
  has_conflicts: boolean;
  draft: boolean;
}

export interface GitLabUser {
  id: number;
  username: string;

  /** The user's full name (name + surname) */
  name: string;

  state: string;
  avatar_url: string;
  web_url: string;
}

export interface Label {
  id: number;
  name: string;
  description: string;
  description_html: string;
  text_color: string;
  color: string;
  subscribed: boolean;
  priority: number;
  is_project_label: boolean;
}

export class GitLabApiError extends Error {
  constructor(public message: string) {
    super(message);
  }
}
