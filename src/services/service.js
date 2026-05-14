const taskRepository = require("../repository/repository");

const createATask = async (data) => {
  const { title, description, status, priority, due_date, tags } = data;
  const task = await taskRepository.createATask(
    title,
    description,
    status,
    priority,
    due_date,
    tags,
  );
  return task;
};

const findAllTasks = async () => {
  return await taskRepository.getAllTask();
};

const findATaskById = async (id) => {
  return await taskRepository.getATaskById(id);
};

const updateTask = async (id, data) => {
  const { title, description, status, priority, due_date, tags } = data;
  return await taskRepository.updateATask(
    id,
    title,
    description,
    status,
    priority,
    due_date,
    tags,
  );
};

const deleteTask = async (id) => {
  const task = findATaskById(id);
  if (!task) {
    const error = new Error(`Task with ID ${id} not found`);
    error.status = 404;
    throw error;
  }
  return await taskRepository.deleteTask(id);
};
module.exports = {
  createATask,
  findAllTasks,
  findATaskById,
  updateTask,
  deleteTask,
};
