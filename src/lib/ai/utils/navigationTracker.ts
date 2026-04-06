// lib/utils/navigationTracker.ts

type NavigationCallback = () => void;

class NavigationTracker {
  private callbacks: Map<string, NavigationCallback[]> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();
  private currentUrl: string = "";

  constructor() {
    if (typeof window !== "undefined") {
      this.currentUrl = this.getCurrentUrl();
      this.startTracking();
    }
  }

  private getCurrentUrl(): string {
    return window.location.pathname + window.location.search;
  }

  private normalizeUrl(url: string): string {
    return url.replace(/\/+$/, "").toLowerCase();
  }

  private startTracking() {
    const checkUrlChange = () => {
      const newUrl = this.getCurrentUrl();
      if (newUrl !== this.currentUrl) {
        this.currentUrl = newUrl;
        this.triggerCallbacks(newUrl);
      }
    };

    // Intercept pushState
    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      setTimeout(checkUrlChange, 50);
    };

    // Intercept replaceState
    const originalReplaceState = window.history.replaceState;
    window.history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      setTimeout(checkUrlChange, 50);
    };

    // Handle back/forward
    window.addEventListener("popstate", () => {
      setTimeout(checkUrlChange, 50);
    });
  }

  private triggerCallbacks(url: string) {
    const normalized = this.normalizeUrl(url);

    this.callbacks.forEach((callbacks, targetUrl) => {
      const normalizedTarget = this.normalizeUrl(targetUrl);

      if (
        normalized === normalizedTarget ||
        normalized.startsWith(normalizedTarget.split("?")[0])
      ) {
        const timeout = this.timeouts.get(targetUrl);
        if (timeout) clearTimeout(timeout);

        callbacks.forEach((cb) => cb());
        this.callbacks.delete(targetUrl);
        this.timeouts.delete(targetUrl);
      }
    });
  }

  public onNavigationComplete(targetUrl: string, callback: NavigationCallback) {
    const normalized = this.normalizeUrl(targetUrl);
    const current = this.normalizeUrl(this.currentUrl);

    if (
      current === normalized ||
      current.startsWith(normalized.split("?")[0])
    ) {
      setTimeout(callback, 0);
      return;
    }

    if (!this.callbacks.has(targetUrl)) {
      this.callbacks.set(targetUrl, []);
    }
    this.callbacks.get(targetUrl)!.push(callback);

    // Timeout fallback (3s)
    const timeout = setTimeout(() => {
      const cbs = this.callbacks.get(targetUrl);
      if (cbs) {
        cbs.forEach((cb) => cb());
        this.callbacks.delete(targetUrl);
        this.timeouts.delete(targetUrl);
      }
    }, 3000);

    this.timeouts.set(targetUrl, timeout);
  }

  public clearCallbacks(targetUrl: string) {
    const timeout = this.timeouts.get(targetUrl);
    if (timeout) clearTimeout(timeout);

    this.callbacks.delete(targetUrl);
    this.timeouts.delete(targetUrl);
  }
}

export const navigationTracker = new NavigationTracker();
