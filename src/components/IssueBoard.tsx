import { CommonItemSummary } from "@src/services/GitLabApi";
import React, { useEffect, useState } from "react";
import { Box, Heading, Link, Spinner } from "@primer/react";
import { ChevronDownIcon, ChevronRightIcon } from "@primer/octicons-react";
import { IssueInfo, ItemType } from "@pages/popup/IssueInfo";

interface Props {
  isInitiallyExpanded?: boolean;
  title: string;
  type: ItemType;
  onLoad: () => Promise<CommonItemSummary[]>;

  /** The component is updated everytime this value is changed */
  refreshVersion?: number;
}

export function IssueBoard(props: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(props.isInitiallyExpanded ?? true);
  const [issues, setIssues] = useState<CommonItemSummary[]>([]);

  useEffect(() => {
    let valid = true;
    setIsLoading(true);

    props.onLoad().then((data) => {
      if (valid) {
        setIssues(data);
        setIsLoading(false);
      }
    });

    return () => {
      valid = false;
      setIssues([]);
    };
  }, [props.refreshVersion]);

  return (
    <>
      <Heading sx={{ fontSize: 1, mb: 2 }}>
        <Link as="button" muted={true} onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />} {props.title} ({issues.length})
        </Link>
      </Heading>

      {/* Spinner */}
      {isLoading && (
        <Box display="flex" justifyContent="center" py="5">
          <Spinner />
        </Box>
      )}

      {isExpanded && (
        <Box pb={2}>
          {issues.map((issue) => (
            <IssueInfo key={issue.id} type={props.type} item={issue} />
          ))}
        </Box>
      )}
    </>
  );
}
