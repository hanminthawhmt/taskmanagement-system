const taskService = require("../services/service");

const handleCreatingATask = async (req, res, next) => {
  try {
    if (!req.body.title) {
      return res.status(422).json({ error: "Task title is required" });
    }
    const task = await taskService.createATask(req.body);
    return res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const handleFindAllTasks = async (req, res, next) => {
  try {
    const result = await taskService.findAllTasks(req.query);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const handleFindATaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await taskService.findATaskById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task does not exist`,
      });
    }
    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const handdleUpdateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedTask = await taskService.updateTask(id, req.body);
    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: `Task does not exist`,
      });
    }
    return res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

const handleDeleteATask = async (req, res, next) => {
  try {
    const { id } = req.params;
    await taskService.deleteTask(id);
    return res.status(200).json({
      success: true,
      message: "A task has been successfuly deleted",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleCreatingATask,
  handleFindAllTasks,
  handleFindATaskById,
  handdleUpdateTask,
  handleDeleteATask,
};
