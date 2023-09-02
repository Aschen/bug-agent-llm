import { writeFileSync, readFileSync, mkdirSync, appendFileSync } from 'fs';
import * as path from 'path';

import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import * as escodegen from 'escodegen';

import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';

function kebabCase(inputString) {
  return inputString.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    .replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
}

export class BugAgent {
  private model = new OpenAI({
    modelName: 'gpt-4',
    temperature: 0.0,
    maxTokens: -1,
  });
  private promptTemplate = new PromptTemplate({
    template: `You are a developer trying to understand a bug.

    You will be given a stacktrace to understand the error. 
    Before trying to understand the bug you need to read the code of all the user functions called.
    
    Stacktrace:
    {stacktrace}
        
    You need to read all the user function code that are used from the first function referenced by the stacktrace.
    For each user function, note the name of every function that is called and read the code of these functions. 
    Check the require statements in the user functions to know which files you need to read.    
    To read the code of a function, you can use the following command:
    # Action:READ_CODE
    filepath: 
    functionName:
    # end

    User Functions:
    {userFunctions}

    Once you have read the code of all the functions referenced in every User Function, 
    you can understand the bug with the entire context.
    
    You will need to give a short explanation of the bug.
    You will also provide a fix for the bug. 
    Try to fix the bug as soon as it occur in the function call flow. 
    You don't have the full code of the file, so you will need to make assumptions.
    You may have to modify functions in different files to fix the bug.

    You will format your answer like this:

    # Action:EXPLANATION
    explanation: // give a short explanation of the bug here
    # end
        
    # Action:FIX_FUNCTIONS
    filepath: // give the path of the file where the fix is
    functionName: // give the name of the function where the fix is
    code:
    \`\`\`js
    // give only the entire code of the fixed function here. do not add require statements
    \`\`\`
    # end
    `,
    inputVariables: ['stacktrace', 'userFunctions']
  })
  private userFunctions: string[] = []
  private error: Error;
  private reportPath: string;
  private verbose: boolean;
  private modify: boolean;
  private debug: boolean = true;

  constructor (error: Error, options?: { modify?: boolean, verbose?: boolean }) {
    if (!error.stack) {
      throw new Error('Error must have a stacktrace');
    }

    this.error = error;

    const reportsDir = './reports';
    mkdirSync(reportsDir, { recursive: true });

    this.reportPath = `${reportsDir}/${kebabCase(error.message)}.md`
    writeFileSync(this.reportPath, `# ${error.message}\n\n${error.stack}\n\n`);

    this.modify = options?.modify ?? false;
    this.verbose = options?.verbose ?? false;
  }

  async run () {
    let i = 1;
    let done: boolean = false;

    if (this.verbose) {
      console.log(`BugAgent: Starting to fix the bug "${this.error.message}"`);
    }

    while (!done) {
      const formated = await this.promptTemplate.format({ 
        stacktrace: this.error.stack,
        userFunctions: this.userFunctions.join('\n----------\n'),
      });
      
      const textResponse = await this.model.call(formated);
      
      if (this.debug) {
        writeFileSync(`./prompt-${i++}.txt`, formated + '\n------\n' + textResponse);
      }
      
      const sections = this.parseResponse(textResponse);

      for (const { action, parameters } of sections) {
        await this.executeAction(action, parameters);

        if (action === 'FIX_FUNCTIONS') {
          done = true;
        }
      }
    }

    if (this.verbose) {
      console.log(`BugAgent: Bug report available in ${this.reportPath}`)
    }
  }

  executeAction (action, parameters) {
    switch (action) {
      case 'READ_CODE':
        if (this.verbose) {
          console.log(`BugAgent: Read code of function "${parameters.functionName}" in file "${parameters.filepath}"`)
        }

        const functionCode = this.readFunctionCode(parameters.filepath, parameters.functionName);
        const requireStatements = this.extractRequiresStatements(parameters.filepath);
        this.userFunctions.push(`file: ${parameters.filepath}
functionName: ${parameters.functionName}
\`\`\`js
${requireStatements.join('\n')}

${functionCode}
\`\`\``);

        break;
      case 'EXPLANATION':
        if (this.verbose) {
          console.log(`BugAgent: Explanation of the bug: ${parameters.explanation}`)
        }
        appendFileSync(this.reportPath, `# Explanation\n\n${parameters.explanation}\n\n`);
        break;

      case 'FIX_FUNCTIONS':    
        const cleanCode = this.cleanFunctionCode(parameters.code);
        appendFileSync(this.reportPath, `## Fix Function "${parameters.functionName}" in file "${parameters.filepath}" with code: \n${cleanCode}\n\n`);

        if (this.modify) {
          if (this.verbose) {
            console.log(`BugAgent: Fixing bug in function "${parameters.functionName}" in file "${parameters.filepath}"`)
          }

          this.replaceFunctionCode(parameters.filepath, parameters.functionName, cleanCode);
        }
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  cleanFunctionCode (functionCode) {
    return functionCode.replace(/.*require\(.+\);?/g, '')
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
}

  extractRequiresStatements(filePath) {
    const jsCode = readFileSync(filePath, 'utf-8');

    const requirePattern = /const\s+([\w\s,{}]+)\s+=\s+require\(['"]\.(\/[^'"]+)['"]\);?/g;

    const localRequireStatements: string[] = [];
    let match;
    
    while ((match = requirePattern.exec(jsCode)) !== null) {
      localRequireStatements.push(match[0]);
    }
    return localRequireStatements;
  }

  replaceFunctionCode(filePath, functionName, newFunctionCode) {
    const sourceCode = readFileSync(filePath, 'utf-8');

    const ast = acorn.parse(sourceCode, { ecmaVersion: 'latest' });

    walk.simple(ast, {
      FunctionDeclaration(node: any) {
        if (node.id.name === functionName) {
          let newNode: any = acorn.parse(newFunctionCode, { ecmaVersion: 'latest' });
          node.body = newNode.body[0].body;
        }
      },
    });

    const updatedCode = escodegen.generate(ast);

    writeFileSync(filePath, updatedCode, 'utf-8');
  }
}
