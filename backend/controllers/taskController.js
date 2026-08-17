const asyncHandler = require('express-async-handler');
const { pool } = require('../config/db');

const getTasks = asyncHandler(async (req, res) => {
  const { search, filter } = req.query;

  let query = 'SELECT * FROM tasks WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (search && search.trim() !== '') {
    query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
    params.push(`%${search.trim()}%`);
    paramIndex++;
  }

  if (filter === 'completed') {
    query += ` AND completed = TRUE`;
  } else if (filter === 'incomplete') {
    query += ` AND completed = FALSE`;
  }

  query += ' ORDER BY created_at DESC';

  const result = await pool.query(query, params);
  res.json(result.rows);
});

const getTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Task not found');
  }

  res.json(result.rows[0]);
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || title.trim() === '') {
    res.status(400);
    throw new Error('Task title is required');
  }

  const cleanTitle = title.trim();
  const cleanDescription = description ? description.trim() : '';

  if (cleanTitle.length > 255) {
    res.status(400);
    throw new Error('Task title must be 255 characters or less');
  }

  const result = await pool.query(
    'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
    [cleanTitle, cleanDescription]
  );

  res.status(201).json(result.rows[0]);
});

const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  const existing = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    res.status(404);
    throw new Error('Task not found');
  }

  let cleanTitle = existing.rows[0].title;
  let cleanDescription = existing.rows[0].description;
  let cleanCompleted = existing.rows[0].completed;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      res.status(400);
      throw new Error('Task title is required');
    }
    if (title.trim().length > 255) {
      res.status(400);
      throw new Error('Task title must be 255 characters or less');
    }
    cleanTitle = title.trim();
  }

  if (description !== undefined) {
    cleanDescription = typeof description === 'string' ? description.trim() : '';
  }

  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      res.status(400);
      throw new Error('Completed must be a boolean value');
    }
    cleanCompleted = completed;
  }

  const result = await pool.query(
    'UPDATE tasks SET title = $1, description = $2, completed = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
    [cleanTitle, cleanDescription, cleanCompleted, id]
  );

  res.json(result.rows[0]);
});

const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    res.status(404);
    throw new Error('Task not found');
  }

  await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  res.json({ message: 'Task removed successfully', id: parseInt(id) });
});

const toggleTaskComplete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    res.status(404);
    throw new Error('Task not found');
  }

  const newCompleted = !existing.rows[0].completed;
  const result = await pool.query(
    'UPDATE tasks SET completed = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [newCompleted, id]
  );

  res.json(result.rows[0]);
});

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
};
