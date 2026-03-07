import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InputForm } from "../InputForm";
import { AppProvider } from "@/context/AppContext";

function renderInputForm(onSubmit = vi.fn()) {
  return render(
    <AppProvider>
      <InputForm onSubmit={onSubmit} />
    </AppProvider>
  );
}

describe("InputForm", () => {
  it("renders ZIP code and assessed value inputs", () => {
    renderInputForm();
    expect(screen.getByLabelText(/ZIP Code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Assessed Property Value/i)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    renderInputForm();
    expect(
      screen.getByRole("button", { name: /See My Tax Receipt/i })
    ).toBeInTheDocument();
  });

  it("disables submit button when value is empty", () => {
    renderInputForm();
    const button = screen.getByRole("button", { name: /See My Tax Receipt/i });
    expect(button).toBeDisabled();
  });

  it("enables submit button when value is entered", () => {
    renderInputForm();
    const input = screen.getByLabelText(/Assessed Property Value/i);
    fireEvent.change(input, { target: { value: "650000" } });

    const button = screen.getByRole("button", { name: /See My Tax Receipt/i });
    expect(button).not.toBeDisabled();
  });

  it("shows error for value below minimum", () => {
    const onSubmit = vi.fn();
    renderInputForm(onSubmit);

    const input = screen.getByLabelText(/Assessed Property Value/i);
    fireEvent.change(input, { target: { value: "1000" } });
    fireEvent.submit(screen.getByRole("button", { name: /See My Tax Receipt/i }));

    expect(
      screen.getByText(/Please enter a value between/)
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows error for value above maximum", () => {
    const onSubmit = vi.fn();
    renderInputForm(onSubmit);

    const input = screen.getByLabelText(/Assessed Property Value/i);
    fireEvent.change(input, { target: { value: "10000000" } });
    fireEvent.submit(screen.getByRole("button", { name: /See My Tax Receipt/i }));

    expect(
      screen.getByText(/Please enter a value between/)
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with valid value", () => {
    const onSubmit = vi.fn();
    renderInputForm(onSubmit);

    const input = screen.getByLabelText(/Assessed Property Value/i);
    fireEvent.change(input, { target: { value: "650000" } });
    fireEvent.submit(screen.getByRole("button", { name: /See My Tax Receipt/i }));

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("strips non-numeric characters from ZIP input", () => {
    renderInputForm();
    const zipInput = screen.getByLabelText(/ZIP Code/i) as HTMLInputElement;
    fireEvent.change(zipInput, { target: { value: "92a10b1" } });
    expect(zipInput.value).toBe("92101");
  });
});
