import styled from "styled-components";
import { ActionList, Avatar, Box, Dialog, TextInput } from "@primer/react";
import { SearchIcon } from "@primer/octicons-react";
import { KeyboardEvent, useCallback, useRef } from "react";

interface StyleProps {
  isOpen: boolean;
}

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

export function CommandPalette(props: { isOpen: boolean; onDismiss?: () => void }) {
  const textInput = useRef();

  const onInputKeydown = useCallback((e: KeyboardEvent) => {
    console.log("onInputKeydown", e.key);
    // Eat tab key
    if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, []);

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
        aria-labelledby="header-id"
        onKeyDown={onInputKeydown}
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
          />
        </Box>
        <Box maxHeight={400} overflowY={"scroll"} sx={{ overscrollBehavior: "contain" }}>
          <ActionList variant="full">
            <RenderItem active={false} title="Item1" description="Monalisa Octocat" />
            <RenderItem active={true} title="Item2" description="Hubot" />
            <RenderItem active={false} title="Item2" description="Hubot" />
            <RenderItem active={false} title="Item2" description="Hubot" />
            {Array.from(Array(100).keys()).map((i) => (
              <RenderItem key={i} active={false} title={"Item " + i} description="Hubot" />
            ))}
          </ActionList>
        </Box>
      </Dialog>
    </DialogWrapper>
  );
}

function RenderItem(props: { active: boolean; title: string; description: string }) {
  const styleOverride = {
    width: "100%",
    ":focus-within": { borderColor: "transparent", boxShadow: "none" },
  };

  if (props.active) {
    // Remove the left border
    styleOverride["&::after"] = {
      display: "none",
    };
  }

  const onInputKeydown = useCallback((e: KeyboardEvent) => {
    // Eat tab key
    if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, []);

  return (
    <ActionList.Item active={props.active} onKeyDown={onInputKeydown} sx={styleOverride}>
      <ActionList.LeadingVisual>
        <Avatar src="https://github.com/mona.png" />
      </ActionList.LeadingVisual>
      {props.title}
      <ActionList.Description>{props.description}</ActionList.Description>
    </ActionList.Item>
  );
}
