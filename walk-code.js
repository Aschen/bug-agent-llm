const fs = require('fs');
const acorn = require('acorn');
const walk = require('acorn-walk');

const { OpenAI } = require('langchain/llms/openai');
const { PromptTemplate } = require('langchain/prompts');

const template = `You are a developer trying to understand a bug.

You will be given a stacktrace and the content of the user function from this stacktrace.

Stacktrace:
{stacktrace}

User functions:
{userFunctions}

To understand correctly the bug, you also need to follow the code of the functions called by the user functions.
If you need to see the code of a function, you can use the following command:
# Action:READ_CODE
filepath: 
functionName:
# end

If you reach the entry point of the program which is the request received from the client in the express handler then you can analyze the bug.

You will need to give a short explanation of the bug.
You will also provide a fix to replace the faulty code. 
Try to fix the bug as soon as it occur in the function call flow. 
You don't have the full code of the file, so you will need to make assumptions.

You will format your answer like this:

# Action:EXPLAIN_BUG
// give a short explanation of the bug here
# end

# Action:FIX_BUG
filepath: // give the path of the file where the fix is
functionName: // give the name of the function where the fix is
code:
\`\`\`js
// give the code of the fixed function here	
\`\`\`
# end
`

const promptTemplate = new PromptTemplate({
  template,
  inputVariables: ['stacktrace', 'userFunctions'],
});

const model = new OpenAI({
  modelName: 'gpt-4',
  temperature: 0.0,
  maxTokens: -1,
});

async function run ()  {
  const { stacktrace, userFunctions } = require('./examples/3-context-understanding/inputs.js');
  
  const formated = await promptTemplate.format({ 
    stacktrace,
    userFunctions: userFunctions.join('\n'),
  });
  
  const response = await model.call(formated);

  console.log(response);
}
