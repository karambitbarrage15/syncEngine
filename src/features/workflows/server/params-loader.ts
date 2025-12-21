import { createLoader } from "nuqs/server";
import type { SearchParams } from "nuqs";
import { workflowsParams } from "../params";

export const workflowsParamsLoader = createLoader(workflowsParams);
