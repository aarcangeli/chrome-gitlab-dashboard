import React from "react";
import { BaseStyles, Box, Heading, Link, themeGet, ThemeProvider } from "@primer/react";
import { createGlobalStyle } from "styled-components";
import { ItemType } from "@pages/popup/IssueInfo";
import { GearIcon, SyncIcon } from "@primer/octicons-react";
import { GitLabApi, IssueSummary, MergeRequestSummary } from "@src/services/GitLabApi";
import { makeGitLabApi } from "@src/services/GitLabApiImpl";
import AccessTokenDialog from "@src/components/AccessTokenDialog";
import { PreferenceStorage } from "@src/services/PreferenceStorage";
import { IssueBoard } from "@src/components/IssueBoard";
import { CacheKey, CacheStorage } from "@src/services/CacheStorage";

// Apply global styles
// Background color must be set manually (https://github.com/primer/react/issues/2370#issuecomment-1259357065)
const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${themeGet("colors.canvas.default")};
  }
`;

class State {
  refreshVersion = 0;
}

const MERGE_REQUESTS_CACHE = new CacheKey<MergeRequestSummary[]>("user-mergeRequests", []);

export default class Popup extends React.Component<{}, State> {
  private readonly storage: PreferenceStorage;
  private gitLabApi: GitLabApi;
  private cacheStorage = new CacheStorage();

  constructor(props) {
    super(props);
    this.storage = new PreferenceStorage();
    this.state = new State();

    this.refreshToken = this.refreshToken.bind(this);
    this.refreshBoard = this.refreshBoard.bind(this);
    this.loadIssues = this.loadIssues.bind(this);
    this.refreshToken = this.refreshToken.bind(this);

    // load from cache
    this.cacheStorage.get(MERGE_REQUESTS_CACHE);

    if (this.storage.isAccessTokenSet()) {
      this.refreshToken();
    }
  }

  refreshToken() {
    this.gitLabApi = makeGitLabApi(this.storage.getHost(), this.storage.getAccessToken());
    this.setState({ refreshVersion: this.state.refreshVersion + 1 });
  }

  refreshBoard() {
    this.setState({ refreshVersion: this.state.refreshVersion + 1 });
  }

  async loadIssues(): Promise<IssueSummary[]> {
    if (!this.storage.isAccessTokenSet()) {
      return [];
    }
    return this.gitLabApi.issues(this.storage.getCurrentUserId());
  }

  async loadMergeRequests(): Promise<MergeRequestSummary[]> {
    if (!this.storage.isAccessTokenSet()) {
      return [];
    }
    return this.gitLabApi.mergeRequests(this.storage.getCurrentUserId());
  }

  render() {
    return (
      <div>
        <ThemeProvider colorMode="auto">
          <BaseStyles>
            <GlobalStyle />

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

              <IssueBoard title="Issues assigned to you" id="user-issues" type={ItemType.Issue} onLoad={this.loadIssues} refreshVersion={this.state.refreshVersion} />

              <IssueBoard
                title="Merge Request assigned to you"
                id="user-mergeRequests"
                type={ItemType.MergeRequest}
                onLoad={() => this.loadMergeRequests()}
                refreshVersion={this.state.refreshVersion}
              />

              <AccessTokenDialog isInitiallyOpen={!this.storage.isAccessTokenSet()} storage={this.storage} onSaved={this.refreshToken} />
            </Box>
          </BaseStyles>
        </ThemeProvider>
      </div>
    );
  }
}
