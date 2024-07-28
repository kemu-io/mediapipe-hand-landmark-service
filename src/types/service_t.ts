export type CustomServiceState = {
  value: number;
}

export const enum UIActions {
  GetFiles = 'get-files',
}

export type GetFilesResponse = {
  task: ArrayBuffer;
  wasam: ArrayBuffer;
  internalJs: ArrayBuffer;
}
