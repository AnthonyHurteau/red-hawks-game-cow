import { BaseProps } from "../types/base-props";

export const resourceName = (baseProps: BaseProps, name: string) =>
  `${baseProps.product}-${name}-${baseProps.region}-${baseProps.environment}`;

export const awsResourceNames = () => {
  return {
    apigw: "apigw",
    function: "function",
    table: "table",
    stack: "stack",
    stage: "stage",
    bucket: "bucket",
    distribution: "distribution",
  };
};
