export {};

declare global {
  interface Window {
    electronAPI?: {
      dbQuery: (method: string, ...args: any[]) => Promise<any>;
      getWindowState: () => Promise<any>;
      onWindowStateChange: (Event) => Promise<any>;
    };
  }
}
