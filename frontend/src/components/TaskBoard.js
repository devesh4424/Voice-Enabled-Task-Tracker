import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { fetchTasks, updateTask } from "../store/slices/tasksSlice";
import TaskCard from "./TaskCard";
import FilterBar from "./FilterBar";
import "./TaskBoard.css";

const TaskBoard = () => {
  const dispatch = useDispatch();
  const { items: tasks, loading, filters } = useSelector(
    (state) => state.tasks
  );

  const [isDragging, setIsDragging] = useState(false);
  const tasksSnapshotRef = useRef(tasks);

  // Update snapshot only when not dragging
  useEffect(() => {
    if (!isDragging) {
      tasksSnapshotRef.current = tasks;
    }
  }, [tasks, isDragging]);

  // initial load
  useEffect(() => {
    dispatch(fetchTasks(filters));
  }, [dispatch, filters]);

  const statuses = useMemo(() => ["To Do", "In Progress", "Done"], []);

  // stable data source during drag
  const tasksToUse = isDragging ? tasksSnapshotRef.current : tasks;

  // memoize columns
  const boardColumns = useMemo(() => {
    return statuses.map((status) => ({
      status,
      tasks: tasksToUse.filter((t) => t.status === status),
    }));
  }, [statuses, tasksToUse]);

  // -------------------------------
  // ⭐ DRAG START
  // -------------------------------
  const handleDragStart = (start) => {
    const id = start.draggableId;

    console.log("🔥 DRAG START →", id);
    const task = tasks.find((t) => String(t._id) === String(id));
    if (task) {
      console.log("Current Status:", task.status);
    }

    tasksSnapshotRef.current = [...tasks];
    setIsDragging(true);
  };

  // -------------------------------
  // ⭐ DRAG END
  // -------------------------------
  const handleDragEnd = async (result) => {
    setIsDragging(false);

    if (!result.destination) return;

    const { draggableId, destination, source } = result;

    console.log("🛑 DRAG END →", draggableId);
    console.log("From:", source.droppableId, "→ To:", destination.droppableId);

    const task = tasksSnapshotRef.current.find(
      (t) => String(t._id) === String(draggableId)
    );

    if (!task) {
      console.error("❌ Task not found for ID:", draggableId);
      return;
    }

    if (task.status === destination.droppableId) {
      console.log("No status change.");
      return;
    }

    console.log(
      `Updating: ${task._id} → ${destination.droppableId}`
    );

    try {
      await dispatch(
        updateTask({
          id: task._id,
          status: destination.droppableId,
        })
      ).unwrap();

      // ❗ IMPORTANT: Do NOT refetch here (causes drag error)
      // Refetch only through filter changes or initial load

    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  return (
    <div className="task-board-container">
      <FilterBar />

      <DragDropContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="task-board">
          {boardColumns.map(({ status, tasks: statusTasks }) => (
            <Droppable droppableId={status} key={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`board-column ${
                    snapshot.isDraggingOver ? "dragging-over" : ""
                  }`}
                >
                  <div className="column-header">
                    <h3>{status}</h3>
                    <span className="task-count">
                      {statusTasks.length}
                    </span>
                  </div>

                  <div className="column-content">
                    {statusTasks.map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={String(task._id)}
                        index={index}
                      >
                        {(provided, snapshot) => {
                          if (snapshot.isDragging) {
                            console.log(
                              "📌 Dragging Task:",
                              task._id,
                              "| Status:",
                              task.status
                            );
                          }

                          return (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={
                                snapshot.isDragging ? "dragging" : ""
                              }
                            >
                              <TaskCard task={task} />
                            </div>
                          );
                        }}
                      </Draggable>
                    ))}

                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default TaskBoard;
