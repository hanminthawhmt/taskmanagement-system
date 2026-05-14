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

const findAllTasks = async (filters = {}) => {
  const page = Math.max(1, parseInt(filters.page) || 1);
  const limit = Math.min(100, parseInt(filters.limit) || 20);

  const toArray = (val) => {
    if (!val) return undefined;
    const arr = Array.isArray(val) ? val : val.split(",").map((s) => s.trim());
    return arr.length ? arr : undefined;
  };

  const params = {
    search: filters.search?.trim() || undefined,
    status: toArray(filters.status),
    priority: toArray(filters.priority),
    tags: toArray(filters.tags),
    page,
    limit,
  };

  const { rows, total } = await taskRepository.getAllTask(params);

  return {
    data: rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
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
