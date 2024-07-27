import React, { useEffect, useRef, useState } from 'react';
import { CustomWidgetProps, createWidgetUI, useOnParentEvent } from '@kemu-io/hs-react';
import WidgetContainer from '@kemu-io/hs-react/components/WidgetContainer.js';
import manifestJson from './manifest.json';
import { DrawingUtils, FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useDebouncedCallback } from 'use-debounce';
import { DataType } from '@kemu-io/hs-types';
import { HAND_CONNECTIONS } from './helpers/constants';

const WidgetUI = (props: CustomWidgetProps) => {
  const { setOutputs } =  props;
  const canvasRef = useRef<OffscreenCanvas>(null);
  const contextRef = useRef<OffscreenCanvasRenderingContext2D>(null);
  const drawingUtilsRef = useRef<DrawingUtils>(null);

  const [model, setModel] = useState<HandLandmarker | null>(null);
  console.log('Rendered: ', props);

  useOnParentEvent(async (event) => {
    // console.log('Detecting...');
    if(event.data.type === DataType.ImageData && model) {
      const imageData = event.data.value as ImageData;
      const results = model?.detect(imageData);

      if(results.landmarks.length && contextRef.current && canvasRef.current) {
        if(imageData.width !== canvasRef.current.width || imageData.height !== canvasRef.current.height) {
          canvasRef.current.width = imageData.width;
          canvasRef.current.height = imageData.height;
        }

        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        for (const landmarks of results.landmarks) {
          drawingUtilsRef.current.drawConnectors(landmarks, HAND_CONNECTIONS, {
            color: '#00FF00',
            lineWidth: 3,
          });

          drawingUtilsRef.current.drawLandmarks(landmarks, { color: '#FF0000', lineWidth: 1, radius: 2 });
        }

        const resultImageData = contextRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        await setOutputs([{
          name: 'image',
          type: DataType.ImageData,
          value: resultImageData
        }]);
      }
    }
  });

  const loadModel = useDebouncedCallback(async () => {
    console.log('Loading model');
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
    );

    // TODO: Allow loading files from the processor
    // Maybe just calling a processor function?
    const landmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate: 'GPU'
      },
      runningMode: 'IMAGE',
      numHands: 2
    });

    canvasRef.current = new OffscreenCanvas(640, 480);
    contextRef.current = canvasRef.current.getContext('2d');
    drawingUtilsRef.current = new DrawingUtils(contextRef.current);

    // const landmarker = await HandLandmarker.createFromModelPath(vision,
    //   'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
    // );

    setModel(landmarker);
  });

  useEffect(() => {
    loadModel();

    return () => {
      loadModel.cancel();
      setModel((m) => {
        m?.close();
        return null;
      });
    };
  }, []);

  return (
    <WidgetContainer>
      {model ? (
        <span>OK</span>
      ): (
        <span>Loading</span>
      )}
    </WidgetContainer>
  );
};

export default createWidgetUI(WidgetUI, manifestJson.name, manifestJson.version) as ReturnType<typeof createWidgetUI>;
