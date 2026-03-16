
import { credentialsRouter } from '@/features/credentials/server/router';
import { 
  createTRPCRouter ,protectedProcedure} from '../init'; 
  
import { workflowsRouter } from '@/features/workflows/server/router';
import { exec } from 'child_process';
import { executionsRouter } from '@/features/executions/server/router';
export const appRouter=createTRPCRouter({
  workflows:workflowsRouter,
  credentails:credentialsRouter,
  executions:executionsRouter,
});
export type AppRouter=typeof appRouter;