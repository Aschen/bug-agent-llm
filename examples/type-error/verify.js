function verifyTask(task) {
  
  if (typeof task.title !== 'string' || task.title.length > 120) {
    throw new Error('Invalid title');
  }

  if (typeof task.position !== 'number' || task.position < 0) {
    throw new Error('Invalid position');
  }

  if (task.metadata.author.length > 120) {
    throw new Error('Invalid author');
  }

  return true;
}

module.exports = { verifyTask };
