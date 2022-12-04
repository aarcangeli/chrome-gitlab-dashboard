import { render, screen } from "@testing-library/react";
import { Options } from "@pages/options/Options";
import { BaseStyles, ThemeProvider } from "@primer/react";
import React from "react";
import { setupIntersectionObserverMock, setupMatchMedia } from "@src/test-utils/test-utils";
import { debug } from "jest-preview";
import { expect } from "@jest/globals";

beforeAll(() => {
  setupMatchMedia();
  setupIntersectionObserverMock();
});

describe("appTest", () => {
  test("render text", () => {
    // when
    render(
      <ThemeProvider colorMode="auto">
        <BaseStyles>
          <Options />
        </BaseStyles>
      </ThemeProvider>
    );

    // then
    debug();
    expect(screen.getAllByText("Watched Projects")).toHaveLength(2);
  });
});
