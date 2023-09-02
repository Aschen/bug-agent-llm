import { BugAgent } from './BugAgent';
import { stacktrace } from './examples/context-understanding/inputs';

async function main () {
  const agent = new BugAgent(stacktrace);
  await agent.run();
}

main()