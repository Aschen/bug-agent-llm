const fs = require('fs');

function generateId() {
  return Math.floor(Math.random() * 1000);
}

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

function writeTasksToFile(tasks) {
  fs.writeFileSync('./tasks.json', JSON.stringify(tasks));
}

function addTask(newTask) {
  const tasks = readTasksFromFile();
  tasks.push({ ...newTask, metadata: { id: generateId() } });
  writeTasksToFile(tasks);
  return newTask;
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