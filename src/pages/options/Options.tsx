import { Heading, Pagehead, PageLayout } from "@primer/react";
import React from "react";

export default function Options() {
  return (
    <PageLayout>
      {/* Left column */}
      <PageLayout.Pane position="start"></PageLayout.Pane>

      {/* Content */}
      <PageLayout.Content>
        <Pagehead>
          <Heading>Options</Heading>
        </Pagehead>
      </PageLayout.Content>
    </PageLayout>
  );
}
