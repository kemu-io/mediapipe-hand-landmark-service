import createService from '@kemu-io/hs';
import { CustomServiceState } from './types/service_t.js';
import { DataType } from '@kemu-io/hs-types';
// import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
// import { createCanvas } from 'canvas';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const canvas = createCanvas(640, 480);
const service = new createService<CustomServiceState>();
service.start();

// let model: HandLandmarker;

service.onInitialize(async (context) => {
  /* const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
  );
  
  landmarker = await HandLandmarker.createFromModelPath(vision,
    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
  ); */

  /* const modelAssetPath = resolve(__dirname, 'libs');
  const taskAssetPath = `${modelAssetPath}/vision_wasm_internal.task`;
  const vision = await FilesetResolver.forVisionTasks(modelAssetPath);
  model = await HandLandmarker.createFromOptions(vision, {
    canvas: canvas as unknown as HTMLCanvasElement,
    baseOptions: {
      modelAssetPath: taskAssetPath,
      delegate: 'CPU'
    },
    runningMode: 'IMAGE',
    numHands: 2
  }); */
});

(async () => {
  service.onParentEvent(async (event, context) => {
    // console.log('Parent event:', event, context);

    // if(event.data.type === DataType.ImageData) {
    //   const imageData = event.data.value as ImageData;
    //   const result = model.detect(imageData);
    //   console.log('Results: ', result);

    //   return context.setOutputs([
    //     {
    //       name: 'output',
    //       type: DataType.ImageData,
    //       value: event.data.value
    //     }
    //   ]);
    // }

  });
})();
