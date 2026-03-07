"use client";

import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";

interface UseDatasetResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export function useDataset<T = Record<string, string>>(
  url: string
): UseDatasetResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<T[] | null>(null);

  useEffect(() => {
    if (cacheRef.current) {
      setData(cacheRef.current);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchAndParse() {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${url}: ${response.status}`);
        }
        const text = await response.text();

        const result = Papa.parse<T>(text, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
        });

        if (!cancelled) {
          cacheRef.current = result.data;
          setData(result.data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load dataset"
          );
          setLoading(false);
        }
      }
    }

    fetchAndParse();
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error };
}
