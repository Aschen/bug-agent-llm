const stacktrace = `TypeError: Cannot read properties of undefined (reading 'length')
at verifyTask (/home/aschen/projects/stacktrace-explanator/examples/2-type-error/verify.js:11:28)       
at /home/aschen/projects/stacktrace-explanator/examples/2-type-error/app.js:16:3
at Layer.handle [as handle_request] (/home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/layer.js:95:5)
at next (/home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/route.js:144:13)   
at Route.dispatch (/home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/route.js:114:3)
at Layer.handle [as handle_request] (/home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/layer.js:95:5)
at /home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/index.js:284:15
at Function.process_params (/home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/index.js:346:12)
at next (/home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/index.js:280:10)   
at /home/aschen/projects/stacktrace-explanator/node_modules/body-parser/lib/read.js:137:5`;

const userFunctions = [];

userFunctions.push(`at verifyTask (/home/aschen/projects/stacktrace-explanator/examples/2-type-error/verify.js:11:28)
function verifyTask(task) {
  
  if (typeof task.title !== 'string' || task.title.length > 120) {
    throw new Error('Invalid title');
  }

  if (typeof task.position !== 'number' || task.position < 0) {
    throw new Error('Invalid position');
  }

  if (task.metadata.author.length > 120) {
    throw new Error('Invalid author');
  }

  return true;
}
`)

userFunctions.push(`at /home/aschen/projects/stacktrace-explanator/examples/2-type-error/app.js:16:3
app.post('/tasks', (req, res) => {
  const newTask = req.body;
  verifyTask(newTask);
  database.addTask(newTask);
  res.status(201).send('Task saved successfully');
});`)


module.exports = {
  stacktrace,
  userFunctions,
};