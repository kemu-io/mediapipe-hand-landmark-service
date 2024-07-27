import React from 'react';
import { CustomWidgetProps, createWidgetUI } from '@kemu-io/hs-react';
import WidgetContainer from '@kemu-io/hs-react/components/WidgetContainer.js';
import manifestJson from './manifest.json';

const WidgetUI = (props: CustomWidgetProps) => {
  console.log('Rendered: ', props);

  return (
    <WidgetContainer>
      <button>Click Me</button>
    </WidgetContainer>
  );
};

export default createWidgetUI(WidgetUI, manifestJson.name, manifestJson.version) as ReturnType<typeof createWidgetUI>;
