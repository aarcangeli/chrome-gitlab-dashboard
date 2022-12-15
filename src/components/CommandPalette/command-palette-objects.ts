import { MergeRequestSummary } from "@src/services/GitLabApi";
import { MinimalIssue } from "@src/services/dao";

export enum ResultType {
  Command,
  File,
  Folder,
  Project,
  Issue,
  MergeRequest,
  Snippet,
}

interface ResultBase {
  key: string;
  title: string;
  type: ResultType;
  description: string;
}

interface IssueResult extends ResultBase {
  type: ResultType.Issue;
  issue: MinimalIssue;
}

interface MergeRequestResult extends ResultBase {
  type: ResultType.MergeRequest;
  mergeRequest: MergeRequestSummary;
}

export type Result = IssueResult | MergeRequestResult;
