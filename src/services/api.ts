// Simulating an API layer for now
export const api = {
  get: async <T>(url: string): Promise<T> => {
    // In a real app, use axios or fetch here
    console.log(`Mock fetching ${url}`);
    return {} as T;
  }
};
