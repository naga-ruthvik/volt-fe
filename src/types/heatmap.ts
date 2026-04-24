export interface ActivityData {
  date: string;
  total: number;
  sources: {
    github: number;
    leetcode: number;
    codeforces?: number;
    [key: string]: number | undefined;
  };
}

export interface HeatmapData {
  [date: string]: ActivityData;
}
