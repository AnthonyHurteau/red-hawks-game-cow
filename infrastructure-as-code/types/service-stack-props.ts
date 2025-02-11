import { StackProps } from "./stack-props";

export interface ServiceStackProps extends StackProps {
  name: string;
  functionDir: string;
  allowedOrigins: string[];
}
