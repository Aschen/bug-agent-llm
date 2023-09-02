# Explanation
The error is a TypeError that occurs when trying to read the 'length' property of undefined. This error is thrown in the `verifyTask` function, specifically when trying to access `task.metadata.author.length`. This suggests that either `task.metadata` or `task.metadata.author` is undefined.

# Fix
filename: verify.js
function name: verifyTask
code:
```js
function verifyTask(task) {

  if (typeof task.title !== 'string' || task.title.length > 120) {
    throw new Error('Invalid title');
  }

  if (typeof task.position !== 'number' || task.position < 0) {
    throw new Error('Invalid position');
  }

  if (task.metadata && task.metadata.author && task.metadata.author.length > 120) {
    throw new Error('Invalid author');
  }

  return true;
}
```
In this fix, before trying to access `task.metadata.author.length`, we first check if `task.metadata` and `task.metadata.author` are defined. This prevents the TypeError from being thrown.