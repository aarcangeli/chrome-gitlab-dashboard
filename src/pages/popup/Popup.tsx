import React from "react";
import "@pages/popup/Popup.css";
import {BaseStyles, Box, Heading, Link, themeGet, ThemeProvider,} from "@primer/react";
import {createGlobalStyle} from "styled-components";
import IssueInfo from "@pages/popup/IssueInfo";
import {GearIcon} from "@primer/octicons-react";

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

export default function Popup() {
  return (
    <div>
      <ThemeProvider colorMode="auto">
        <BaseStyles>
          <GlobalStyle/>

          <Box p={2}>
            <Heading as="h1" sx={{fontSize: 3}}>
              <Link target="_blank" href="/src/pages/options/index.html"><GearIcon verticalAlign="unset"/></Link>
              {' '}
              GitLab Dashboard
            </Heading>
            <Heading sx={{fontSize: 1, mb: 2}}>Issues</Heading>

            <Box pb={2}>
              <IssueInfo title="Issue 1"/>
              <IssueInfo title="Issue 2"/>
              <IssueInfo title="Issue 3"/>
              <IssueInfo title="Issue 4" link="/asd"/>
              <IssueInfo
                title="Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; Issue 4; "/>
            </Box>

            <Heading sx={{fontSize: 1, mb: 2}}>Review Requested for you</Heading>
          </Box>

        </BaseStyles>
      </ThemeProvider>
    </div>
  );
}
