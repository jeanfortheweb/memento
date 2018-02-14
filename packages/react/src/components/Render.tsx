import * as React from 'react';

export interface RenderFunction<TData> {
  (data: TData): React.ReactElement<any>;
}

export interface Props<TData> {
  data: TData;
  children?: RenderFunction<TData>;
}

const Render: React.SFC<Props<any>> = ({ children, data }) =>
  children ? (children as RenderFunction<any>)(data) : (data => data)(data);

export default Render;
