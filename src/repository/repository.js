const db = require("../database/db");
const createATask = async (
  title,
  description,
  status,
  priority,
  due_date,
  tags,
) => {
  const query = `
    INSERT INTO tasks (title, description, status, priority, due_date, tags)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `;
  const { rows } = await db.query(query, [
    title,
    description || null,
    status,
    priority,
    due_date || null,
    tags || null,
  ]);
  return rows[0];
};

const getAllTask = async () => {
  const query = `
    SELECT * FROM tasks
    `;
  const { rows } = await db.query(query);
  return rows;
};

const getATaskById = async (id) => {
  const query = `
    SELECT * FROM tasks WHERE id = $1
    `;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const updateATask = async (
  id,
  title,
  description,
  status,
  priority,
  due_date,
  tags,
) => {
  const query = `
    UPDATE tasks
    SET title = $1, description = $2, status = $3, priority = $4, due_date = $5, tags = $6
    WHERE id = $7
    RETURNING *
    `;
  const { rows } = await db.query(query, [
    title,
    description,
    status,
    priority,
    due_date,
    tags,
    id,
  ]);
  return rows[0];
};

const deleteTask = async (id) => {
  const query = `
  DELETE FROM tasks where id = $1
  RETURNING *
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

module.exports = {
  createATask,
  getAllTask,
  getATaskById,
  updateATask,
  deleteTask,
};
