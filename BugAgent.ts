import { writeFileSync, readFileSync } from 'fs';
import * as path from 'path';

import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';

export class BugAgent {
  private model = new OpenAI({
    modelName: 'gpt-4',
    temperature: 0.0,
    maxTokens: -1,
  });
  private promptTemplate = new PromptTemplate({
    template: `You are a developer trying to understand a bug.

    You will be given a stacktrace to understand the error.
    
    Stacktrace:
    {stacktrace}
        
    To understand correctly the bug, you also need to follow the code of the functions called by the user functions.
    Check the require statements in the user functions to know which files you need to read.    
    If you need to see the code of a function, you can use the following command:
    # Action:READ_CODE
    filepath: 
    functionName:
    # end

    User functions:
    {userFunctions}

    If you already read all the function or reach the entry point of the program which is the request received from the client in the express handler then you can analyze the bug.
    
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
    `,
    inputVariables: ['stacktrace', 'userFunctions']
  })
  private stacktrace: string;
  private userFunctions: string[] = []

  constructor (stacktrace) {
    this.stacktrace = stacktrace;
  }

  async run () {
    let i = 1;
    let done: boolean = false;

    while (!done) {
      const formated = await this.promptTemplate.format({ 
        stacktrace: this.stacktrace,
        userFunctions: this.userFunctions.join('\n'),
      });
      
      const textResponse = await this.model.call(formated);
      writeFileSync(`./prompt-${i++}.txt`, formated + '\n------\n' + textResponse);
      
      const sections = this.parseResponse(textResponse);

      for (const section of sections) {
        const { action, parameters } = section;
        const response = await this.executeAction(action, parameters);
        console.log(response);

        if (action === 'FIX_BUG') {
          done = true;
        }
      }
    }

    console.log('Bug fixed!')
  }

  executeAction (action, parameters) {
    switch (action) {
      case 'READ_CODE':
        console.log(`Read code of function "${parameters.functionName}" in file "${parameters.filepath}"`);
        const functionCode = this.readFunctionCode(parameters.filepath, parameters.functionName);
        const requireStatements = this.extractRequires(parameters.filepath);
        this.userFunctions.push(`file: ${parameters.filepath}
\`\`\`js
${requireStatements.join('\n')}

${functionCode}
\`\`\``);

        return `OK`;
      case 'EXPLAIN_BUG':
        return `Explanation: ${parameters.explanation}`;
      case 'FIX_BUG':
        return `Fix bug in function "${parameters.functionName}" in file "${parameters.filepath}" with code: ${parameters.code}`;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  parseResponse (textResponse) {
    const sectionPattern = /# Action:(.*?)\n([\s\S]*?)# end/g;
  
    const parameterPattern = /([^:\n]+):([^\n]*)/g;
  
    const sections: Array<{action: string, parameters: any}> = [];
  
    let match;
  
    while ((match = sectionPattern.exec(textResponse)) !== null) {
      const action = match[1].trim();
      const content = match[2].trim();
  
      const parameters = {};
      let paramMatch;
      while ((paramMatch = parameterPattern.exec(content)) !== null) {
        const paramName = paramMatch[1].trim();
        const paramValue = paramMatch[2].trim();
        parameters[paramName] = paramValue;
      }
  
      const codeBlockPattern = /```js([\s\S]*?)```/g;
      let codeBlockMatch = codeBlockPattern.exec(content);
      if (codeBlockMatch) {
        parameters["code"] = codeBlockMatch[1].trim();
      }
  
      const sectionData = { action, parameters };
      sections.push(sectionData);
    }
  
    return sections;
  }

  readFunctionCode(filePath, functionName) {
    try {
      // Read the content of the source file
      const sourceCode = readFileSync(filePath, 'utf-8');
  
      const ast = acorn.parse(sourceCode, { ecmaVersion: 'latest' });
  
      let targetFunctionCode: string|null = null;
  
      walk.simple(ast, {
        FunctionDeclaration(node: any) {
          if (node.id.name === functionName) {
            // Extract the source code of the target function
            targetFunctionCode = sourceCode.substring(node.start, node.end);
          }
        },
      });
  
      if (targetFunctionCode) {
        return targetFunctionCode;
      } else {
        throw new Error(`Function "${functionName}" not found in the source code.`);
      }
    } catch (error) {
      throw new Error(`Error reading or parsing the source file: ${error.message}`);
    }
  }

  extractRequires(filePath) {
    try {
      // Read the content of the source file
      const sourceCode = readFileSync(filePath, 'utf-8');
      const fileDir = path.dirname(filePath);
  
      // Parse the source code into an AST using Acorn
      const ast = acorn.parse(sourceCode, { ecmaVersion: 'latest' });
  
      const requireStatements: string[] = [];
  
      // Use Acorn's AST walking utility to find 'require' calls
      walk.simple(ast, {
        CallExpression(node: any) {
          if (
            node.callee.type === 'Identifier' &&
            node.callee.name === 'require' &&
            node.arguments.length === 1 &&
            node.arguments[0].type === 'Literal'
          ) {
            // Extract the module name from the 'require' statement
            const moduleName = node.arguments[0].value;
  
            // Resolve the relative path to the CWD
            const absolutePath = path.resolve(fileDir, moduleName);
  
            // Convert the absolute path back to a path relative to CWD
            const relativePath = path.relative(process.cwd(), absolutePath);
  
            requireStatements.push(`require('${relativePath}')`);
          }
        },
      });
  
      return requireStatements;
    } catch (error) {
      throw new Error(`Error reading or parsing the source file: ${error.message}`);
    }
  }
  
}
