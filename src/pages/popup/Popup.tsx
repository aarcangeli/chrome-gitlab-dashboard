import React from "react";
import { BaseStyles, Box, Heading, Link, Spinner, themeGet, ThemeProvider } from "@primer/react";
import { createGlobalStyle } from "styled-components";
import IssueInfo from "@pages/popup/IssueInfo";
import { GearIcon } from "@primer/octicons-react";
import { GitLabApi, IssueSummary } from "@src/services/GitLabApi";
import { makeGitLabApi } from "@src/services/GitLabApiImpl";
import AccessTokenDialog from "@src/components/PrivateTokenDialog/AccessTokenDialog";
import { PreferenceStorage } from "@src/services/PreferenceStorage";

const privateToken = "<<glpat-token>>";

// Apply global styles
// Background color must be set manually (https://github.com/primer/react/issues/2370#issuecomment-1259357065)
const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${themeGet("colors.canvas.default")};
  }
`;

class State {
  isLoading = false;
  issues: IssueSummary[] = [];
}

export default class Popup extends React.Component<{}, State> {
  private readonly storage: PreferenceStorage;
  private gitLabApi: GitLabApi;

  constructor(props) {
    super(props);
    this.state = new State();
    this.storage = new PreferenceStorage();

    if (this.storage.isAccessTokenSet()) {
      this.refreshToken();
      this.state = { isLoading: true, issues: [] };
    }
  }

  refreshToken() {
    this.gitLabApi = makeGitLabApi(this.storage.getHost(), this.storage.getAccessToken());

    console.log("before", this.state);
    this.setState({ isLoading: true });
    console.log("after", this.state);
    this.gitLabApi.issues(this.storage.getCurrentUserId()).then((data) => {
      this.setState({ isLoading: false, issues: data });
    });
  }

  render() {
    console.log("render", this.state);
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
                GitLab Dashboard
              </Heading>

              <Heading sx={{ fontSize: 1, mb: 2 }}>Issues ({this.state.issues.length})</Heading>

              {/* Spinner */}
              {this.state.isLoading && (
                <Box display="flex" justifyContent="center" py="5">
                  <Spinner />
                </Box>
              )}

              <Box pb={2}>
                {this.state.issues.map((issue) => (
                  <IssueInfo key={issue.iid} title={issue.title} />
                ))}
              </Box>

              <Heading sx={{ fontSize: 1, mb: 2 }}>Review Requested for you</Heading>

              <AccessTokenDialog isInitiallyOpen={!this.storage.isAccessTokenSet()} storage={this.storage} onSaved={this.refreshToken.bind(this)} />
            </Box>
          </BaseStyles>
        </ThemeProvider>
      </div>
    );
  }
}
