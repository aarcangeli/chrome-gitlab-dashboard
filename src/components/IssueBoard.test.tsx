import { render, screen } from "@testing-library/react";
import { IssueBoard } from "@src/components/IssueBoard";
import { ItemType } from "@pages/popup/IssueInfo";
import { CommonItemSummary } from "@src/services/GitLabApi";
import { expect, test } from "@jest/globals";
import preview from "jest-preview";
import { act, Simulate } from "react-dom/test-utils";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("IssueBoard", () => {
  test("ensure the component is spawned", async () => {
    // setup
    await act(async () => {
      render(<IssueBoard title="Test title" type={ItemType.Issue} onLoad={async () => []} />);
    });

    // then
    preview.debug();
    screen.getByText("Test title (0)");
  });

  test("ensure the load callback is invoked", async () => {
    // setup
    let loadRequests = 0;
    const mockLoader = async (): Promise<CommonItemSummary[]> => {
      loadRequests++;
      return [];
    };

    // create a mock issue board
    await act(async () => {
      render(<IssueBoard title="Title" type={ItemType.Issue} onLoad={mockLoader} />);
    });
    preview.debug();
    await sleep(100);

    // verify
    expect(loadRequests).toBe(1);
  });
});
