import { render, screen } from "@testing-library/react";
import Options from "@pages/options/Options";

describe("appTest", () => {
  test("render text", () => {
    // given
    const text = "content view";

    // when
    render(<Options />);

    // then
    screen.getByText(text);
  });
});
