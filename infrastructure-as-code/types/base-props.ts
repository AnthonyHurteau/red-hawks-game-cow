import { Environment } from "./environments";
import { Region } from "./regions";

export interface BaseProps {
  region: Region;
  environment: Environment;
  appName: string;
  product: string;
}
