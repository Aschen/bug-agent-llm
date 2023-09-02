# Explanation
The error message `ENOENT: no such file or directory, open './tasks.json'` indicates that the file `tasks.json` does not exist in the current directory when the `readTasksFromFile` function is trying to read it. This error is thrown by the `fs.readFileSync` function.

# Fix
filename: database.js
function name: readTasksFromFile
code:
```js
function readTasksFromFile() {
  let tasksData = '[]';
  try {
    tasksData = fs.readFileSync('./tasks.json');
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('tasks.json not found, creating a new one.');
      fs.writeFileSync('./tasks.json', tasksData);
    } else {
      throw err;
    }
  }
  return JSON.parse(tasksData);
}
```
In this fix, we first initialize `tasksData` with an empty JSON array string. Then we try to read the file. 
If the file does not exist (error code `ENOENT`), we create a new one with the initial empty array string. If the error is something else, we throw it again.