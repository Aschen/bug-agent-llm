# Action:EXPLAIN_BUG
The error message "TypeError: Cannot read properties of undefined (reading 'id')" indicates that the code is trying to access the 'id' property of an undefined object. This error occurs in the 'app.js' file on line 18, which corresponds to the line `res.status(201).send(`Task ${savedTask.metadata.id} saved successfully`);`. 
The 'metadata' property of 'savedTask' is undefined, which is why the error is thrown when trying to access 'metadata.id'. The 'savedTask' object is returned by the 'addTask' function in the 'database.js' file. The 'addTask' function is supposed to add a 'metadata' property to the 'newTask' object, but it returns the original 'newTask' object instead of the modified one with the 'metadata' property. This is why 'metadata' is undefined when it is accessed in 'app.js'.
# end

# Action:FIX_BUG
filepath: examples/3-context-understanding/database.js
functionName: addTask
code:
```js
function addTask(newTask) {
  const tasks = readTasksFromFile();
  const taskWithMetadata = { ...newTask, metadata: { id: generateId() } };
  tasks.push(taskWithMetadata);
  writeTasksToFile(tasks);
  return taskWithMetadata;
}
```
# end