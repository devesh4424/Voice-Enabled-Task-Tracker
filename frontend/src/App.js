import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import TaskBoard from './components/TaskBoard';
import TaskList from './components/TaskList';

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<TaskBoard />} />
        <Route path="/board" element={<TaskBoard />} />
        <Route path="/list" element={<TaskList />} />
      </Routes>
    </div>
  );
}

export default App;



