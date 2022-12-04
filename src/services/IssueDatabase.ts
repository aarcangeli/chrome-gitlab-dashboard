import Dexie, { Table } from "dexie";
import { IssueSummary, MergeRequestSummary } from "@src/services/GitLabApi";

export class MySubClassedDexie extends Dexie {
  issue!: Table<IssueSummary>;
  merge_request!: Table<MergeRequestSummary>;

  constructor() {
    super("gitlab-db");

    // Define tables and indexes
    // - the first parameter (eg: "id") is the primary key
    // - other parameters are indexes
    // Note: add a index only if you want to query by that index
    // docs: https://dexie.org/docs/Version/Version.stores()
    this.version(1).stores({
      issue: "id, project_id",
      merge_request: "id, project_id",
    });
  }
}

export class IssueDatabase {
  private db: MySubClassedDexie;

  constructor() {
    this.db = new MySubClassedDexie();
  }

  async addIssue(issue: IssueSummary): Promise<unknown> {
    return this.db.issue.put(issue);
  }

  async getIssue(id: number): Promise<IssueSummary | undefined> {
    return this.db.issue.get(id);
  }

  async getAllIssues(): Promise<Array<IssueSummary>> {
    return this.db.issue.toArray();
  }
}
