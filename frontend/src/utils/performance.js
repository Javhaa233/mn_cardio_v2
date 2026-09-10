/**
 * Performance Optimization Utilities
 * Helpers for memoization, debouncing, throttling, and lazy loading
 */

/* global IntersectionObserver, performance */

import { useRef, useEffect, useCallback, useMemo } from "react";
import i18n from "i18n";
import ReactDOM from "react-dom";

/**
 * Debounce function - delays execution until after wait time has passed
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function - limits execution to once per wait time
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * React hook for debounced value
 * @param {*} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {*} Debounced value
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * React hook for debounced callback
 * @param {Function} callback - Callback function
 * @param {number} delay - Delay in milliseconds
 * @param {Array} dependencies - Dependencies array
 * @returns {Function} Debounced callback
 */
export const useDebouncedCallback = (
  callback,
  delay = 300,
  dependencies = [],
) => {
  const timeoutRef = useRef(null);

  const depsString = useMemo(
    () => JSON.stringify(dependencies),
    [dependencies],
  );

  return useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callback, delay, depsString],
  );
};

/**
 * React hook for throttled callback
 * @param {Function} callback - Callback function
 * @param {number} limit - Time limit in milliseconds
 * @param {Array} dependencies - Dependencies array
 * @returns {Function} Throttled callback
 */
export const useThrottledCallback = (
  callback,
  limit = 300,
  dependencies = [],
) => {
  const inThrottleRef = useRef(false);

  const depsString = useMemo(
    () => JSON.stringify(dependencies),
    [dependencies],
  );

  return useCallback(
    (...args) => {
      if (!inThrottleRef.current) {
        callback(...args);
        inThrottleRef.current = true;
        setTimeout(() => {
          inThrottleRef.current = false;
        }, limit);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callback, limit, depsString],
  );
};

/**
 * React hook for previous value
 * @param {*} value - Current value
 * @returns {*} Previous value
 */
export const usePrevious = (value) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  // Return a function to get previous value to avoid accessing ref during render
  return useCallback(() => ref.current, []);
};

/**
 * React hook for comparing if value has changed
 * @param {*} value - Value to check
 * @returns {boolean} True if value has changed
 */
export const useHasChanged = (value) => {
  const getPrevValue = usePrevious(value);
  return getPrevValue() !== value;
};

/**
 * React hook for lazy initialization
 * @param {Function} initializer - Initializer function
 * @returns {*} Initialized value
 */
export const useLazyInit = (initializer) => {
  return useMemo(() => initializer(), [initializer]);
};

/**
 * React hook for intersection observer (lazy loading)
 * @param {Object} options - IntersectionObserver options
 * @returns {Array} [ref, isVisible]
 */
export const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current); // eslint-disable-line react-hooks/exhaustive-deps
      }
    };
  }, [options]);

  return [ref, isVisible];
};

/**
 * Memoization helper for expensive calculations
 * @param {Function} fn - Function to memoize
 * @returns {Function} Memoized function
 */
export const memoize = (fn) => {
  const cache = new Map();

  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Deep comparison for objects (useful for useMemo/useCallback dependencies)
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @returns {boolean} True if objects are equal
 */
export const deepEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
};

/**
 * React hook for deep comparison memo
 * @param {Function} factory - Factory function
 * @param {Array} deps - Dependencies
 * @returns {*} Memoized value
 */
export const useDeepMemo = (factory, deps) => {
  const depsString = useMemo(() => JSON.stringify(deps), [deps]);

  const result = useMemo(() => {
    const ref = { deps: undefined, result: undefined };

    if (!ref.deps || !deepEqual(ref.deps, deps)) {
      ref.deps = deps;
      ref.result = factory();
    }
    return ref.result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps, factory, deepEqual]);

  return result;
};

/**
 * Batch state updates helper
 * @param {Function} callback - Callback with state updates
 */
export const batchUpdates = (callback) => {
  if (typeof ReactDOM !== "undefined" && ReactDOM.unstable_batchedUpdates) {
    ReactDOM.unstable_batchedUpdates(callback);
  } else {
    callback();
  }
};

/**
 * Request idle callback wrapper
 * @param {Function} callback - Callback to execute when idle
 * @param {Object} options - Options
 * @returns {number} Request ID
 */
export const requestIdleCallback = (callback, options = {}) => {
  if ("requestIdleCallback" in window) {
    return window.requestIdleCallback(callback, options);
  }

  // Fallback for browsers that don't support requestIdleCallback
  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => 50,
    });
  }, 1);
};

/**
 * Cancel idle callback
 * @param {number} id - Request ID
 */
export const cancelIdleCallback = (id) => {
  if ("cancelIdleCallback" in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
};

/**
 * Performance measurement helper
 * @param {string} name - Measurement name
 * @param {Function} fn - Function to measure
 * @returns {*} Function result
 */
export const measure = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name} took ${(end - start).toFixed(2)}ms`);
  return result;
};

/**
 * React hook for performance measurement
 * @param {string} name - Component name
 */
export const usePerformanceMeasure = (name) => {
  useEffect(() => {
    const start = performance.now();

    return () => {
      const end = performance.now();
      console.log(`${name} render took ${(end - start).toFixed(2)}ms`);
    };
  });
};

export default {
  debounce,
  throttle,
  useDebounce,
  useDebouncedCallback,
  useThrottledCallback,
  usePrevious,
  useHasChanged,
  useLazyInit,
  useIntersectionObserver,
  memoize,
  deepEqual,
  useDeepMemo,
  batchUpdates,
  requestIdleCallback,
  cancelIdleCallback,
  measure,
  usePerformanceMeasure,
};
