import serverless from "serverless-http";
import { apiApp } from "../../src/server/apiApp";

export const handler = serverless(apiApp);
