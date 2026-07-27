import { useState, useCallback } from 'react';

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAsyncReturn<T> extends UseAsyncState<T> {
  execute: () => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for managing async operations
 * Handles loading, error, and retry states automatically
 * 
 * @param asyncFn - Async function to execute
 * @param autoExecute - Whether to execute on mount (default: true)
 * @returns State and methods for managing async operation
 * 
 * @example
 * const { data, loading, error, retry } = useAsync(
 *   () => EventsService.getAllEvents(),
 *   true
 * );
 */
export function useAsync<T>(
  asyncFn: () => Promise<T>,
  autoExecute: boolean = true
): UseAsyncReturn<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: autoExecute,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });

    try {
      const result = await asyncFn();
      setState({ data: result, loading: false, error: null });
    } catch (err) {
      const anyErr = err as any;
      const errorMessage = anyErr?.response?.data?.message || anyErr?.message || 'An unexpected error occurred';

      setState({ data: null, loading: false, error: errorMessage });
    }
  }, [asyncFn]);

  const retry = useCallback(async () => {
    await execute();
  }, [execute]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  // Auto-execute on mount if enabled
  if (autoExecute && state.loading && !state.data && !state.error) {
    // Execute only once on mount
    const executeOnce = async () => {
      await execute();
    };
    executeOnce();
  }

  return { ...state, execute, retry, reset };
}

/**
 * Hook for handling form submissions with loading and error states
 * Useful for forms, buttons, and async actions
 * 
 * @param onSubmit - Async function to execute on submit
 * @returns State and submit handler
 * 
 * @example
 * const { loading, error, handleSubmit } = useAsyncAction(
 *   async (data) => {
 *     await AuthService.signup(data);
 *     navigate('/dashboard');
 *   }
 * );
 */
export function useAsyncAction(
  onSubmit: (data?: any) => Promise<void>
): {
  loading: boolean;
  error: string | null;
  handleSubmit: (data?: any) => Promise<void>;
  reset: () => void;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (data?: any) => {
      setLoading(true);
      setError(null);

      try {
        await onSubmit(data);
      } catch (err) {
        const anyErr = err as any;
        const errorMessage = anyErr?.response?.data?.message || anyErr?.message || 'An unexpected error occurred';

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [onSubmit]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { loading, error, handleSubmit, reset };
}
