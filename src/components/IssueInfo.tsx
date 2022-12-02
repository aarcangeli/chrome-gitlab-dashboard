import { Avatar, Box, IssueLabelToken, Link, Tooltip } from "@primer/react";
import { CommentDiscussionIcon, GitPullRequestIcon, IssueOpenedIcon, ThumbsdownIcon, ThumbsupIcon } from "@primer/octicons-react";
import "./IssueInfo.scss";
import { CommonItemSummary, IssueSummary } from "@src/services/GitLabApi";
import { LabelService } from "@src/services/LabelService";
import { useEffect, useState } from "react";

export enum ItemType {
  Issue,
  MergeRequest,
}

interface Props {
  item: CommonItemSummary;
  type: ItemType;
  labelService?: LabelService;
}

export function IssueInfo(props: Props) {
  const item = props.item;
  const [labelColors, setLabelColors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (props.labelService) {
      Promise.all(item.labels.map((label) => props.labelService.getLabelColor(item.project_id, label))).then((colors) => {
        const object: Record<string, string> = {};
        item.labels.forEach((label, index) => {
          object[label] = colors[index];
        });
        setLabelColors(object);
      });
    }
  }, []);

  return (
    <Box display="flex" flexDirection="row" borderColor="border.default" borderBottomWidth={1} borderBottomStyle="solid" sx={{ gap: 2 }} my={2} pb={2}>
      {/* Icon column */}
      <Box display="flex" flexDirection="column" py={1}>
        {props.type === ItemType.Issue ? <IssueOpenedIcon size="small" /> : <GitPullRequestIcon size="small" />}
      </Box>

      {/* Content column*/}
      <Box display="flex" flexDirection="column" flexGrow={1} className="min-width-zero" sx={{ gap: 1 }}>
        <Box display="flex" sx={{ gap: 2 }}>
          <Link href={item.web_url} target="_blank" sx={{ fontWeight: "bold" }} className="min-width-zero truncate-text">
            <Box flexGrow="1" display="inline">
              {item.references.short} {item.title}
            </Box>
          </Link>
        </Box>
        <Box display="flex" sx={{ gap: 2 }} flexWrap="wrap">
          {item.labels.map((label) => (
            <IssueLabelToken key={label} text={label} fillColor={labelColors[label]} size="small" />
          ))}
        </Box>
      </Box>

      {/* Right side */}
      <Box display="flex" alignItems="flex-start" sx={{ gap: 2 }}>
        {item.assignees.map((assigne) => (
          <Tooltip key={assigne.id} aria-label={`Assignee: ${assigne.name}`} direction="nw" noDelay={true} sx={{ display: "block" }}>
            <Link target="_blank" href={assigne.web_url}>
              <Avatar src={assigne.avatar_url} sx={{ display: "block" }} />
            </Link>
          </Tooltip>
        ))}
        <Box>
          <Tooltip aria-label="Comments" direction="nw" sx={{ whiteSpace: "nowrap" }}>
            <CommentDiscussionIcon size="small" verticalAlign="middle" /> {item.user_notes_count}
          </Tooltip>
        </Box>
        {props.type === ItemType.Issue && (item as IssueSummary).merge_requests_count > 0 && (
          <Box>
            <Tooltip aria-label="Merge requests" direction="nw" sx={{ whiteSpace: "nowrap" }}>
              <GitPullRequestIcon size="small" verticalAlign="middle" /> {(item as IssueSummary).merge_requests_count}
            </Tooltip>
          </Box>
        )}
        <Box>
          <Tooltip aria-label={`Up votes`} direction="nw" sx={{ whiteSpace: "nowrap" }}>
            <ThumbsupIcon aria-label="Up votes" size="small" verticalAlign="middle" /> {item.upvotes}
          </Tooltip>
        </Box>
        <Box>
          <Tooltip aria-label={`Down votes`} direction="nw" sx={{ whiteSpace: "nowrap" }}>
            <ThumbsdownIcon size="small" verticalAlign="middle" /> {item.downvotes}
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}
