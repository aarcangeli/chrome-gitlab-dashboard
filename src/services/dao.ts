export interface ProjectAccess {
  access_level: number;
  notification_level: number;
}

/**
 * Project used in watched projects UI
 */
export interface MinimalProject {
  id: number;
  avatar_url: string;
  name_with_namespace: string;
  web_url: string;
}

/**
 * Project used in watched projects UI
 */
export interface MinimalIssue {
  id: number;
  iid: number;
  title: string;
  webUrl: string;
}
