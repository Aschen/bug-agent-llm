# Cannot read properties of undefined (reading 'id')

```
TypeError: Cannot read properties of undefined (reading 'id')
    at createTask (/home/aschen/projects/stacktrace-explanator/examples/fix-two-files/app.js:20:49)
    at /home/aschen/projects/stacktrace-explanator/examples/fix-two-files/app.js:25:5
    at Layer.handle [as handle_request] (/home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/layer.js:95:5)
    at next (/home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/route.js:144:13)
    at Route.dispatch (/home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/route.js:114:3)
    at Layer.handle [as handle_request] (/home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/layer.js:95:5)
    at /home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/index.js:284:15
    at Function.process_params (/home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/index.js:346:12)
    at next (/home/aschen/projects/stacktrace-explanator/node_modules/express/lib/router/index.js:280:10)
    at /home/aschen/projects/stacktrace-explanator/node_modules/body-parser/lib/read.js:137:5
```

# Explanation

The error is happening because the code is trying to access the `id` property of `metadata` which is undefined. This is happening in the `createTask` function in the `app.js` file. The `metadata` property is not defined in the `newTask` object that is being passed to the `addTask` function in the `database.js` file. The `addTask` function is trying to add a `metadata` property with an `id` to the `newTask` object, but this is happening after the `createTask` function has already tried to access the `id` property of `metadata`.

## Fix Function "createTask" in file "/home/aschen/projects/stacktrace-explanator/examples/fix-two-files/app.js" with code: 
```js
function createTask (req, res) {
  const newTask = req.body;
  verifyTask(newTask);
  const savedTask = database.addTask(newTask);
  res.status(201).send(`Task ${savedTask.metadata.id} saved successfully`);
}
```

## Fix Function "addTask" in file "/home/aschen/projects/stacktrace-explanator/examples/fix-two-files/database.js" with code: 
```js
function addTask(newTask) {
  const tasks = readTasksFromFile();
  const taskWithId = { ...newTask, metadata: { id: generateId() } };
  tasks.push(taskWithId);
  writeTasksToFile(tasks);
  return taskWithId;
}
```
