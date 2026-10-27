import '@testing-library/jest-dom/vitest'

// jsdom has no matchMedia; provide a minimal, controllable stub.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

// IntersectionObserver is used by framer-motion's whileInView.
if (typeof window !== 'undefined' && typeof window.IntersectionObserver !== 'function') {
  class IO {
    constructor(private cb: IntersectionObserverCallback) {}
    observe = (el: Element) => {
      this.cb([{ isIntersecting: true, target: el } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
    }
    unobserve = () => {}
    disconnect = () => {}
    takeRecords = () => []
    root = null
    rootMargin = ''
    thresholds = []
  }
  Object.defineProperty(window, 'IntersectionObserver', { writable: true, value: IO })
}

// jsdom defines these but throws "not implemented"; replace with no-ops.
Element.prototype.scrollIntoView = () => {}
window.scrollTo = () => {}
