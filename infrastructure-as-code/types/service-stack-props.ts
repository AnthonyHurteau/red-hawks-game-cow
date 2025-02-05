import { StackProps } from "./stack-props";

export interface ServiceStackProps extends StackProps {
  name: string;
  allowedOrigins: string[];
}
