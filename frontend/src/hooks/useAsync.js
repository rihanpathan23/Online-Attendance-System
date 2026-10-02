import { useState, useEffect, useCallback, useRef } from "react";

export default function useAsync(asyncFn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);

  // Always call the latest function, but only re-run when the deps' values change.
  const fnRef = useRef(asyncFn);
  fnRef.current = asyncFn;
  const depsKey = JSON.stringify(deps);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fnRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            data: null,
            loading: false,
            error: (err && err.message) || "Something went wrong. Please try again.",
          });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const setData = useCallback(
    (updater) =>
      setState((s) => ({
        ...s,
        data: typeof updater === "function" ? updater(s.data) : updater,
      })),
    []
  );

  return { ...state, reload, setData };
}