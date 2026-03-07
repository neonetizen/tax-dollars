import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Disclaimer } from "../Disclaimer";

describe("Disclaimer", () => {
  it("renders the disclaimer heading", () => {
    render(<Disclaimer />);
    expect(screen.getByText("About this estimate")).toBeInTheDocument();
  });

  it("mentions Tax Rate Area and Mello-Roos", () => {
    render(<Disclaimer />);
    expect(screen.getByText(/Tax Rate Area/)).toBeInTheDocument();
    expect(screen.getByText(/Mello-Roos/)).toBeInTheDocument();
  });

  it("links to San Diego Open Data Portal", () => {
    render(<Disclaimer />);
    const link = screen.getByRole("link", { name: /San Diego Open Data Portal/i });
    expect(link).toHaveAttribute("href", "https://data.sandiego.gov");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("links to City of San Diego Budget", () => {
    render(<Disclaimer />);
    const link = screen.getByRole("link", { name: /City of San Diego Budget/i });
    expect(link).toHaveAttribute("href", "https://www.sandiego.gov/finance/budget");
  });
});
