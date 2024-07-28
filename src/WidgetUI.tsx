import React, { useEffect, useRef, useState } from 'react';
import { CustomWidgetProps, createWidgetUI, useOnParentEvent } from '@kemu-io/hs-react';
import WidgetContainer from '@kemu-io/hs-react/components/WidgetContainer.js';
import manifestJson from './manifest.json';
import { DrawingUtils, FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useDebouncedCallback } from 'use-debounce';
import { DataType } from '@kemu-io/hs-types';
import CircularProgress from '@mui/material/CircularProgress';
import { HAND_CONNECTIONS, InternalJsFileName, TaskFileName, WasamFileName } from './helpers/constants';
import { GetFilesResponse, UIActions } from './types/service_t';
import { css } from '@emotion/react';
import WidgetIcon from './components/WidgetIcon';
import CustomSvg from './components/CustomSvg';

const WidgetUI = (props: CustomWidgetProps) => {
  const { setOutputs, disabled, utils } =  props;
  const { getCachedFile, cacheFile, getCacheFilePath } = utils.browser;
  const canvasRef = useRef<OffscreenCanvas>(null);
  const contextRef = useRef<OffscreenCanvasRenderingContext2D>(null);
  const drawingUtilsRef = useRef<DrawingUtils>(null);
  const [model, setModel] = useState<HandLandmarker | null>(null);

  useOnParentEvent(async (event) => {
    // console.log('Detecting...');
    if(disabled) { return; }
    if(event.data.type === DataType.ImageData && model) {
      const imageData = event.data.value as ImageData;
      // const results = model?.detect(imageData);
      const results = model?.detectForVideo(imageData, Date.now());

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
        await setOutputs([
          {
            name: 'landmarks',
            type: DataType.JsonObj,
            value: {
              image: resultImageData,
              landmarks: results.landmarks as any,
              worldLandmarks: results.worldLandmarks as any,
              handedness: results.handedness as any,
            }
          }
        ]);
      }
    }
  });

  const loadModel = useDebouncedCallback(async () => {
    // console.log('Loading model');

    const taskResponse = await getCachedFile(TaskFileName);
    const wasamResponse = await getCachedFile(WasamFileName);
    const internalResponse = await getCachedFile(InternalJsFileName);

    const missingFiles = !taskResponse || !wasamResponse || !internalResponse;

    // Create a local cache for this files if not already cached
    if(missingFiles) {
      const { task, wasam, internalJs } = await props.callProcessorHandler<GetFilesResponse>(UIActions.GetFiles);
      const ct = 'Content-Type';
      await cacheFile(TaskFileName, task, new Headers({ [ct]: 'application/octet-stream' }));
      await cacheFile(WasamFileName, wasam, new Headers({ [ct]: 'application/wasm' }));
      await cacheFile(InternalJsFileName, internalJs, new Headers({ [ct]: 'application/javascript' }));
    }

    const cacheFilesPath = getCacheFilePath('').slice(0, -1); // Remove the trailing slash
    const modelAssetPath = `${cacheFilesPath}/${TaskFileName}`;
    const vision = await FilesetResolver.forVisionTasks(cacheFilesPath);
    const landmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath,
        delegate: 'GPU'
      },
      minHandDetectionConfidence: 0.4,
      minTrackingConfidence: 0.4,
      minHandPresenceConfidence: 0.4,
      runningMode: 'VIDEO',
      numHands: 2
    });

    canvasRef.current = new OffscreenCanvas(640, 480);
    contextRef.current = canvasRef.current.getContext('2d');
    drawingUtilsRef.current = new DrawingUtils(contextRef.current);

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
    <WidgetContainer
      css={css`
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
      `}
    >
      {model ? (
        <CustomSvg css={{ width: 32, height: 32 }}>
          <WidgetIcon />
        </CustomSvg>
      ): (
        <CircularProgress color="inherit" size={30} variant="indeterminate" />
      )}
    </WidgetContainer>
  );
};

export default createWidgetUI(WidgetUI, manifestJson.name, manifestJson.version) as ReturnType<typeof createWidgetUI>;
