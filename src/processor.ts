import createService from '@kemu-io/hs';
import { CustomServiceState, GetFilesResponse, UIActions } from './types/service_t.js';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import { InternalJsFileName, TaskFileName, WasamFileName } from './helpers/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const service = new createService<CustomServiceState>();

const libsPath = resolve(__dirname, 'assets');
let wasamFile: ArrayBuffer | null = null;
let taskFile: ArrayBuffer | null = null;
let internalJsFile: ArrayBuffer | null = null;

const loadFiles = async () => {
  // Load model files
  const [wasam, task, internalJs] = await Promise.all([
    readFile(resolve(libsPath, WasamFileName)),
    readFile(resolve(libsPath, TaskFileName)),
    readFile(resolve(libsPath, InternalJsFileName)),
  ]);

  // Convert Buffer to Uint8Array
  wasamFile = wasam.buffer;
  taskFile = task.buffer;
  internalJsFile = internalJs.buffer;
};

// Allows the UI to load files directly from the processor
service.onUIEvent<UIActions, any>(async (context, name) => {
  if(!wasamFile || !taskFile || !internalJsFile) {
    await loadFiles();
  }

  if(name === UIActions.GetFiles) {
    const response: GetFilesResponse = {
      task: taskFile!,
      wasam: wasamFile!,
      internalJs: internalJsFile!,
    };

    return response;
  }
});

service.onParentEvent(async () => {
  console.log('Ignoring parent event');
});


await loadFiles();
await service.start();
