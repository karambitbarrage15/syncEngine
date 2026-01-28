
import { credentialsRouter } from '@/features/credentials/server/router';
import { 
  createTRPCRouter ,protectedProcedure} from '../init'; 
  
import { workflowsRouter } from '@/features/workflows/server/router';
export const appRouter=createTRPCRouter({
  workflows:workflowsRouter,
  credentails:credentialsRouter,
});
export type AppRouter=typeof appRouter;