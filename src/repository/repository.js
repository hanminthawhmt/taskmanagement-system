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

const getAllTask = async ({ search, status, priority, tags, page, limit }) => {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (search) {
    conditions.push(`(title ILIKE $${idx} OR description ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx++;
  }

  if (status?.length) {
    conditions.push(`status = ANY($${idx}::task_status[])`);
    values.push(status);
    idx++;
  }

  if (priority?.length) {
    conditions.push(`priority = ANY($${idx}::task_priority[])`);
    values.push(priority);
    idx++;
  }

  if (tags?.length) {
    conditions.push(`tags && $${idx}::varchar[]`);
    values.push(tags);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const offset = (page - 1) * limit;

  const dataQuery = `
    SELECT * FROM tasks
    ${where}
    ORDER BY created_at DESC
    LIMIT $${idx} OFFSET $${idx + 1}
  `;
  const countQuery = `SELECT COUNT(*) FROM tasks ${where}`;

  const [{ rows }, { rows: countRows }] = await Promise.all([
    db.query(dataQuery, [...values, limit, offset]),
    db.query(countQuery, values),
  ]);

  return { rows, total: parseInt(countRows[0].count, 10) };
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
