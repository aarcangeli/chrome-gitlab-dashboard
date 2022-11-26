import React from "react";
import "@pages/popup/Popup.css";
import {
  ActionList,
  ActionMenu,
  BaseStyles,
  Box,
  Button,
  ButtonGroup,
  FilteredSearch,
  Header,
  Link,
  Spinner,
  StyledOcticon,
  SubNav,
  TabNav,
  TextInput,
  themeGet,
  ThemeProvider,
  Timeline,
  Tooltip,
} from "@primer/react";
import { CheckIcon, FlameIcon, SearchIcon, XIcon } from "@primer/octicons-react";
import { createGlobalStyle } from "styled-components";

// Apply global styles
// Background color must be set manually (https://github.com/primer/react/issues/2370#issuecomment-1259357065)
const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${themeGet("colors.canvas.default")};
  }
`;

export default function Popup() {
  const onClick = () => alert("Clicked");

  return (
    <div>
      <ThemeProvider colorMode="auto">
        <BaseStyles>
          <GlobalStyle />

          {/* Test header */}
          <Header>
            <Header.Item>
              <Header.Link onClick={onClick}>
                <span>GitHub</span>
              </Header.Link>
            </Header.Item>
            <Header.Item full>Menu</Header.Item>
          </Header>

          <SubNav aria-label="Main">
            <FilteredSearch>
              <ActionMenu>
                <ActionMenu.Button>Filter</ActionMenu.Button>
                <ActionMenu.Overlay>
                  <ActionList>
                    <ActionList.Item>Item 1</ActionList.Item>
                    <ActionList.Item>Item 2</ActionList.Item>
                    <ActionList.Item>Item 3</ActionList.Item>
                  </ActionList>
                </ActionMenu.Overlay>
              </ActionMenu>
              <TextInput type="search" leadingVisual={SearchIcon} width={320} />
            </FilteredSearch>
            <SubNav.Links>
              <SubNav.Link href="#home" selected>
                Home
              </SubNav.Link>
              <SubNav.Link href="#documentation">Documentation</SubNav.Link>
              <SubNav.Link href="#support">Support</SubNav.Link>
            </SubNav.Links>
          </SubNav>

          <Spinner />

          <TabNav aria-label="Main">
            <TabNav.Link href="#home" selected>
              Home
            </TabNav.Link>
            <TabNav.Link href="#documentation">Documentation</TabNav.Link>
            <TabNav.Link href="#support">Support</TabNav.Link>
          </TabNav>

          <Timeline>
            <Timeline.Item>
              <Timeline.Badge>
                <StyledOcticon icon={FlameIcon} />
              </Timeline.Badge>
              <Timeline.Body>
                <Link href="#" sx={{ fontWeight: "bold", color: "fg.default", mr: 1 }} muted>
                  Monalisa
                </Link>
                created one{" "}
                <Link href="#" sx={{ fontWeight: "bold", color: "fg.default", mr: 1 }} muted>
                  hot potato
                </Link>
                <Link href="#" color="fg.muted" muted>
                  Just now
                </Link>
              </Timeline.Body>
            </Timeline.Item>
          </Timeline>

          <Button>Default</Button>
          <Button variant="danger">Danger</Button>

          <ButtonGroup>
            <Button>Button 1</Button>
            <Button>Button 2</Button>
            <Button>Button 3</Button>
          </ButtonGroup>

          <StyledOcticon icon={CheckIcon} size={32} color="success.fg" sx={{ mr: 2 }} />
          <StyledOcticon icon={XIcon} size={32} color="danger.fg" />

          <ActionMenu>
            <ActionMenu.Button>Menu</ActionMenu.Button>

            <ActionMenu.Overlay>
              <ActionList>
                <ActionList.Item onSelect={(event) => console.log("New file")}>New file</ActionList.Item>
                <ActionList.Item>Copy link</ActionList.Item>
                <ActionList.Item>Edit file</ActionList.Item>
                <ActionList.Divider />
                <ActionList.Item variant="danger">Delete file</ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>

          <Box borderWidth="1px" borderStyle="solid" borderColor="border.default" borderRadius={2} p={3}>
            <Tooltip aria-label="Hello, Tooltip!">Text with a tooltip</Tooltip>
          </Box>
        </BaseStyles>
      </ThemeProvider>
    </div>
  );
}
