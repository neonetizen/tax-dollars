"use client";

import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import type { InputFormProps } from "@/types";

export function InputForm({ onSubmit }: InputFormProps) {
  const { dispatch } = useAppContext();
  const [valueInput, setValueInput] = useState("");
  const [zipInput, setZipInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(valueInput.replace(/[,$]/g, ""));
    if (isNaN(parsed) || parsed < 50000 || parsed > 5000000) return;

    dispatch({
      type: "SET_INPUT",
      payload: { assessedValue: parsed, zipCode: zipInput.trim() },
    });
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-6">
      <div>
        <label
          htmlFor="assessedValue"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Property Assessed Value ($)
        </label>
        <input
          id="assessedValue"
          type="text"
          inputMode="numeric"
          value={valueInput}
          onChange={(e) => setValueInput(e.target.value)}
          placeholder="e.g. 650,000"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <p className="mt-1 text-sm text-gray-500">
          Enter a value between $50,000 and $5,000,000
        </p>
      </div>

      <div>
        <label
          htmlFor="zipCode"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          ZIP Code <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          id="zipCode"
          type="text"
          inputMode="numeric"
          value={zipInput}
          onChange={(e) => setZipInput(e.target.value)}
          placeholder="e.g. 92101"
          maxLength={5}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <button
        type="submit"
        disabled={!valueInput}
        className="w-full rounded-lg bg-navy-800 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Calculate My Receipt
      </button>
    </form>
  );
}
