type Listener = (isLoading: boolean) => void;

class NavigationLoader {
  private listeners: Set<Listener> = new Set();
  private isLoading = false;
  private timeoutId: NodeJS.Timeout | null = null;

  start() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (!this.isLoading) {
      this.isLoading = true;
      this.notify();
    }

    this.timeoutId = setTimeout(() => {
      this.complete();
    }, 30000);
  }

  complete() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.isLoading) {
      this.isLoading = false;
      this.notify();
    }
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.isLoading));
  }
}

export const navigationLoader = new NavigationLoader();
