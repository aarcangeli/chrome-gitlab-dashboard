import { ActionList, Avatar, Box, FormControl, Heading, Spinner, TextInput } from "@primer/react";
import { RubyIcon, SearchIcon } from "@primer/octicons-react";
import { GitLabApi } from "@src/services/GitLabApi";
import { PersistentStorage } from "@src/services/PersistentStorage";
import { useCallback, useId, useState } from "react";
import { GitLabProject } from "@src/services/dao";
import { usePagination } from "@src/utils/usePagination";
import { useDebounce } from "@src/utils/useDebounce";

const PROJECT_PER_PAGE = 30;

interface Props {
  storage: PersistentStorage;
  gitLabApi: GitLabApi;
}

export function WatchedProjects(props: Props) {
  const [query, setQuery] = useState("");
  const [loadingElement, setLoadingElement] = useState(null);

  const [errorMinimumCharacters, setErrorMinimumCharacters] = useState(false);

  const { rows, hasMore } = usePagination<GitLabProject>({
    loadingElement,
    preloadNext: true,
    loadingFn: useCallback(
      async (page, signal) => {
        return await props.gitLabApi.projects(query, { page, perPage: PROJECT_PER_PAGE, signal });
      },
      [props.gitLabApi, query]
    ),
  });

  // gitlab requires at least 3 characters
  function isValueValid(value: string) {
    return value.length <= 0 || value.length >= 3;
  }

  const updateValidation = useDebounce((value: string) => {
    if (!isValueValid(value)) {
      setErrorMinimumCharacters(true);
    }
  }, 500);

  function updateQuery(value: string) {
    setErrorMinimumCharacters(false);
    updateValidation(value);
    if (isValueValid(value)) {
      setQuery(value);
    }
  }

  return (
    <>
      <ActionList selectionVariant="multiple" showDividers variant={"full"}>
        <ActionList.Group title="Watched projects">
          <ActionList.Item selected={true} sx={{ borderRadius: 2 }}>
            <ActionList.LeadingVisual>
              <Avatar square src="https://github.com/hubot.png" />
            </ActionList.LeadingVisual>
            Zuru Home / Dreamcatcher / BIM
          </ActionList.Item>
          <ActionList.Item selected={true} sx={{ borderRadius: 2 }}>
            <ActionList.LeadingVisual>
              <Avatar square src="https://github.com/hubot.png" />
            </ActionList.LeadingVisual>
            Zuru Home / Dreamcatcher / BIM
          </ActionList.Item>
          <ActionList.Item selected={true} sx={{ borderRadius: 2 }}>
            <ActionList.LeadingVisual>
              <Avatar square src="https://github.com/hubot.png" />
            </ActionList.LeadingVisual>
            Zuru Home / Dreamcatcher / BIM
          </ActionList.Item>
        </ActionList.Group>
      </ActionList>

      <Heading as="h3" sx={{ fontSize: 2, marginTop: 2 }}>
        Add project
      </Heading>

      {/* Search box */}
      <Box my={2}>
        <FormControl>
          <FormControl.Label>Search projects</FormControl.Label>
          <TextInput aria-label="Search" leadingVisual={SearchIcon} onChange={(e) => updateQuery(e.target.value)} />
          {errorMinimumCharacters && <FormControl.Validation variant="error">Minimum 3 characters</FormControl.Validation>}
        </FormControl>
      </Box>

      <ActionList selectionVariant="multiple" showDividers variant={"full"}>
        {rows.map((project) => (
          <ProjectRow key={project.id} selected={false} project={project} />
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

function ProjectRow(props: { project: GitLabProject; selected: boolean; onSelect?: () => void }) {
  const { project } = props;
  return (
    <ActionList.Item sx={{ borderRadius: 2 }} selected={props.selected} onSelect={props.onSelect}>
      <ActionList.LeadingVisual>{project.avatar_url ? <Avatar square src={project.avatar_url} /> : <RubyIcon />}</ActionList.LeadingVisual>
      <Box>{project.name_with_namespace}</Box>
    </ActionList.Item>
  );
}
