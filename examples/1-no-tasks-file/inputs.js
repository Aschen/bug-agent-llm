const stacktrace = `Error: ENOENT: no such file or directory, open './tasks.json'
at Object.openSync (node:fs:601:3)
at Object.readFileSync (node:fs:469:35)
at readTasksFromFile (/home/aschen/projects/stacktrace-explanator/database.js:4:24)
at Object.addTask (/home/aschen/projects/stacktrace-explanator/database.js:13:17)
at /home/aschen/projects/stacktrace-explanator/app.js:17:12
at Layer.handle [as handle_request] (/home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/layer.js:95:5)
at next (/home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/route.js:144:13)   
at Route.dispatch (/home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/route.js:114:3)
at Layer.handle [as handle_request] (/home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/layer.js:95:5)
at /home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/index.js:284:15
`;

const userFunctions = [];

userFunctions.push(`at readTasksFromFile (/home/aschen/projects/stacktrace-explanator/database.js:4:24)
function readTasksFromFile() {
  const tasksData = fs.readFileSync('./tasks.json');
  return JSON.parse(tasksData);
}
`)

userFunctions.push(`at Object.addTask (/home/aschen/projects/stacktrace-explanator/database.js:13:17)
function addTask(newTask) {
  const tasks = readTasksFromFile();
  tasks.push(newTask);
  writeTasksToFile(tasks);
}
`)

userFunctions.push(`at /home/aschen/projects/stacktrace-explanator/app.js:17:12
app.post('/tasks', (req, res) => {
  const newTask = req.body;
  verifyTask(newTask);
  database.addTask(newTask);
  res.status(201).send('Task saved successfully');
});
`);

module.exports = {
  stacktrace,
  userFunctions,
};