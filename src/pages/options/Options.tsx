import { Box, Heading, NavList, Pagehead, PageLayout } from "@primer/react";
import { WatchedProjects } from "@pages/options/WatchedProjects";

export function Options() {
  return (
    <PageLayout>
      {/* Left column */}
      <PageLayout.Pane position="start">
        <NavList>
          <NavList.Item aria-current="page">Watched Projects</NavList.Item>
        </NavList>
      </PageLayout.Pane>

      {/* Content */}
      <PageLayout.Content>
        <Pagehead sx={{ paddingTop: 0, paddingBottom: 2, marginBottom: 2 }}>
          <Heading sx={{ fontSize: 4 }}>Watched Projects</Heading>
        </Pagehead>
        <WatchedProjects />
      </PageLayout.Content>
    </PageLayout>
  );
}
