import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';
import VoiceInputButton from './VoiceInputButton';
import TaskFormModal from './TaskFormModal';

const Header = () => {
  const location = useLocation();
  const [showTaskForm, setShowTaskForm] = React.useState(false);

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Voice Task Tracker</h1>
        <nav className="header-nav">
          <Link 
            to="/board" 
            className={location.pathname === '/board' || location.pathname === '/' ? 'active' : ''}
          >
            Board
          </Link>
          <Link 
            to="/list" 
            className={location.pathname === '/list' ? 'active' : ''}
          >
            List
          </Link>
        </nav>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowTaskForm(true)}
          >
            + Add Task
          </button>
          <VoiceInputButton />
        </div>
      </div>
      {showTaskForm && (
        <TaskFormModal
          onClose={() => setShowTaskForm(false)}
          mode="create"
        />
      )}
    </header>
  );
};

export default Header;



