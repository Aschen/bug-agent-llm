const stacktrace = `TypeError: Cannot read properties of undefined (reading 'id')
at createTask (/home/aschen/projects/stacktrace-explanator/examples/3-context-understanding/app.js:18:51)
at Layer.handle [as handle_request] (/home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/layer.js:95:5)
at next (/home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/route.js:144:13)
at Route.dispatch (/home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/route.js:114:3)
at Layer.handle [as handle_request] (/home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/layer.js:95:5)
at /home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/index.js:284:15
at Function.process_params (/home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/index.js:346:12)
at next (/home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/index.js:280:10)
at /home/aschen/projects/stacktrace-explanator/node_modules/body-parser/lib/read.js:137:5
at AsyncResource.runInAsyncScope (node:async_hooks:203:9)`;

const userFunctions = [];

userFunctions.push(`file: examples/3-context-understanding/app.js
const express = require('express');
const database = require('./database');
const { verifyTask } = require('./verify');

app.post('/tasks', (req, res) => {
  const newTask = req.body;
  verifyTask(newTask);
  const savedTask = database.addTask(newTask);
  res.status(201).send(\`Task \$\{savedTask.metadata.id\} saved successfully\`);
});
`)

// userFunctions.push(`file: examples/3-context-understanding/verify.js)
// function verifyTask(task) {
  
//   if (typeof task.title !== 'string' || task.title.length > 120) {
//     throw new Error('Invalid title');
//   }

//   if (typeof task.position !== 'number' || task.position < 0) {
//     throw new Error('Invalid position');
//   }

//   return true;
// }
// `)

// userFunctions.push(`file: examples/3-context-understanding/database.js
// function addTask(newTask) {
//   const tasks = readTasksFromFile();
//   tasks.push({ ...newTask, metadata: { id: generateId() } });
//   writeTasksToFile(tasks);
//   return newTask;
// }`)


module.exports = {
  stacktrace,
  userFunctions,
};