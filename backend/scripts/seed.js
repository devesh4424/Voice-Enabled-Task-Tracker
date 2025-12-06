const mongoose = require('mongoose');
const Task = require('../models/Task');
require('dotenv').config();

const sampleTasks = [
  {
    title: 'Review pull request for authentication module',
    description: 'Check the implementation and provide feedback',
    status: 'To Do',
    priority: 'High',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
  },
  {
    title: 'Update documentation',
    description: 'Add API documentation for new endpoints',
    status: 'In Progress',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
  },
  {
    title: 'Fix bug in task deletion',
    description: 'Task deletion not working properly',
    status: 'Done',
    priority: 'Critical',
    dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
  },
  {
    title: 'Plan sprint retrospective',
    description: 'Prepare agenda and gather feedback',
    status: 'To Do',
    priority: 'Low',
    dueDate: null
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voice-task-tracker');
    console.log('Connected to MongoDB');

    // Clear existing tasks
    await Task.deleteMany({});
    console.log('Cleared existing tasks');

    // Insert sample tasks
    const tasks = await Task.insertMany(sampleTasks);
    console.log(`Inserted ${tasks.length} sample tasks`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();



