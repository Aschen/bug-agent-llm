curl -X POST -H "Content-Type: application/json" -d '{
  "title": "Task Title",
  "position": 1,
  "metadata": {
    "author": "John Doe"
  }
}' http://localhost:3000/tasks