import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, clearFilters, fetchTasks } from '../store/slices/tasksSlice';
import './FilterBar.css';

const FilterBar = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector(state => state.tasks);

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value || null
    };
    dispatch(setFilters(newFilters));
    dispatch(fetchTasks(newFilters));
  };

  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    const newFilters = {
      ...filters,
      search: searchValue || null
    };
    dispatch(setFilters(newFilters));
    dispatch(fetchTasks(newFilters));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    dispatch(fetchTasks({}));
  };

  const hasActiveFilters = filters.status || filters.priority || filters.search || filters.dueDate;

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label htmlFor="search">Search</label>
        <input
          type="text"
          id="search"
          placeholder="Search tasks..."
          value={filters.search || ''}
          onChange={handleSearchChange}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={filters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">All</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          value={filters.priority || ''}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
        >
          <option value="">All</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="dueDate">Due Date</label>
        <input
          type="date"
          id="dueDate"
          value={filters.dueDate ? filters.dueDate.split('T')[0] : ''}
          onChange={(e) => handleFilterChange('dueDate', e.target.value || null)}
        />
      </div>

      {hasActiveFilters && (
        <button className="btn btn-secondary" onClick={handleClearFilters}>
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default FilterBar;



