document.addEventListener('DOMContentLoaded', () => {
    const taskEnter = document.getElementById('task-enter');
    const addTaskBtn = document.getElementById('task-btn');
    const TaskList = document.getElementById('task-items');
    const emptyImage = document.querySelector('.empty-image');
    const todosContainer = document.querySelector('.task-container');
    const progressBar = document.getElementById('progress');
    const progressNumber = document.getElementById('number');

    let editingTask = null; // Variable to keep track of the task being edited

    const toggleEmptyState = () => {
        emptyImage.style.display = TaskList.children.length === 0 ? 'block' : 'none';
        todosContainer.style.width = TaskList.children.length > 0 ? '100%' : '50%';
    };

    const updateProgress = () => {
        const totalTasks = TaskList.children.length;
        const completedTasks = TaskList.querySelectorAll('.checkbox:checked').length;

        progressBar.style.width = totalTasks ? `${(completedTasks / totalTasks) * 100}%` : `0%`;
        progressNumber.textContent = `${completedTasks} / ${totalTasks}`;

        // Trigger confetti if all tasks are completed
        if (totalTasks > 0 && completedTasks === totalTasks) {
            Confetti();
        }
    };

    const saveTaskToLocalStorage = () => {
        const tasks = Array.from(TaskList.querySelectorAll('li')).map(li => ({
            text: li.querySelector('span').textContent,
            completed: li.querySelector('.checkbox').checked
        }));
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const loadTasksFromLocalStorage = () => {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        savedTasks.forEach(({ text, completed }) => addTask(text, completed, false));
        toggleEmptyState();
        updateProgress();
    };

    const addTask = (text, completed = false) => {
        const taskText = text || taskEnter.value.trim();
        if (!taskText) {
            return;
        }

        // Create a new list item
        const li = document.createElement('li');
        li.innerHTML = `
            <label class="custom-checkbox">
                <input type="checkbox" class="checkbox" ${completed ? 'checked' : ''}>
                <span class="checkmark"></span>
            </label>
            <span>${taskText}</span>
            <div class="task-btns">
                <button class="edit-btn"><i class="fa-solid fa-pen"></i></button>
                <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;

        const checkbox = li.querySelector('.checkbox');
        const editbtn = li.querySelector('.edit-btn');

        // Mark task as completed if necessary
        if (completed) {
            li.classList.add('completed');
            editbtn.disabled = true;
            editbtn.style.opacity = '0.5';
            editbtn.style.pointerEvents = 'none';
        }

        // Checkbox change event
        checkbox.addEventListener('change', () => {
            const isChecked = checkbox.checked;
            li.classList.toggle('completed', isChecked);
            editbtn.disabled = isChecked;
            editbtn.style.opacity = isChecked ? '0.5' : 1;
            editbtn.style.pointerEvents = isChecked ? 'none' : 'auto';
            updateProgress();
            saveTaskToLocalStorage();
        });

        // Edit button event
        editbtn.addEventListener('click', () => {
            if (!checkbox.checked) {
                taskEnter.value = li.querySelector('span').textContent; // Populate input with task text
                editingTask = li; // Set the current task as the one being edited
                li.remove(); // Remove the task from the list temporarily
                toggleEmptyState();
                updateProgress();
                saveTaskToLocalStorage();
            }
        });

        // Delete button event
        li.querySelector('.delete-btn').addEventListener('click', () => {
            li.remove();
            toggleEmptyState();
            updateProgress();
            saveTaskToLocalStorage();
        });

        TaskList.appendChild(li);
        taskEnter.value = ''; // Clear input field after adding
        toggleEmptyState();
        updateProgress();
    };

    addTaskBtn.addEventListener('click', () => {
        if (editingTask) {
            // If we are editing a task, update it instead of adding a new one
            const updatedText = taskEnter.value.trim();
            if (updatedText) {
                editingTask.querySelector('span').textContent = updatedText; // Update the task text
                editingTask = null; // Reset editing task
                taskEnter.value = ''; // Clear input
                saveTaskToLocalStorage(); // Save changes to local storage
                toggleEmptyState();
                updateProgress();
            }
        } else {
            addTask(); // Add a new task
        }
    });

    taskEnter.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTaskBtn.click(); // Trigger the add task button click
        }
    });

    // Initialize empty state
    toggleEmptyState();
    loadTasksFromLocalStorage();
});

const Confetti = () => {
    const duration = 15 * 1000,
        animationEnd = Date.now() + duration,
        defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // since particles fall down, start a bit higher than random
        confetti(
            Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            })
        );
        confetti(
            Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            })
        );
    }, 250);
};