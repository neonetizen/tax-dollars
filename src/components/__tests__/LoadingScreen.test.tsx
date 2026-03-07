import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingScreen } from "../LoadingScreen";

describe("LoadingScreen", () => {
  it("renders the loading heading", () => {
    render(<LoadingScreen loading={{ budget: true, cip: true }} />);
    expect(screen.getByRole("heading")).toHaveTextContent(
      /Loading San Diego city data/
    );
  });

  it("shows loading indicator for datasets still loading", () => {
    render(<LoadingScreen loading={{ budget: true, cip: false }} />);

    const labels = screen.getAllByText(/data/i);
    expect(labels.length).toBeGreaterThan(0);
  });

  it("shows checkmark for completed datasets", () => {
    const { container } = render(
      <LoadingScreen loading={{ budget: false, cip: false }} />
    );
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(2);
  });
});
