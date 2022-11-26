import {Avatar, Box, IssueLabelToken, Link, Tooltip} from "@primer/react";
import {IssueOpenedIcon} from "@primer/octicons-react";
import "./IssueInfo.scss";

interface IssueDesc {
  title: string;
  link?: string;
}

export default function IssueInfo(props: IssueDesc) {
  return (
    <Box display="flex" flexDirection="row" borderColor="border.default" borderBottomWidth={1} borderBottomStyle="solid" sx={{gap: 2}} my={2} pb={2}>
      {/* Icon column */}
      <Box display="flex" flexDirection="column" py={1}>
        <IssueOpenedIcon size="small"/>
      </Box>

      {/* Content column*/}
      <Box display="flex" flexDirection="column" flexGrow={1} className="min-width-zero" sx={{gap: 1}}>
        <Box flexGrow="1" className="min-width-zero truncate-text">
          <Link href={props.link} target="_blank" sx={{fontWeight: "bold"}}>
            {props.title}
          </Link>
        </Box>
        <Box display="flex" sx={{gap: 2}}>
          <IssueLabelToken text="Default Token"/>
          <IssueLabelToken text="Todo" fillColor="white"/>
        </Box>
      </Box>

      {/* Right side */}
      <Box>
        <Link target="_blank" href="https://gitlab.com/">
          <Tooltip aria-label="Assignee: Nome Cognome" direction="nw" noDelay={true} sx={{display: "block"}}>
            <Avatar src="https://avatars.githubusercontent.com/primer" sx={{display: "block"}}/>
          </Tooltip>
        </Link>
      </Box>
    </Box>
  );
}
