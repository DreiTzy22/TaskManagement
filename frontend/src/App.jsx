import { useEffect, useMemo, useState } from 'react';
import './App.css';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import SearchFilterBar from './components/SearchFilterBar';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
} from './services/taskApi';

function App() {
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingTask, setEditingTask] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadTasks = async (currentSearch = search, currentFilter = filter) => {
    try {
      setLoading(true);
      setError('');
      const [filtered, all] = await Promise.all([
        fetchTasks(currentSearch, currentFilter),
        fetchTasks('', 'all'),
      ]);
      setTasks(filtered);
      setAllTasks(all);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
      showNotification(err.message || 'Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadTasks(search, filter);
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [search, filter]);

  const counts = useMemo(() => {
    return {
      all: allTasks.length,
      incomplete: allTasks.filter((t) => !t.completed).length,
      completed: allTasks.filter((t) => t.completed).length,
    };
  }, [allTasks]);

  const handleAdd = async (title, description) => {
    try {
      const newTask = await createTask(title, description);
      setTasks((prev) => [newTask, ...prev]);
      setAllTasks((prev) => [newTask, ...prev]);
      showNotification('Task added successfully');
    } catch (err) {
      showNotification(err.message || 'Failed to add task', 'error');
    }
  };

  const handleToggle = async (id) => {
    try {
      const updated = await toggleTaskComplete(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setAllTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      showNotification(
        updated.completed ? 'Task marked as completed' : 'Task marked as incomplete'
      );
    } catch (err) {
      showNotification(err.message || 'Failed to toggle task', 'error');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    document.getElementById('task-title')?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async (id, data) => {
    try {
      const updated = await updateTask(id, data);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setAllTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setEditingTask(null);
      showNotification('Task updated successfully');
    } catch (err) {
      showNotification(err.message || 'Failed to update task', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setAllTasks((prev) => prev.filter((t) => t.id !== id));
      showNotification('Task deleted successfully');
    } catch (err) {
      showNotification(err.message || 'Failed to delete task', 'error');
    }
  };

  return (
    <div className="app">
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <h1>Task Manager</h1>
          </div>
          <p className="subtitle">Organize, track, and complete your tasks</p>
        </div>
      </header>

      <main className="app-main">
        <section className="panel">
          <TaskForm
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            editingTask={editingTask}
            onCancelEdit={handleCancelEdit}
          />
        </section>

        <section className="panel">
          <SearchFilterBar
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
            counts={counts}
          />

          <div style={{ marginTop: '1.5rem' }}>
            <TaskList
              tasks={tasks}
              loading={loading}
              error={error}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>Task Management Application &mdash; Built with React, Express &amp; PostgreSQL</p>
      </footer>
    </div>
  );
}

export default App;
