declare module 'swagger-ui-react' {
  import type { FC } from 'react';

  export interface SwaggerUIProps {
    spec?: Record<string, unknown>;
    [key: string]: unknown;
  }

  const SwaggerUI: FC<SwaggerUIProps>;
  export default SwaggerUI;
}
