import { useEffect, useRef, useState } from "react";
import { useDebounce, useDebounceFactory } from "@src/utils/useDebounce";
import { useConstant } from "@src/utils/useConstant";

/**
 * Manages the pagination of the list of generic rows.
 * @param opts the options, see {@link UsePaginationParams}
 */
export function usePagination<T>(opts: UsePaginationParams<T>) {
  const loadingFn = opts.loadingFn;
  const loadingElement = opts.loadingElement;
  const preloadNext = useConstant(() => opts.preloadNext ?? false);
  const debounceTime = useConstant(() => opts.debounceTime ?? 200);

  const [loadPage, setLoadPage] = useState(1);
  const [rows, setRows] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);

  const availablePages = useRef<T[][]>([]);
  const isPageRequested = useRef(false);
  const loading = useRef(false);
  const isInitialSearch = useRef(true);

  const debounce = useDebounceFactory();

  function publishPageIfRequested() {
    if ((isPageRequested.current || loadPage === 1) && availablePages.current.length > 0) {
      console.log("publishing page");
      const page = availablePages.current.shift();
      console.assert(page.length > 0);
      setRows((prev) => [...prev, ...page]);
      isPageRequested.current = false;
      // When a page is published, we can load the next one
      if (preloadNext) {
        setLoadPage((prev) => prev + 1);
      }
    }
  }

  // Reset the page when the loading function changes
  useEffect(() => {
    console.log("Resetting pagination");
    setRows([]);
    setLoadPage(1);
    setHasMore(true);
    setError(false);
    availablePages.current = [];
  }, [loadingFn]);

  // Load the next page when the page changes
  useEffect(() => {
    console.log("Loading page", loadPage);
    const controller = new AbortController();
    loading.current = true;
    debounce(
      () => {
        loadingFn(loadPage, controller.signal)
          .then((returnedRows) => {
            console.log("Loaded page", loadPage, returnedRows);
            if (returnedRows.length > 0) {
              availablePages.current.push(returnedRows);
              publishPageIfRequested();
            } else {
              setHasMore(false);
            }
            loading.current = false;
          })
          .catch((e) => {
            loading.current = false;
            if (e.name === "AbortError") return;
            setHasMore(false);
            setError(true);
          });
      },
      !isInitialSearch.current && loadPage === 1 ? debounceTime : 0
    );
    isInitialSearch.current = false;
    return () => controller.abort();
    // eslint-disable-next-line
  }, [loadPage, loadingFn]);

  // Load the next page when the loading element is visible
  useEffect(() => {
    if (loadingElement) {
      const options = {
        root: null,
        rootMargin: "20px",
        threshold: 0,
      };
      const observer = new IntersectionObserver((entries) => {
        console.assert(entries.length === 1);
        isPageRequested.current = entries[0].isIntersecting;
        publishPageIfRequested();
        // when preload is disabled, load manually the next page
        if (!preloadNext && hasMore && isPageRequested.current && !loading.current) {
          setLoadPage((prev) => prev + 1);
        }
      }, options);
      observer.observe(loadingElement);
      return () => observer.disconnect();
    }
  }, [hasMore, loadingElement]);

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
  loadingElement: Element;

  /**
   * A method that returns a promise of a specific page of rows.
   * If this method changes, the results will be reloaded from the beginning.
   *
   * @param page the page to load, starting from 1
   * @param signal a signal that can be used to cancel the request
   */
  loadingFn: (page: number, signal: AbortSignal) => Promise<T[]>;

  /**
   * If true, the next is preloaded even if the pagination is not requested.
   */
  preloadNext?: boolean;

  debounceTime?: number;
}
