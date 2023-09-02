const { OpenAI } = require('langchain/llms/openai');
const { PromptTemplate } = require('langchain/prompts');

const template = `You are a developer trying to understand a bug.

You will be given a stacktrace and the content of the user function from this stacktrace.

Stacktrace:
{stacktrace}

User functions:
{userFunctions}

You will need to give a short explanation of the bug?
You will also provide a fix to replace the faulty code. You don't have the full code of the file, so you will need to make assumptions.

You will format your answer like this:

# Explanation
// give a short explanation of the bug here

# Fix
filename: // give the filename of the file where the fix is
function name: // give the name of the function where the fix is
code:
\`\`\`js
// give the code of the fixed function here	
\`\`\`
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
  // const { stacktrace, userFunctions } = require('./examples/1-no-tasks-file/inputs.js')
  const { stacktrace, userFunctions } = require('./examples/2-type-error/inputs.js');
  
  const formated = await promptTemplate.format({ 
    stacktrace,
    userFunctions: userFunctions.join('\n'),
  });
  
  const response = await model.call(formated);

  console.log(response);
}

run()