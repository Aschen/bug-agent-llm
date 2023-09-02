# Cannot read properties of undefined (reading 'id')

```
TypeError: Cannot read properties of undefined (reading 'id')
    at createTask (/home/aschen/projects/stacktrace-explanator/examples/context-understanding/app.js:20:51)
    at /home/aschen/projects/stacktrace-explanator/examples/context-understanding/app.js:25:5
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

The error is a TypeError: Cannot read properties of undefined (reading `id`). This error is thrown when you try to access a property of an undefined object. In this case, the error is thrown in the createTask function when trying to access the `id` property of `savedTask.metadata`. The `savedTask` is returned from the `addTask` function in the `database.js` file. The `addTask` function returns the `newTask` object that is passed as an argument, but the `newTask` object does not have a `metadata` property. Therefore, when trying to access `savedTask.metadata.id`, `savedTask.metadata` is undefined, and the error is thrown.

## Fix Function "addTask" in file "/home/aschen/projects/stacktrace-explanator/examples/context-understanding/database.js" with code: 
```js
function addTask(newTask) {
  const tasks = readTasksFromFile();
  const taskWithMetadata = { ...newTask, metadata: { id: generateId() } };
  tasks.push(taskWithMetadata);
  writeTasksToFile(tasks);
  return taskWithMetadata;
}
```
