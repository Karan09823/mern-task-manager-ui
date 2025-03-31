import React, { useEffect, useState } from 'react';
import { FaCheck, FaPencilAlt, FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import { CreateTask, DeleteTaskById, GetAllTasks, UpdateTaskById } from './api';
import { notify } from './utils';

function TaskManager() {
    const [input, setInput] = useState('');
    const [tasks, setTasks] = useState([]);
    const [copyTasks, setCopyTasks] = useState([]);
    const [updateTask, setUpdateTask] = useState(null);

    const handleTask = async () => {
        if (updateTask && input) {
            const obj = {
                taskName: input,
                isDone: updateTask.isDone,
                _id: updateTask._id
            };
            await handleUpdateItem(obj);
            setUpdateTask(null);  // Reset update task
        } else if (!updateTask && input) {
            await handleAddTask();
        }
        setInput('');
    };

    useEffect(() => {
        if (updateTask) {
            setInput(updateTask.taskName);
        }
    }, [updateTask]);

    const fetchAllTasks = async () => {
        try {
            const { data } = await GetAllTasks();
            setTasks(data);
            setCopyTasks(data);
        } catch (err) {
            console.error(err);
            notify('Failed to fetch tasks', 'error');
        }
    };

    useEffect(() => {
        fetchAllTasks();
    }, []);

    const handleAddTask = async () => {
        const obj = { taskName: input, isDone: false };
        try {
            const { success, message, data } = await CreateTask(obj);
            if (success) {
                notify(message, 'success');
                setTasks([...tasks, data]); // Update locally
                setCopyTasks([...copyTasks, data]);
            } else {
                notify(message, 'error');
            }
        } catch (err) {
            console.error(err);
            notify('Failed to create task', 'error');
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            const { success, message } = await DeleteTaskById(id);
            if (success) {
                notify(message, 'success');
                setTasks(tasks.filter(task => task._id !== id)); // Update locally
                setCopyTasks(copyTasks.filter(task => task._id !== id));
            } else {
                notify(message, 'error');
            }
        } catch (err) {
            console.error(err);
            notify('Failed to delete task', 'error');
        }
    };

    const handleCheckAndUncheck = async (item) => {
        const updatedTask = { ...item, isDone: !item.isDone };
        try {
            const { success, message } = await UpdateTaskById(item._id, updatedTask);
            if (success) {
                notify(message, 'success');
                setTasks(tasks.map(task => task._id === item._id ? updatedTask : task)); // Update locally
                setCopyTasks(copyTasks.map(task => task._id === item._id ? updatedTask : task));
            } else {
                notify(message, 'error');
            }
        } catch (err) {
            console.error(err);
            notify('Failed to update task status', 'error');
        }
    };

    const handleUpdateItem = async (item) => {
        try {
            const { success, message } = await UpdateTaskById(item._id, item);
            if (success) {
                notify(message, 'success');
                setTasks(tasks.map(task => task._id === item._id ? item : task)); // Update locally
                setCopyTasks(copyTasks.map(task => task._id === item._id ? item : task));
            } else {
                notify(message, 'error');
            }
        } catch (err) {
            console.error(err);
            notify('Failed to update task', 'error');
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        const results = copyTasks.filter(item => item.taskName.toLowerCase().includes(term));
        setTasks(results);
    };

    return (
        <div className='d-flex flex-column align-items-center w-50 m-auto mt-5'>
            <h1 className='mb-4'>Task Manager App</h1>

            {/* Input and Search box */}
            <div className='d-flex justify-content-between align-items-center mb-4 w-100'>
                <div className='input-group flex-grow-1 me-2'>
                    <input
                        type='text'
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className='form-control me-1'
                        placeholder='Add a new Task'
                    />
                    <button onClick={handleTask} className='btn btn-success btn-sm me-2'>
                        <FaPlus className='m-2' />
                    </button>
                </div>

                <div className='input-group flex-grow-1'>
                    <span className='input-group-text'>
                        <FaSearch />
                    </span>
                    <input onChange={handleSearch} className='form-control' type='text' placeholder='Search tasks' />
                </div>
            </div>

            {/* List of items */}
            <div className='d-flex flex-column w-100'>
                {tasks.map((item) => (
                    <div key={item._id} className='m-2 p-2 border bg-light w-100 rounded-3 d-flex justify-content-between align-items-center'>
                        <span className={item.isDone ? 'text-decoration-line-through' : ''}>{item.taskName}</span>
                        <div>
                            <button onClick={() => handleCheckAndUncheck(item)} className='btn btn-success btn-sm me-2'>
                                <FaCheck />
                            </button>
                            <button onClick={() => setUpdateTask(item)} className='btn btn-primary btn-sm me-2'>
                                <FaPencilAlt />
                            </button>
                            <button onClick={() => handleDeleteTask(item._id)} className='btn btn-danger btn-sm me-2'>
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toastify */}
            <ToastContainer position='top-right' autoClose={3000} hideProgressBar={false} />
        </div>
    );
}

export default TaskManager;
