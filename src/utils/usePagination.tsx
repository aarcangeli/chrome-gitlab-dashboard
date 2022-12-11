import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@src/utils/useDebounce";
import { useConstant } from "@src/utils/useConstant";
import { GitLabApi, PaginatedResult } from "@src/services/GitLabApi";

/**
 * Manages the pagination of the list of generic rows.
 * @param opts the options, see {@link UsePaginationParams}
 */
export function usePagination<T>(opts: UsePaginationParams<T>) {
  const debounceTime = useConstant(() => opts.debounceTime ?? 300);

  // incremented every time a page is requested
  const [loadNext, setLoadNext] = useState(0);

  // rows visible on the UI
  const [rows, setRows] = useState<T[]>([]);

  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);

  const isPageRequested = useRef(false);
  const loading = useRef(false);
  const isInitialSearch = useRef(true);
  const lastPage = useRef<PaginatedResult<T>>(null);
  const nextPage = useRef<PaginatedResult<T>>(null);

  function publishPageIfRequested() {
    const next = nextPage.current;
    if ((isPageRequested.current || !lastPage.current) && next) {
      setRows((prev) => [...prev, ...next.items]);
      setHasMore(() => Boolean(next.nextPageLink));
      if (next.nextPageLink) {
        lastPage.current = next;
        setLoadNext((prev) => prev + 1);
      }
      nextPage.current = null;
    }
  }

  // Reset the page when the loading function changes
  useEffect(() => {
    setRows([]);
    setHasMore(true);
    setError(false);
    lastPage.current = null;
    nextPage.current = null;
  }, [opts.loadingFn]);

  // Load the next page when the page changes
  const debounce = useDebounce();
  useEffect(() => {
    const controller = new AbortController();
    loading.current = true;
    debounce(
      () => {
        const promise = lastPage.current ? opts.gitlabApi.fetchNextPage(lastPage.current) : opts.loadingFn(controller.signal);
        promise
          .then((returnedRows) => {
            nextPage.current = returnedRows;
            publishPageIfRequested();
            loading.current = false;
          })
          .catch((e) => {
            loading.current = false;
            if (e.name === "AbortError") return;
            setHasMore(false);
            setError(true);
          });
      },
      // Debounce the search
      !isInitialSearch.current && !lastPage.current ? debounceTime : 0
    );
    isInitialSearch.current = false;
    return () => controller.abort();
    // eslint-disable-next-line
  }, [loadNext, opts.loadingFn]);

  // Load the next page when the loading element is visible
  useEffect(() => {
    if (opts.loadingElement) {
      const options = {
        root: null,
        rootMargin: "20px",
        threshold: 0,
      };
      const observer = new IntersectionObserver((entries) => {
        console.assert(entries.length === 1);
        isPageRequested.current = entries[0].isIntersecting;
        publishPageIfRequested();
      }, options);
      observer.observe(opts.loadingElement);
      return () => observer.disconnect();
    }
  }, [hasMore, opts.loadingElement]);

  return {
    rows,
    hasMore,
    error,
  };
}

interface UsePaginationParams<T> {
  /**
   * The element which triggers the loading of the next page.
   * It must be visible only when hasMore is true.
   */
  loadingElement?: Element;

  /**
   * A method that returns a promise of a specific page of rows.
   * If this method changes, the results will be reloaded from the beginning.
   *
   * @param signal a signal that can be used to cancel the request
   */
  loadingFn: (signal: AbortSignal) => Promise<PaginatedResult<T>>;

  /**
   * The GitLab API to use to fetch the next page.
   */
  gitlabApi: GitLabApi;

  debounceTime?: number;
}
