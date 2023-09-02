# BugAgent

This agent use Generative AI to determine the cause of an error and suggest a fix.

The agent will start from the stacktrace and then read the code of every function involved to get more context. Then it will explain the error and suggest a fix.

The fix can be automatically made in-place.

## Usage

Import the agent and catch an error with the `handleErrorWithAgent` function.

```js
app.post('/tasks', (req, res) => {
  try {
    createTask(req, res);
  }  
  catch (error) {
    handleErrorWithAgent(error, { modify: true, verbose: true });
    throw error;
  }
});
```

## Example 1: error with context in 2 different files

This error is caused by accessing a property that does not exists on a object.  
The property is accessed in the `createTask` function of `app.js` but is set in the `addTask` function of `database.js`.

The agent successfully suggest to return an updated task including the new property.

```js
// app.js
function createTask (req, res) {
  const newTask = req.body;
  verifyTask(newTask);
  const savedTask = database.addTask(newTask);
  res.status(201).send(`Task ${savedTask.metadata.id} saved successfully`);
}
// database.js
function addTask(newTask) {
  const tasks = readTasksFromFile();
  tasks.push({ ...newTask, metadata: { id: generateId() } });
  writeTasksToFile(tasks);
  return newTask;
}
```

## Example 2: error that need a fix in 2 different files

The error is more or less the same but this time we need to update the 2 functions in order to solve it.

```js
// app.js
function createTask (req, res) {
  const newTask = req.body;
  verifyTask(newTask);
  database.addTask(newTask);
  res.status(201).send(`Task ${newTask.metadata.id} saved successfully`);
}
// database.js
function addTask(newTask) {
  const tasks = readTasksFromFile();
  tasks.push({ ...newTask, metadata: { id: generateId() } });
  writeTasksToFile(tasks);
}
```
