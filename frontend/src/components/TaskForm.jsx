import { useEffect, useState } from 'react';

const TaskForm = ({ onAdd, onUpdate, editingTask, onCancelEdit }) => {
  const isEditing = !!editingTask;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setError('');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [editingTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    if (title.trim().length > 255) {
      setError('Task title must be 255 characters or less');
      return;
    }

    if (!description.trim()) {
      setError('Task description is required');
      return;
    }

    if (description.trim().length > 1000) {
      setError('Task description must be 1000 characters or less');
      return;
    }

    try {
      if (isEditing) {
        await onUpdate(editingTask.id, { title: title.trim(), description: description.trim() });
      } else {
        await onAdd(title.trim(), description.trim());
      }
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      onCancelEdit();
    }
    setTitle('');
    setDescription('');
    setError('');
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h3>{isEditing ? 'Edit Task' : 'Add New Task'}</h3>

      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="task-title">Title</label>
        <input
          id="task-title"
          type="text"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={255}
        />
        <div className="char-count">
          {title.length}/255 characters
          {title.length > 250 && (
            <span className="warning">Approaching limit</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="task-description">Description</label>
        <textarea
          id="task-description"
          placeholder="Enter task description (required)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        <div className="char-count">
          {description.length}/1000 characters
          {description.length > 950 && (
            <span className="warning">Approaching limit</span>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {isEditing ? 'Save Changes' : 'Add Task'}
        </button>
        {(isEditing || title || description) && (
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;
