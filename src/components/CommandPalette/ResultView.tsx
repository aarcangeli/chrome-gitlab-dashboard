import React, { KeyboardEvent, memo, useCallback, useEffect, useRef } from "react";
import { Result } from "@src/components/CommandPalette/command-palette-objects";
import { ActionList, Avatar } from "@primer/react";

type Props = { active: boolean; result: Result };

export const ResultView = memo((props: Props) => {
  const itemReference = useRef<HTMLLIElement>(undefined);

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

  useEffect(() => {
    if (props.active) {
      itemReference.current.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [props.active]);

  const onInputKeydown = useCallback((e: KeyboardEvent) => {
    // Eat tab key
    if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, []);

  return (
    <ActionList.Item ref={itemReference} active={props.active} onKeyDown={onInputKeydown} sx={styleOverride}>
      <ActionList.LeadingVisual>
        <Avatar src="https://github.com/mona.png" />
      </ActionList.LeadingVisual>
      {props.result.title}
      <ActionList.Description>{props.result.description}</ActionList.Description>
    </ActionList.Item>
  );
}, areEqual);
ResultView.displayName = "RenderItem";

function areEqual(prevProps: Props, nextProps: Props) {
  return prevProps.active === nextProps.active && prevProps.result === nextProps.result;
}
