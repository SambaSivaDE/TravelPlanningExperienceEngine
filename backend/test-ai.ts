import { extractIntentAndPlan } from './src/services/ai.service';
extractIntentAndPlan("berlin in august").then(console.log).catch(e => console.error("Vertex Error:", e.message));
