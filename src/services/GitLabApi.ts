export interface IssueSummary {
  iid: number;
  title: string;
}

export interface GitLabUser {
  id: number;
  username: string;

  /** The user's full name (name + surname) */
  name: string;
}

export interface GitLabApi {
  projects(): Promise<unknown>;

  issues(assigneeId: number): Promise<IssueSummary[]>;

  currentUser(): Promise<GitLabUser>;
}

export class GitLabApiError extends Error {
  constructor(public message: string) {
    super(message);
  }
}
