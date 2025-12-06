import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { FaTrash, FaEdit, FaExclamationCircle } from 'react-icons/fa';
import { deleteTask } from '../store/slices/tasksSlice';
import TaskFormModal from './TaskFormModal';
import './TaskListItem.css';

const TaskListItem = ({ task }) => {
  const dispatch = useDispatch();
  const [showEditModal, setShowEditModal] = useState(false);

  const priorityColors = {
    Low: '#28a745',
    Medium: '#ffc107',
    High: '#fd7e14',
    Critical: '#dc3545'
  };

  const statusColors = {
    'To Do': '#6c757d',
    'In Progress': '#007bff',
    'Done': '#28a745'
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await dispatch(deleteTask(task._id)).unwrap();
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  return (
    <>
      <tr className="task-row">
        <td className="task-title-cell">
          <strong>{task.title}</strong>
        </td>
        <td className="task-description-cell">
          {task.description || <span className="text-muted">No description</span>}
        </td>
        <td>
          <span className="status-badge" style={{ backgroundColor: statusColors[task.status] }}>
            {task.status}
          </span>
        </td>
        <td>
          <span className="priority-badge" style={{ color: priorityColors[task.priority] }}>
            <FaExclamationCircle />
            {task.priority}
          </span>
        </td>
        <td>
          {task.dueDate ? (
            format(new Date(task.dueDate), 'MMM dd, yyyy h:mm a')
          ) : (
            <span className="text-muted">No due date</span>
          )}
        </td>
        <td>
          <div className="task-actions">
            <button
              className="btn-icon"
              onClick={() => setShowEditModal(true)}
              title="Edit task"
            >
              <FaEdit />
            </button>
            <button
              className="btn-icon btn-icon-danger"
              onClick={handleDelete}
              title="Delete task"
            >
              <FaTrash />
            </button>
          </div>
        </td>
      </tr>

      {showEditModal && (
        <TaskFormModal
          onClose={() => setShowEditModal(false)}
          mode="edit"
          task={task}
        />
      )}
    </>
  );
};

export default TaskListItem;



