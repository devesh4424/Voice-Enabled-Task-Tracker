import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, setFilters } from '../store/slices/tasksSlice';
import TaskListItem from './TaskListItem';
import FilterBar from './FilterBar';
import './TaskList.css';

const TaskList = () => {
  const dispatch = useDispatch();
  const { items: tasks, loading, filters } = useSelector(state => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks(filters));
  }, [dispatch, filters]);

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  return (
    <div className="task-list-container">
      <FilterBar />
      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks found. Create a new task to get started!</p>
          </div>
        ) : (
          <table className="task-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <TaskListItem key={task._id} task={task} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TaskList;



