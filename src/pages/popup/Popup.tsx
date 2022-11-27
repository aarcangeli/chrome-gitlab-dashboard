import React from "react";
import {BaseStyles, Box, Heading, Link, Spinner, themeGet, ThemeProvider} from "@primer/react";
import {createGlobalStyle} from "styled-components";
import IssueInfo from "@pages/popup/IssueInfo";
import {GearIcon} from "@primer/octicons-react";
import {IssueSummary} from "@src/services/GitLabApi";
import {makeGitLabApi} from "@src/services/GitLabApiImpl";

// Apply global styles
// Background color must be set manually (https://github.com/primer/react/issues/2370#issuecomment-1259357065)
const GlobalStyle = createGlobalStyle`
  body, html {
    width: 800px;
  }
  body {
    background-color: ${themeGet("colors.canvas.default")};
  }
`;

class State {
  isLoading: boolean = true;
  issues: IssueSummary[] = [];
}

export default class Popup extends React.Component<void, State> {
  constructor(props) {
    super(props);
    this.state = new State();

    const privateToken = "<<glpat-token>>";
    makeGitLabApi(undefined, privateToken)
      .issues(7042357)
      .then((data) => this.setState({isLoading: false, issues: data}));
  }

  render() {
    return (
      <div>
        <ThemeProvider colorMode="auto">
          <BaseStyles>
            <GlobalStyle/>

            <Box p={2}>
              <Heading as="h1" sx={{fontSize: 3}}>
                <Link target="_blank" href="/src/pages/options/index.html">
                  <GearIcon verticalAlign="unset"/>
                </Link>{" "}
                GitLab Dashboard
              </Heading>

              <Heading sx={{fontSize: 1, mb: 2}}>Issues ({this.state.issues.length})</Heading>

              {/* Spinner */}
              {this.state.isLoading ? (
                <Box display="flex" justifyContent="center" py="5">
                  <Spinner/>
                </Box>
              ) : null}

              <Box pb={2}>
                {this.state.issues.map((issue) => (
                  <IssueInfo title={issue.title}/>
                ))}
              </Box>

              <Heading sx={{fontSize: 1, mb: 2}}>Review Requested for you</Heading>
            </Box>
          </BaseStyles>
        </ThemeProvider>
      </div>
    );
  }
}
