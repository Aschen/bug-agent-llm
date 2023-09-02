const express = require('express');

const database = require('./database');
const { verifyTask } = require('./verify');

const app = express();
app.use(express.json());

app.get('/tasks', (req, res) => {
  const tasks = database.readTasksFromFile();
  res.json(tasks);
});

app.post('/tasks', (req, res) => {
  const newTask = req.body;
  verifyTask(newTask);
  database.addTask(newTask);
  res.status(201).send('Task saved successfully');
});

app.put('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const updatedTask = req.body;
  database.updateTask(taskId, updatedTask);
  res.status(200).send('Task updated successfully');
});

app.delete('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  database.deleteTask(taskId);
  res.status(200).send('Task deleted successfully');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});