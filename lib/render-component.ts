import ReactDOMServer from 'react-dom/server';
import React from 'react';

export function renderComponentToString(component: React.ReactElement): string {
  return ReactDOMServer.renderToString(component);
}
