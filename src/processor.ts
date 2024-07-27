import createService from '@kemu-io/hs';
import { CustomServiceState } from './types/service_t.js';
import { DataType } from '@kemu-io/hs-types';

const service = new createService<CustomServiceState>();
service.start();

(async () => {
  service.onParentEvent(async (event, context) => {
    console.log('Parent event:', event, context);
    return context.setOutputs([
      {
        name: 'output',
        type: DataType.ImageData,
        value: event.data.value
      }
    ]);
  });
})();
