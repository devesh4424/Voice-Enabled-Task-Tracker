import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { FaTrash, FaEdit, FaExclamationCircle } from 'react-icons/fa';
import { deleteTask } from '../store/slices/tasksSlice';
import TaskFormModal from './TaskFormModal';
import './TaskCard.css';

const TaskCard = ({ task }) => {
  const dispatch = useDispatch();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const priorityColors = {
    Low: '#28a745',
    Medium: '#ffc107',
    High: '#fd7e14',
    Critical: '#dc3545'
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
      <div className="task-card" style={{ borderLeft: `4px solid ${priorityColors[task.priority]}` }}>
        <div className="task-card-header">
          <h4 className="task-title">{task.title}</h4>
          <div className="task-priority" style={{ color: priorityColors[task.priority] }}>
            <FaExclamationCircle />
            <span>{task.priority}</span>
          </div>
        </div>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        {task.dueDate && (
          <div className="task-due-date">
            Due: {format(new Date(task.dueDate), 'MMM dd, yyyy h:mm a')}
          </div>
        )}

        <div className="task-card-actions">
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
      </div>

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

export default TaskCard;



