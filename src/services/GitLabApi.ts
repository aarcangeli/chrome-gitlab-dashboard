/**
 * Gives direct access to the GitLab API.
 * All requests are authenticated with the user's access token.
 */

export interface GitLabApi {
  projects(): Promise<unknown>;

  issues(assigneeId: number): Promise<IssueSummary[]>;

  mergeRequests(assigneeId: number): Promise<MergeRequestSummary[]>;
  mergeRequestsToReview(assigneeId: number): Promise<MergeRequestSummary[]>;

  currentUser(): Promise<GitLabUser>;
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

export class GitLabApiError extends Error {
  constructor(public message: string) {
    super(message);
  }
}
