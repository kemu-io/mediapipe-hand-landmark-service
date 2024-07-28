import { Connection } from '../types/visionCore.js';


/**
 * An array containing the pairs of hand landmark indices to be rendered with
 * connections.
 */
export const HAND_CONNECTIONS: Connection[] = [
  { start: 0, end: 1 },   { start: 1, end: 2 },   { start: 2, end: 3 },
  { start: 3, end: 4 },   { start: 0, end: 5 },   { start: 5, end: 6 },
  { start: 6, end: 7 },   { start: 7, end: 8 },   { start: 5, end: 9 },
  { start: 9, end: 10 },  { start: 10, end: 11 }, { start: 11, end: 12 },
  { start: 9, end: 13 },  { start: 13, end: 14 }, { start: 14, end: 15 },
  { start: 15, end: 16 }, { start: 13, end: 17 }, { start: 0, end: 17 },
  { start: 17, end: 18 }, { start: 18, end: 19 }, { start: 19, end: 20 }
];


export const TaskFileName = 'vision_wasm_internal.task';
export const WasamFileName = 'vision_wasm_internal.wasm';
export const InternalJsFileName = 'vision_wasm_internal.js';
