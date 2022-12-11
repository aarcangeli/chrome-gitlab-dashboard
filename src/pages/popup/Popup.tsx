import React from "react";
import { Box, Heading, Link } from "@primer/react";
import { ItemType } from "@src/components/IssueInfo";
import { GearIcon, SyncIcon } from "@primer/octicons-react";
import { GitLabApi, IssueSummary, MergeRequestSummary } from "@src/services/GitLabApi";
import { makeGitLabApi } from "@src/services/GitLabApiImpl";
import AccessTokenDialog from "@src/components/AccessTokenDialog";
import { PersistentStorage } from "@src/services/PersistentStorage";
import { IssueBoard } from "@src/components/IssueBoard";
import { LabelService } from "@src/services/LabelService";
import { BookmarkManager } from "@src/services/BookmarkManager";
import { IssueDatabase } from "@src/services/IssueDatabase";

class State {
  refreshVersion = 0;
}

export default class Popup extends React.Component<{}, State> {
  private readonly storage: PersistentStorage;
  private gitLabApi: GitLabApi;
  private labelService: LabelService;
  private readonly bookmarkManager: BookmarkManager;
  private readonly issueIndex = new IssueDatabase();

  constructor(props) {
    super(props);
    this.storage = new PersistentStorage();
    this.state = new State();
    this.bookmarkManager = new BookmarkManager(this.storage);

    this.refreshToken = this.refreshToken.bind(this);
    this.refreshBoard = this.refreshBoard.bind(this);
    this.loadIssues = this.loadIssues.bind(this);
    this.refreshToken = this.refreshToken.bind(this);

    if (this.storage.isAccessTokenSet()) {
      this.refreshToken();
    }
  }

  refreshToken() {
    this.gitLabApi = makeGitLabApi(this.storage.getHost(), this.storage.getAccessToken());
    this.labelService = new LabelService(this.gitLabApi, this.storage);
    this.setState({ refreshVersion: this.state.refreshVersion + 1 });
  }

  refreshBoard() {
    this.setState({ refreshVersion: this.state.refreshVersion + 1 });
  }

  async loadIssues(): Promise<IssueSummary[]> {
    if (!this.storage.isAccessTokenSet()) {
      return [];
    }
    return (await this.gitLabApi.issues(this.storage.getCurrentUserId())).items;
  }

  async loadMergeRequests(): Promise<MergeRequestSummary[]> {
    if (!this.storage.isAccessTokenSet()) {
      return [];
    }
    return (await this.gitLabApi.mergeRequests(this.storage.getCurrentUserId())).items;
  }

  async loadMergeRequestsToReview(): Promise<MergeRequestSummary[]> {
    if (!this.storage.isAccessTokenSet()) {
      return [];
    }
    return (await this.gitLabApi.mergeRequestsToReview(this.storage.getCurrentUserId())).items;
  }

  render() {
    return (
      <Box p={2}>
        <Heading as="h1" sx={{ fontSize: 3 }}>
          <Link target="_blank" href="/src/pages/options/index.html">
            <GearIcon verticalAlign="unset" />
          </Link>{" "}
          GitLab Dashboard{" "}
          <Link as="button" onClick={this.refreshBoard}>
            <SyncIcon size="small" verticalAlign="unset" />
          </Link>
        </Heading>

        <IssueBoard
          title="Issues assigned to you"
          id="user-issues"
          type={ItemType.Issue}
          onLoad={this.loadIssues}
          refreshVersion={this.state.refreshVersion}
          storage={this.storage}
          labelService={this.labelService}
          bookmarkManager={this.bookmarkManager}
        />

        <IssueBoard
          title="Merge Request assigned to you"
          id="user-mergeRequests"
          type={ItemType.MergeRequest}
          onLoad={() => this.loadMergeRequests()}
          refreshVersion={this.state.refreshVersion}
          storage={this.storage}
          labelService={this.labelService}
          bookmarkManager={this.bookmarkManager}
        />

        <IssueBoard
          title="Review requests for you"
          id="user-mergeRequestsToReview"
          type={ItemType.MergeRequest}
          onLoad={() => this.loadMergeRequestsToReview()}
          refreshVersion={this.state.refreshVersion}
          storage={this.storage}
          labelService={this.labelService}
          bookmarkManager={this.bookmarkManager}
        />

        <AccessTokenDialog isInitiallyOpen={!this.storage.isAccessTokenSet()} storage={this.storage} onSaved={this.refreshToken} />
      </Box>
    );
  }
}
