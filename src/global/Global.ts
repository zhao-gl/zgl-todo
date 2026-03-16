type PriorityLevel = 0 | 1 | 2 | 3 | 4;
interface PriorityInfo {
  name: string;
  color: string;
}
export const PRIORITY_MAP: Record<PriorityLevel, PriorityInfo> = {
  0: {name: 'P0', color: 'rgba(245, 34, 45, 0.5)'},
  1: {name: 'P1', color: 'rgba(250, 140, 22, 0.5)'},
  2: {name: 'P2', color: 'rgba(250, 219, 20, 0.5)'},
  3: {name: 'P3', color: 'rgba(160, 217, 17, 0.5)'},
  4: {name: 'P4', color: 'rgba(82, 196, 26, 0.5)'}
}
