import { render, screen } from "@testing-library/react";
import Options from "@pages/options/Options";

describe("appTest", () => {
  test("render text", () => {
    // when
    render(<Options />);

    // then
    screen.getByText("Options");
  });
});
