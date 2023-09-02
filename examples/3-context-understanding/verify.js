function verifyTask(task) {
  
  if (typeof task.title !== 'string' || task.title.length > 120) {
    throw new Error('Invalid title');
  }

  if (typeof task.position !== 'number' || task.position < 0) {
    throw new Error('Invalid position');
  }

  return true;
}

module.exports = { verifyTask };
