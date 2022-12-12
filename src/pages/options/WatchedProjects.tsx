import { ActionList, Avatar, Box, FormControl, Heading, Link, Spinner, TextInput } from "@primer/react";
import { LinkExternalIcon, RubyIcon, SearchIcon } from "@primer/octicons-react";
import { GitLabApi, GitLabProject, PaginatedResult } from "@src/services/GitLabApi";
import { PersistentStorage } from "@src/services/PersistentStorage";
import { useCallback, useEffect, useState } from "react";
import { MinimalProject } from "@src/services/dao";
import { usePagination } from "@src/utils/usePagination";
import { useDebounce } from "@src/utils/useDebounce";
import { splitArray } from "@src/utils/splitArray";

const PROJECT_PER_PAGE = 30;

interface Props {
  storage: PersistentStorage;
  gitLabApi: GitLabApi;
}

async function refreshWatchedProjects(storage: PersistentStorage, gitLabApi: GitLabApi, signal: AbortSignal) {
  const watchedProjects = storage.getWatchedProjects();
  if (watchedProjects.length === 0) {
    return;
  }

  const projectsToRemove: Set<number> = new Set(watchedProjects.map((p) => p.id));
  for (const projects of splitArray(watchedProjects, PROJECT_PER_PAGE)) {
    const projectsInfo = await gitLabApi.projectByIds(
      projects.map((p) => p.id),
      signal
    );
    const newWatchedProjects = storage.getWatchedProjects();
    storage.putWatchedProjects(...projectsInfo.filter((p) => newWatchedProjects.some((np) => np.id === p.id)));
    projectsInfo.map((p) => p.id).forEach((id) => projectsToRemove.delete(id));
  }

  if (projectsToRemove.size > 0) {
    storage.removeWatchedProjects(...projectsToRemove);
  }
}

function makeMinimalProject(p: GitLabProject): MinimalProject {
  return {
    id: p.id,
    avatar_url: p.avatar_url,
    name_with_namespace: p.name_with_namespace,
    web_url: p.web_url,
  };
}

export function WatchedProjects(props: Props) {
  const [query, setQuery] = useState("");
  const [loadingElement, setLoadingElement] = useState(null);
  const [, setReload] = useState(0);

  const [errorMinimumCharacters, setErrorMinimumCharacters] = useState(false);

  // On startup, refresh the UI of the watched projects
  useEffect(() => {
    const controller = new AbortController();
    refreshWatchedProjects(props.storage, props.gitLabApi, controller.signal)
      .then(() => setReload((prev) => prev + 1))
      .catch((e) => {
        if (e.name === "AbortError") return;
        console.error(e);
      });
    return () => controller.abort();
  }, [props.gitLabApi, props.storage]);

  const { rows, hasMore } = usePagination<MinimalProject>({
    loadingElement,
    gitlabApi: props.gitLabApi,
    loadingFn: useCallback(
      async (signal) => {
        const allProjects = await props.gitLabApi.projects(query, { perPage: PROJECT_PER_PAGE, signal });
        const converted: PaginatedResult<MinimalProject> = allProjects;
        converted.items = allProjects.items.map((p) => makeMinimalProject(p));
        return converted;
      },
      [props.gitLabApi, query]
    ),
  });

  // gitlab requires at least 3 characters
  function isValueValid(value: string) {
    return value.length <= 0 || value.length >= 3;
  }

  const validationDebounce = useDebounce();

  function updateQuery(value: string) {
    setErrorMinimumCharacters(false);
    validationDebounce(() => {
      if (!isValueValid(value)) {
        setErrorMinimumCharacters(true);
      }
    }, 500);
    if (isValueValid(value)) {
      setQuery(value);
    }
  }

  const watchedProjects = props.storage.getWatchedProjects();

  function toggleWatch(project: MinimalProject) {
    if (watchedProjects.some((p) => p.id === project.id)) {
      props.storage.removeWatchedProjects(project.id);
    } else {
      props.storage.putWatchedProjects(project);
    }
    setReload((prev) => prev + 1);
  }

  function removeFromWatch(project: MinimalProject) {
    props.storage.removeWatchedProjects(project.id);
    setReload((prev) => prev + 1);
  }

  return (
    <>
      <ActionList selectionVariant="multiple" showDividers variant={"full"}>
        <ActionList.Group title="Watched projects" selectionVariant={watchedProjects.length ? "multiple" : false}>
          {watchedProjects.map((project) => (
            <ProjectRow key={project.id} selected={true} project={project} onSelect={() => removeFromWatch(project)} />
          ))}
          {watchedProjects.length === 0 && <ActionList.Item disabled>No watched projects</ActionList.Item>}
        </ActionList.Group>
      </ActionList>

      <Heading as="h3" sx={{ fontSize: 2, marginTop: 2 }}>
        Add project
      </Heading>

      {/* Search box */}
      <Box my={2}>
        <FormControl>
          <FormControl.Label visuallyHidden>Search</FormControl.Label>
          <TextInput leadingVisual={SearchIcon} onChange={(e) => updateQuery(e.target.value)} placeholder="Search" />
          {errorMinimumCharacters && <FormControl.Validation variant="error">Minimum 3 characters</FormControl.Validation>}
        </FormControl>
      </Box>

      <ActionList selectionVariant="multiple" showDividers variant={"full"}>
        {rows.map((project) => (
          <ProjectRow key={project.id} selected={watchedProjects.some((p) => p.id === project.id)} project={project} onSelect={() => toggleWatch(project)} />
        ))}

        {hasMore && (
          <Box ref={setLoadingElement} display={"flex"} justifyContent={"center"} py={4}>
            <Spinner />
          </Box>
        )}
      </ActionList>
    </>
  );
}

function ProjectRow(props: { project: MinimalProject; selected: boolean; onSelect?: () => void }) {
  const { project } = props;
  return (
    <ActionList.Item sx={{ borderRadius: 2 }} selected={props.selected} onSelect={props.onSelect}>
      <ActionList.LeadingVisual>{project.avatar_url ? <Avatar square src={project.avatar_url} /> : <RubyIcon />}</ActionList.LeadingVisual>
      <Box>
        {project.name_with_namespace}
        <Link href={project.web_url} target="_blank" sx={{ marginLeft: 1 }} onClick={(e) => e.stopPropagation()}>
          <LinkExternalIcon />
        </Link>
      </Box>
    </ActionList.Item>
  );
}
