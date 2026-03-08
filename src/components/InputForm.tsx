"use client";

import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import type { InputFormProps } from "@/types";

export function InputForm({ onSubmit }: InputFormProps) {
  const { dispatch } = useAppContext();
  const [valueInput, setValueInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsed = parseFloat(valueInput.replace(/[,$]/g, ""));
    if (isNaN(parsed) || parsed < 50000 || parsed > 5000000) {
      setError("Please enter a value between $50,000 and $5,000,000");
      return;
    }

    dispatch({
      type: "SET_INPUT",
      payload: { assessedValue: parsed },
    });
    onSubmit(parsed, "");
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-6">
      <div>
        <label
          htmlFor="assessedValue"
          className="mb-1.5 block text-sm font-semibold text-sd-navy"
        >
          Assessed Property Value ($)
        </label>
        <input
          id="assessedValue"
          type="text"
          inputMode="numeric"
          value={valueInput}
          onChange={(e) => setValueInput(e.target.value)}
          placeholder="e.g. 650,000"
          className="w-full rounded-lg border border-gray-200 bg-sd-bg px-4 py-3 text-lg text-sd-navy transition-all placeholder:text-sd-text-muted/50 focus:border-sd-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-sd-blue/25"
        />
      </div>

      {error && (
        <p className="text-sm font-medium text-red-600">{error}</p>
      )}

      <p className="text-sm text-sd-text-muted">
        Enter your property&apos;s assessed value (between $50,000 and $5,000,000).
        Find it on your annual assessment notice from the San Diego County Assessor.
      </p>

      <button
        type="submit"
        disabled={!valueInput}
        className="w-full rounded-lg bg-sd-gold px-6 py-3.5 text-lg font-bold text-sd-navy shadow-md transition-all hover:bg-sd-gold-dark hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        See My Tax Receipt
      </button>
    </form>
  );
}
