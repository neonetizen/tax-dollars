import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { VerdictPanel } from "../VerdictPanel";
import { AppProvider } from "@/context/AppContext";
import { renderHook, act } from "@testing-library/react";
import { useAppContext } from "@/context/AppContext";
import type { ReactNode } from "react";

function Wrapper({ children }: { children: ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}

describe("VerdictPanel", () => {
  it("renders nothing when no verdict and not loading", () => {
    const { container } = render(
      <AppProvider>
        <VerdictPanel />
      </AppProvider>
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows loading skeleton when verdictLoading is true", () => {
    const { result } = renderHook(() => useAppContext(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.dispatch({ type: "SET_VERDICT_LOADING", payload: true });
    });

    expect(result.current.state.verdictLoading).toBe(true);
  });

  it("displays verdict text when available", () => {
    const { result } = renderHook(() => useAppContext(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.dispatch({
        type: "SET_VERDICT",
        payload: "Your tax dollars fund essential services.",
      });
    });

    expect(result.current.state.verdict).toBe(
      "Your tax dollars fund essential services."
    );
  });
});
