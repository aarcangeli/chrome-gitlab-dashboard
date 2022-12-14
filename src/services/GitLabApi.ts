import { MinimalProject, ProjectAccess } from "@src/services/dao";

/**
 * Gives direct access to the GitLab API.
 * All requests are authenticated with the user's access token.
 */

export interface GitLabApi {
  /**
   * Get a list of projects the current user is a member of.
   */
  projects(query: string | undefined, options: QueryOptions): Promise<PaginatedResult<GitLabProject>>;

  projectByIds(id: number[], signal: AbortSignal): Promise<MinimalProject[]>;

  issues(assigneeId: number): Promise<PaginatedResult<IssueSummary>>;

  mergeRequests(assigneeId: number): Promise<PaginatedResult<MergeRequestSummary>>;

  mergeRequestsToReview(assigneeId: number): Promise<PaginatedResult<MergeRequestSummary>>;

  currentUser(): Promise<GitLabUser>;

  fetchNextPage<T>(page: PaginatedResult<T>, signal?: AbortSignal): Promise<PaginatedResult<T>>;

  /**
   * @param projectId the project id
   * @param options the query options
   */
  getProjectLabels(projectId: number, options: QueryOptions): Promise<PaginatedResult<Label>>;
}

export interface PaginatedResult<T> {
  items: T[];
  nextPageLink?: string;
}

export interface QueryOptions {
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
  state: "opened" | "closed";

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

export interface Namespace {
  id: number;
  name: string;
  path: string;
  kind: string;
  full_path: string;
  parent_id: number;
  avatar_url: string;
  web_url: string;
}

export interface ContainerExpirationPolicy {
  cadence: string;
  enabled: boolean;
  keep_n?: number;
  older_than: string;
  name_regex: string;
  name_regex_keep?: string;
  next_run_at: Date;
}

export interface Permissions {
  project_access?: ProjectAccess;
  group_access?: Permissions;
}

export interface GitLabProject {
  id: number;
  description: string;
  name: string;
  name_with_namespace: string;
  path: string;
  path_with_namespace: string;
  created_at: Date;
  default_branch: string;
  topics: string[];
  ssh_url_to_repo: string;
  http_url_to_repo: string;
  web_url: string;
  readme_url: string;
  avatar_url: string;
  forks_count: number;
  star_count: number;
  last_activity_at: Date;
  namespace: Namespace;
  container_registry_image_prefix: string;
  packages_enabled: boolean;
  empty_repo: boolean;
  archived: boolean;
  visibility: string;
  resolve_outdated_diff_discussions: boolean;
  container_expiration_policy: ContainerExpirationPolicy;
  issues_enabled: boolean;
  merge_requests_enabled: boolean;
  wiki_enabled: boolean;
  jobs_enabled: boolean;
  snippets_enabled: boolean;
  container_registry_enabled: boolean;
  service_desk_enabled: boolean;
  service_desk_address: string;
  can_create_merge_request_in: boolean;
  issues_access_level: string;
  repository_access_level: string;
  merge_requests_access_level: string;
  forking_access_level: string;
  wiki_access_level: string;
  builds_access_level: string;
  snippets_access_level: string;
  pages_access_level: string;
  operations_access_level: string;
  analytics_access_level: string;
  container_registry_access_level: string;
  security_and_compliance_access_level: string;
  releases_access_level: string;
  emails_disabled?: boolean;
  shared_runners_enabled: boolean;
  lfs_enabled: boolean;
  creator_id: number;
  import_url: string;
  import_type: string;
  import_status: string;
  open_issues_count: number;
  ci_default_git_depth: number;
  ci_forward_deployment_enabled: boolean;
  ci_job_token_scope_enabled: boolean;
  ci_separated_caches: boolean;
  ci_opt_in_jwt: boolean;
  ci_allow_fork_pipelines_to_run_in_parent_project: boolean;
  public_jobs: boolean;
  build_timeout: number;
  auto_cancel_pending_pipelines: string;
  ci_config_path: string;
  only_allow_merge_if_pipeline_succeeds: boolean;
  allow_merge_on_skipped_pipeline?: boolean;
  restrict_user_defined_variables: boolean;
  request_access_enabled: boolean;
  only_allow_merge_if_all_discussions_are_resolved: boolean;
  remove_source_branch_after_merge?: boolean;
  printing_merge_request_link_enabled: boolean;
  merge_method: string;
  squash_option: string;
  enforce_auth_checks_on_uploads: boolean;
  suggestion_commit_message: string;
  squash_commit_template: string;
  issue_branch_template: string;
  auto_devops_enabled: boolean;
  auto_devops_deploy_strategy: string;
  autoclose_referenced_issues: boolean;
  keep_latest_artifact: boolean;
  approvals_before_merge: number;
  mirror: boolean;
  external_authorization_classification_label: string;
  requirements_enabled: boolean;
  requirements_access_level: string;
  security_and_compliance_enabled: boolean;
  issues_template: string;
  merge_requests_template: string;
  merge_pipelines_enabled: boolean;
  merge_trains_enabled: boolean;
  permissions: Permissions;
  mirror_user_id?: number;
  mirror_trigger_builds?: boolean;
  only_mirror_protected_branches?: boolean;
  mirror_overwrites_diverged_branches?: boolean;
}

export class GitLabApiError extends Error {
  constructor(public message: string) {
    super(message);
  }
}
