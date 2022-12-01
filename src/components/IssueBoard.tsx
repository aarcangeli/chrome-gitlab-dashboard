import { CommonItemSummary, MergeRequestSummary } from "@src/services/GitLabApi";
import React, { useEffect, useRef, useState } from "react";
import { Box, Heading, Link, Spinner } from "@primer/react";
import { ChevronDownIcon, ChevronRightIcon } from "@primer/octicons-react";
import { IssueInfo, ItemType } from "@pages/popup/IssueInfo";
import { CacheKey, CacheStorage } from "@src/services/CacheStorage";

interface Props {
  isInitiallyExpanded?: boolean;
  title: string;
  id?: string;
  type: ItemType;
  onLoad: () => Promise<CommonItemSummary[]>;

  /** The component is updated everytime this value is changed */
  refreshVersion?: number;
}

export function IssueBoard(props: Props) {
  const cacheKey = useRef(new CacheKey<MergeRequestSummary[]>(props.id, []));
  const cacheStorage = useRef(new CacheStorage());

  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(props.isInitiallyExpanded ?? true);
  const [issues, setIssues] = useState<CommonItemSummary[]>(() => cacheStorage.current.get(cacheKey.current));

  useEffect(() => {
    let valid = true;
    setIsLoading(true);

    props.onLoad().then((data) => {
      if (valid) {
        setIssues(data);
        setIsLoading(false);
        cacheStorage.current.set(cacheKey.current, data);
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
        {isLoading && (
          <Box display="inline-block" sx={{ verticalAlign: "middle" }} ml={2} height="16px">
            <Spinner size="small" />
          </Box>
        )}
      </Heading>

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
