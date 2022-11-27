export interface IssueSummary {
  iid: number;
  title: string;
}

export interface GitLabApi {
  projects(): Promise<any>;

  issues(assigneeId: number): Promise<IssueSummary[]>;
}
