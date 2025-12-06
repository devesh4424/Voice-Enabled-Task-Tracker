import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);
    if (filters.dueDate) params.append('dueDate', filters.dueDate);

    const response = await axios.get(`${API_URL}/tasks?${params.toString()}`);
    return response.data;
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData) => {
    const response = await axios.post(`${API_URL}/tasks`, taskData);
    return response.data;
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, ...taskData }) => {
    const response = await axios.put(`${API_URL}/tasks/${id}`, taskData);
    return response.data;
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id) => {
    await axios.delete(`${API_URL}/tasks/${id}`);
    return id;
  }
);

export const parseVoiceInput = createAsyncThunk(
  'tasks/parseVoiceInput',
  async (transcript) => {
    const response = await axios.post(`${API_URL}/voice/parse`, { transcript });
    return response.data;
  }
);

export const createTaskFromVoice = createAsyncThunk(
  'tasks/createTaskFromVoice',
  async (data) => {
    const response = await axios.post(`${API_URL}/voice/create`, data);
    return response.data;
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [],
    loading: false,
    error: null,
    filters: {
      status: null,
      priority: null,
      search: null,
      dueDate: null
    }
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: null,
        priority: null,
        search: null,
        dueDate: null
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create task
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update task
      .addCase(updateTask.pending, (state) => {
        // Optional: You can set a loading state for specific task updates
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        const index = state.items.findIndex(task => {
          // Handle both string and ObjectId formats
          return String(task._id) === String(updatedTask._id);
        });
        if (index !== -1) {
          // Replace the task with the updated version
          state.items[index] = updatedTask;
        } else {
          // If task not found, add it (shouldn't happen, but handle gracefully)
          console.warn('Updated task not found in state, adding it:', updatedTask);
          state.items.push(updatedTask);
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        console.error('Failed to update task:', action.error);
        state.error = action.error.message;
      })
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter(task => task._id !== action.payload);
      })
      // Create task from voice
      .addCase(createTaskFromVoice.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  }
});

export const { setFilters, clearFilters } = tasksSlice.actions;
export default tasksSlice.reducer;

