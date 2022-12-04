import { ActionList, Avatar } from "@primer/react";

export function WatchedProjects() {
  return (
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

      <ActionList.Group title="Ignored projects">
        <ActionList.Item selected={false} sx={{ borderRadius: 2 }}>
          <ActionList.LeadingVisual>
            <Avatar square src="https://github.com/hubot.png" />
          </ActionList.LeadingVisual>
          Zuru Home / Dreamcatcher / BIM
        </ActionList.Item>
        <ActionList.Item selected={false} sx={{ borderRadius: 2 }}>
          <ActionList.LeadingVisual>
            <Avatar square src="https://github.com/hubot.png" />
          </ActionList.LeadingVisual>
          Zuru Home / Dreamcatcher / BIM
        </ActionList.Item>
        <ActionList.Item selected={false} sx={{ borderRadius: 2 }}>
          <ActionList.LeadingVisual>
            <Avatar square src="https://github.com/hubot.png" />
          </ActionList.LeadingVisual>
          Zuru Home / Dreamcatcher / BIM
        </ActionList.Item>
      </ActionList.Group>
    </ActionList>
  );
}
