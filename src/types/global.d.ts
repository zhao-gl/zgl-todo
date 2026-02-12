export {};

declare global {
  interface Window {
    electronAPI?: {
      dbQuery: (method: string, params?: any) => Promise<any>;
    };
  }
}
