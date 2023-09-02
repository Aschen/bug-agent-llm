import { BugAgent } from "./BugAgent";

export async function handleErrorWithAgent (error: Error, options: { modify?: boolean, verbose?: boolean } = {}) {
  try {
    const agent = new BugAgent(error, { modify: options.modify, verbose: options.verbose });
    await agent.run();  
  }
  catch (error) {
    console.error('Error while running BugAgent');
    console.error(error);
  }
}