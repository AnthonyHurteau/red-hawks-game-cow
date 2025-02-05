import { Environment } from "./environments";
import { Region } from "./regions";
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AWS_ACCOUNT: string;
      AWS_REGION: string;
      ENVIRONMENT: Environment;
      REGION: Region;
      PRODUCT: string;
      ALLOWED_ORIGIN: string;
    }
  }
}
