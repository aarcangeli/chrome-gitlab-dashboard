import { Heading, NavList, Pagehead, PageLayout } from "@primer/react";
import { WatchedProjects } from "@pages/options/WatchedProjects";
import { PersistentStorage } from "@src/services/PersistentStorage";
import { makeGitLabApi } from "@src/services/GitLabApiImpl";
import { useConstant } from "@src/utils/useConstant";

export function Options() {
  const storage = useConstant(() => new PersistentStorage());
  const gitLabApi = useConstant(() => makeGitLabApi(storage.getHost(), storage.getAccessToken()));

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
        <WatchedProjects storage={storage} gitLabApi={gitLabApi} />
      </PageLayout.Content>
    </PageLayout>
  );
}
