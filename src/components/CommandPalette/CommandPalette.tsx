import styled from "styled-components";
import { ActionList, Box, Dialog, TextInput } from "@primer/react";
import { SearchIcon } from "@primer/octicons-react";
import { createContext, KeyboardEvent, memo, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Result, ResultType } from "@src/components/CommandPalette/command-palette-objects";
import { ResultView } from "@src/components/CommandPalette/ResultView";

interface StyleProps {
  isOpen: boolean;
}

export const ResultListContext = createContext<{ results: Result[]; selectedItem: Result }>(undefined);
ResultListContext.displayName = "ResultListContext";

const DialogWrapper = styled.div<StyleProps>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: ${(props) => (props.isOpen ? "block" : "none")};

  /* Revert GitLab global styles */
  svg {
    fill: currentColor;
  }
`;

function makeFakeResultList(): Result[] {
  const result: Array<Result> = [];
  for (let i = 0; i < 50; i++) {
    result.push({
      key: "cmd-" + i,
      title: `Title ${i} `,
      type: ResultType.Issue,
      description: `Description ${i}`,
      issue: {
        id: i,
        iid: i,
        title: `Title ${i}`,
        webUrl: "https://gitlab.com",
      },
    });
  }
  return result;
}

export function CommandPalette(props: { isOpen: boolean; onDismiss?: () => void }) {
  const textInput = useRef();
  const [searchText, setSearchText] = useState("");

  const resultList = useRef<Result[]>([]);
  const selectedIndex = useRef(-1);

  const [, setReload] = useState(0);

  const onInputKeydown = useCallback((e: KeyboardEvent) => {
    // Eat tab key
    if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex.current = Math.min(selectedIndex.current + 1, resultList.current.length - 1);
      setReload((prev) => prev + 1);
      return false;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex.current = Math.max(0, selectedIndex.current - 1);
      setReload((prev) => prev + 1);
      return false;
    }
  }, []);

  const showResults = useCallback((results: Result[]) => {
    if (selectedIndex.current >= 0) {
      const selectedItem = resultList.current[selectedIndex.current];
      selectedIndex.current = results.findIndex((item) => item.key === selectedItem?.key);
    } else if (results.length > 0) {
      selectedIndex.current = 0;
    } else {
      selectedIndex.current = -1;
    }
    resultList.current = results;
    setReload((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      showResults(makeFakeResultList());
    }, 100);
    return () => clearTimeout(timeout);
  }, [searchText, showResults]);

  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: isOpen is not a valid prop
    <DialogWrapper isOpen={props.isOpen}>
      <Dialog
        sx={{
          border: "1px solid",
          display: "flex",
          flexDirection: "column",
          borderColor: "border.default",
        }}
        initialFocusRef={textInput}
        isOpen={props.isOpen}
        onDismiss={props.onDismiss}
        wide
      >
        <Box display={"flex"} borderBottom="1px solid" borderBottomColor="border.default">
          <TextInput
            sx={{ flexGrow: 1, lineHeight: 4, border: "none", ":focus-within": { borderColor: "transparent", boxShadow: "none" } }}
            ref={textInput}
            placeholder="Jump to issues and merge requests..."
            leadingVisual={SearchIcon}
            onKeyDown={onInputKeydown}
            loading={false}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Box>
        <Box maxHeight={400} overflowY={"scroll"} sx={{ overscrollBehavior: "contain" }}>
          <ResultListContext.Provider value={{ results: resultList.current, selectedItem: resultList.current[selectedIndex.current] }}>
            <CommandPaletteContent />
          </ResultListContext.Provider>
        </Box>
      </Dialog>
    </DialogWrapper>
  );
}

/** Hack needed to avoid re-rendering ActionList when it is not strictly necessary */
const CommandPaletteContent = memo(() => {
  return (
    <ActionList variant="full">
      <ResultList />
    </ActionList>
  );
});
CommandPaletteContent.displayName = "CommandPaletteContent";

function ResultList() {
  const ctx = useContext(ResultListContext);
  return (
    <>
      {ctx.results.map((result) => (
        <ResultView key={result.key} active={result == ctx.selectedItem} result={result} />
      ))}
    </>
  );
}
