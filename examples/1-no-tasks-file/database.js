const fs = require('fs');

function readTasksFromFile() {
  const tasksData = fs.readFileSync('./tasks.json');
  return JSON.parse(tasksData);
}

function writeTasksToFile(tasks) {
  fs.writeFileSync('./tasks.json', JSON.stringify(tasks));
}

function addTask(newTask) {
  const tasks = readTasksFromFile();
  tasks.push(newTask);
  writeTasksToFile(tasks);
}

function updateTask(taskId, updatedTask) {
  const tasks = readTasksFromFile();
  const taskIndex = tasks.findIndex((task) => task.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex] = updatedTask;
    writeTasksToFile(tasks);
  }
}

function deleteTask(taskId) {
  const tasks = readTasksFromFile();
  const taskIndex = tasks.findIndex((task) => task.id === taskId);
  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1);
    writeTasksToFile(tasks);
  }
}

module.exports = {
  readTasksFromFile,
  writeTasksToFile,
  addTask,
  updateTask,
  deleteTask,
};