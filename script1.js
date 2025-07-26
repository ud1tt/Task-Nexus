let ToDo = [];
let editingIndex = null;
let notifications = [];
let isCreatingSubtask = false;
let parentTaskIndex = null;


class Task {
    constructor(name, description, priority, parentId = null) {
        this.id = 'task_' + Date.now() + Math.random().toString(36).substring(2, 9);
        this.name = name;
        this.description = description;
        this.priority = priority;
        this.status = "Awaiting-Development";
        this.created_at = new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: '2-digit'
        });
        this.starttime = null;
        this.endtime = null;
        this.deleted_at = null;
        this.deletion_reason = null;
        this.parentId = parentId;
        this.subtodos = [];
        this.attachments = [];
    }

    edit(name, description, starttime = null, endtime = null) {
        this.name = name;
        this.description = description;
        if (starttime) this.starttime = starttime;
        if (endtime) this.endtime = endtime;
    }

    delete(reason) {
        this.deleted_at = new Date();
        this.status = "Deleted";
        this.deletion_reason = reason;
    }

    setStatus(newStatus) {
        const previousStatus = this.status;
        this.status = newStatus;

        if (previousStatus === "Awaiting-Development" && newStatus !== "Awaiting-Development" && !this.starttime) {
            this.starttime = new Date().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: '2-digit'
            });
        }

        if (newStatus === "Done" && !this.endtime) {
            this.endtime = new Date().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: '2-digit'
            });
        }

        if (newStatus === "Awaiting-Development") {
            this.starttime = null;
            this.endtime = null;
        }

        if (newStatus !== "Done") {
            this.endtime = null;
        }
    }
}

function showToast(message) {
    const toast = document.getElementById('toast-notification');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function addNotification(message) {
    const newNotification = {
        id: Date.now(),
        message: message,
        timestamp: new Date(),
        read: false
    };
    notifications.unshift(newNotification);
    saveAndRenderNotifications();
}

function deleteNotification(id) {
    notifications = notifications.filter(n => n.id !== id);
    saveAndRenderNotifications();
}

function renderNotifications() {
    const panel = document.getElementById('notification-panel');
    const counter = document.getElementById('notification-counter');

    const unreadCount = notifications.filter(n => !n.read).length;
    counter.textContent = unreadCount;
    if (unreadCount > 0) {
        counter.classList.remove('is-hidden');
    } else {
        counter.classList.add('is-hidden');
    }

    panel.innerHTML = '';
    if (notifications.length === 0) {
        panel.innerHTML = '<div class="notification-item"><p>No new activity.</p></div>';
    } else {
        notifications.forEach(n => {
            const item = document.createElement('div');
            item.className = 'notification-item';
            const timeString = new Date(n.timestamp).toLocaleString('en-IN', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
            });
            item.innerHTML = `
                <div>
                    <p>${n.message}</p>
                    <span class="time">${timeString}</span>
                </div>
                <button type="button" class="notification-delete-btn" data-id="${n.id}">
                    <svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                </button>
            `;
            panel.appendChild(item);
        });
    }
}

function markAllNotificationsAsRead() {
    notifications.forEach(n => n.read = true);
    saveAndRenderNotifications();
}

function saveAndRenderNotifications() {
    localStorage.setItem('todoNotifications', JSON.stringify(notifications));
    renderNotifications();
}

function loadNotifications() {
    const saved = localStorage.getItem('todoNotifications');
    if (saved) {
        try {
            notifications = JSON.parse(saved);
        } catch (e) {
            notifications = [];
        }
    }
    renderNotifications();
}

function addTasktoToDo(name, description, priority) {
    let parentId = null;
    if (isCreatingSubtask && parentTaskIndex !== null) {
        parentId = ToDo[parentTaskIndex].id;
    }
    
    const task = new Task(name, description, priority, parentId);
    ToDo.push(task);

    if (parentId) {
        ToDo[parentTaskIndex].subtodos.push(task.id);
        isCreatingSubtask = false;
        parentTaskIndex = null;
    }
    saveTasks();
    return task;
}

function saveTasks() {
    localStorage.setItem('todoTasks', JSON.stringify(ToDo));
}

function loadTasks() {
    const saved = localStorage.getItem('todoTasks');
    if (saved) {
        let parsed;
        try {
            parsed = JSON.parse(saved);
        } catch (error) {
            console.error("Error parsing tasks from localStorage:", error);
            localStorage.removeItem('todoTasks');
            ToDo = [];
            return;
        }

        if (Array.isArray(parsed)) {
            ToDo = parsed.map(task => {
                const t = new Task(task.name || 'Untitled Task', task.description || '', task.priority || 'Normal', task.parentId);
                t.id = task.id || 'task_' + Date.now() + Math.random().toString(36).substring(2, 9);
                t.status = task.status || "Awaiting-Development";
                t.created_at = task.created_at;
                t.starttime = task.starttime || null;
                t.endtime = task.endtime || null;
                t.deleted_at = task.deleted_at ? new Date(task.deleted_at) : null;
                t.deletion_reason = task.deletion_reason || null;
                t.subtodos = task.subtodos || [];
                t.attachments = task.attachments || [];
                return t;
            });
        }
    }
}

const addTaskDialog = document.querySelector('#add-task-dialog');
const closeAddTaskDialogBtn = document.querySelector('#close-add-dialog-btn');
const cancelbtn = document.querySelector('#cancel-button');
const taskform = document.querySelector('#new-task');

cancelbtn.addEventListener("click", () => addTaskDialog.close());
closeAddTaskDialogBtn.addEventListener("click", () => addTaskDialog.close());
addTaskDialog.addEventListener("click", (event) => {
    if (event.target === addTaskDialog) {
        addTaskDialog.close();
    }
});

taskform.addEventListener("submit", function (event) {
    event.preventDefault();
    clearAllErrors();
    const taskname = document.querySelector('#Name').value.trim();
    const taskdescription = document.querySelector('#Description').value.trim();
    const taskpriority = document.querySelector('#Priority').value;

    if (!taskname) return showError('name-error', 'Task name cannot be empty!');
    if (!taskdescription) return showError('description-error', 'Task description cannot be empty!');
    if (checkDuplicateTaskName(taskname)) return showError('name-error', 'A task with this name already exists!');

    addTasktoToDo(taskname, taskdescription, taskpriority);
    applyFiltersAndRender();
    addTaskDialog.close();

    showToast(`Task "${taskname}" was added!`);
    addNotification(`New task added: ${taskname}`);
});

function applyFiltersAndRender() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('filter-status').value;
    const startDateFilter = document.getElementById('filter-start-date').value;
    const endDateFilter = document.getElementById('filter-end-date').value;

    let filteredTasks = ToDo.filter(task => {
        const name = task.name || '';
        const description = task.description || '';
        const textMatch = name.toLowerCase().includes(searchTerm) || description.toLowerCase().includes(searchTerm);

        const statusMatch = (statusFilter === 'all') || (task.status === statusFilter);

        const taskDate = parseDate(task.created_at);
        if (!taskDate) {
            return !startDateFilter && !endDateFilter && textMatch && statusMatch;
        };

        const startDate = startDateFilter ? new Date(startDateFilter) : null;
        const endDate = endDateFilter ? new Date(endDateFilter) : null;

        if (startDate) startDate.setHours(0, 0, 0, 0);
        if (endDate) endDate.setHours(23, 59, 59, 999);

        const dateMatch = (!startDate || taskDate >= startDate) && (!endDate || taskDate <= endDate);

        return textMatch && statusMatch && dateMatch;
    });

    displayTasks(filteredTasks);
}

function displayTasks(tasksToDisplay = ToDo) {
    const taskContainer = document.querySelector('#task-container');
    const tableContainer = document.querySelector('#table-container');

    taskContainer.innerHTML = '';
    tableContainer.innerHTML = '';

    tasksToDisplay.forEach(task => {
        const originalIndex = ToDo.findIndex(originalTask => originalTask === task);
        if (originalIndex === -1) return;

        const todocard = document.createElement("div");
        todocard.classList.add('task-card');
        todocard.setAttribute('data-index', originalIndex);

        const status = task.status || 'unknown';
        const statusClass = 'status-' + status.toLowerCase().replace(/ /g, '-');
        todocard.classList.add(statusClass);

        if (task.deleted_at) {
            todocard.classList.add('task-card-deleted');
        }

        todocard.innerHTML = `
        <h3><p class="task-name-clickable">${task.name}</p></h3>
        <p><strong>Priority:</strong> ${task.priority}</p>
        <p>Created: ${task.created_at || 'N/A'}</p>`;

        taskContainer.appendChild(todocard);
    });

    const addTaskCard = document.createElement('div');
    addTaskCard.classList.add('task-card', 'add-task-card');
    addTaskCard.innerHTML = `<span>+</span>`;
    taskContainer.appendChild(addTaskCard);

    const table = document.createElement('table');
    table.classList.add('task-table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Task Name</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tableBody = table.querySelector('tbody');

    if (tasksToDisplay.length > 0) {
        tasksToDisplay.forEach(task => {
            const originalIndex = ToDo.findIndex(originalTask => originalTask === task);
            if (originalIndex === -1) return;

            const row = tableBody.insertRow();
            if (task.deleted_at) {
                row.classList.add('task-row-deleted');
            }
            row.innerHTML = `
                <td>${task.name}</td>
                <td>${task.priority}</td>
                <td>${task.status}</td>
                <td><button class="view-task-btn" data-index="${originalIndex}">View</button></td>
            `;
        });
    } else {
        const row = tableBody.insertRow();
        row.innerHTML = `<td colspan="4" style="text-align: center;">No tasks found.</td>`;
    }
    
    const addRow = tableBody.insertRow();
    addRow.classList.add('add-task-row');
    const addCell = addRow.insertCell();
    addCell.colSpan = 4;
    addCell.innerHTML = '<span>+</span>';
    addRow.addEventListener('click', openAddTaskDialog);
    
    tableContainer.appendChild(table);
}


const saveTaskBtn = document.querySelector('#save-task-btn');

function showDescriptionPopup(index) {
    editingIndex = index;
    const task = ToDo[index];
    if (!task) {
        console.error("Task not found at index:", index);
        return;
    }

    const dialog = document.querySelector('#description-popup');
    updateDescriptionPopupContent(index);
    dialog.showModal();
}

function updateDescriptionPopupContent(index) {
    const task = ToDo[index];
    if (!task) return;

    document.querySelector('#popup-task-name-display').textContent = task.name;
    document.querySelector('#popup-description-display').textContent = task.description;
    document.querySelector('#popup-status-display').textContent = task.status;
    document.querySelector('#popup-priority-display').textContent = task.priority || 'Normal';
    document.querySelector('#popup-starttime-display').textContent = task.starttime || 'Click to set start date';
    document.querySelector('#popup-endtime-display').textContent = task.endtime || 'Click to set end date';

    document.querySelector('#popup-task-name-input').value = task.name;
    document.querySelector('#popup-description-input').value = task.description;
    document.querySelector('#popup-status-input').value = task.status;
    document.querySelector('#popup-starttime-input').value = formatDateForInput(task.starttime);
    document.querySelector('#popup-endtime-input').value = formatDateForInput(task.endtime);

    renderAttachments();
    handleFieldVisibility(task.status);
    resetToDisplayMode();

    const isDeleted = !!task.deleted_at;
    const deleteBtn = document.querySelector('#delete-task-btn');
    const reasonField = document.querySelector('#deletion-reason-field');
    const reasonText = document.querySelector('#popup-deletion-reason');
    const parentTaskSection = document.getElementById('parent-task-section');
    const parentTaskLink = document.getElementById('parent-task-link');
    
    renderSubTodos(); 

    if (isDeleted) {
        reasonText.value = task.deletion_reason || 'No reason provided.';
        reasonField.style.display = 'block';
        deleteBtn.textContent = 'Delete Permanently';
        deleteBtn.dataset.action = 'perm-delete';
    } else {
        reasonField.style.display = 'none';
        deleteBtn.textContent = 'Delete';
        deleteBtn.dataset.action = 'soft-delete';
    }

    if (task.parentId) {
        const parentTask = ToDo.find(p => p.id === task.parentId);
        if (parentTask) {
            parentTaskLink.textContent = parentTask.name;
            parentTaskSection.style.display = 'block';
            parentTaskLink.onclick = () => {
                const parentIndex = ToDo.findIndex(p => p.id === task.parentId);
                if (parentIndex > -1) {
                    descriptionPopup.close();
                    setTimeout(() => showDescriptionPopup(parentIndex), 100);
                }
            };
        } else {
            parentTaskSection.style.display = 'none';
        }
    } else {
        parentTaskSection.style.display = 'none';
    }

    deleteBtn.style.display = 'inline-block';
    document.querySelectorAll('.clickable-text').forEach(el => {
        el.style.pointerEvents = isDeleted ? 'none' : 'auto';
        el.style.cursor = isDeleted ? 'default' : 'pointer';
    });
    document.querySelector('#add-feature-btn').style.display = isDeleted ? 'none' : 'flex';
}

function resetToDisplayMode() {
    document.querySelector('#popup-task-name-display').style.display = 'block';
    document.querySelector('#popup-task-name-input').style.display = 'none';
    document.querySelector('#popup-description-display').style.display = 'block';
    document.querySelector('#popup-description-input').style.display = 'none';
    document.querySelector('#popup-status-display').style.display = 'block';
    document.querySelector('#popup-status-input').style.display = 'none';
    document.querySelector('#popup-starttime-display').style.display = 'block';
    document.querySelector('#popup-starttime-input').style.display = 'none';
    document.querySelector('#popup-endtime-display').style.display = 'block';
    document.querySelector('#popup-endtime-input').style.display = 'none';
    document.querySelector('#save-task-btn').style.display = 'none';
}

function handleFieldVisibility(status) {
    const startField = document.querySelector('#start-time-field');
    const endField = document.querySelector('#end-time-field');

    if (status === "Awaiting-Development") {
        startField.style.visibility = "hidden";
        endField.style.visibility = "hidden";
    } else if (status === "Done") {
        startField.style.visibility = "visible";
        endField.style.visibility = "visible";
    } else {
        startField.style.visibility = "visible";
        endField.style.visibility = "hidden";
    }
}

function makeEditable(displayId, inputId) {
    if (ToDo[editingIndex] && ToDo[editingIndex].deleted_at) return;
    document.querySelector(displayId).style.display = 'none';
    document.querySelector(inputId).style.display = 'block';
    document.querySelector('#save-task-btn').style.display = 'inline-block';
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#popup-task-name-display').addEventListener('click', () => makeEditable('#popup-task-name-display', '#popup-task-name-input'));
    document.querySelector('#popup-description-display').addEventListener('click', () => makeEditable('#popup-description-display', '#popup-description-input'));
    document.querySelector('#popup-status-display').addEventListener('click', () => makeEditable('#popup-status-display', '#popup-status-input'));
    document.querySelector('#popup-starttime-display').addEventListener('click', () => makeEditable('#popup-starttime-display', '#popup-starttime-input'));
    document.querySelector('#popup-endtime-display').addEventListener('click', () => makeEditable('#popup-endtime-display', '#popup-endtime-input'));
});

function validateDates(startTime, endTime) {
    if (!startTime || !endTime) return true;
    return new Date(startTime) <= new Date(endTime);
}

function checkDuplicateTaskName(taskname, currentIndex = null) {
    return ToDo.some((task, index) => {
        if (currentIndex !== null && index === currentIndex) return false;
        return task.name.toLowerCase() === taskname.toLowerCase();
    });
}

const taskContainer = document.querySelector('#task-container');
const tableContainer = document.querySelector('#table-container');
const descriptionPopup = document.querySelector('#description-popup');

function openAddTaskDialog() {
    taskform.reset();
    clearAllErrors();
    addTaskDialog.showModal();
}

taskContainer.addEventListener("click", function (event) {
    const addCard = event.target.closest('.add-task-card');
    if (addCard) {
        openAddTaskDialog();
        return;
    }

    const taskCard = event.target.closest('.task-card');
    if (taskCard) {
        const index = taskCard.getAttribute("data-index");
        if (index !== null) {
            showDescriptionPopup(Number(index));
        }
    }
});

tableContainer.addEventListener('click', (event) => {
    const viewBtn = event.target.closest('.view-task-btn');
    if (viewBtn) {
        const index = viewBtn.getAttribute('data-index');
        if (index !== null) {
            showDescriptionPopup(Number(index));
        }
    }
});

document.querySelector('#close-popup').addEventListener('click', () => {
    descriptionPopup.close();
});

saveTaskBtn.addEventListener('click', () => {
    const newName = document.querySelector('#popup-task-name-input').value.trim();
    const newDescription = document.querySelector('#popup-description-input').value.trim();
    const newStartTime = document.querySelector('#popup-starttime-input').value;
    const newEndTime = document.querySelector('#popup-endtime-input').value;
    const taskStatus = document.querySelector('#popup-status-input').value;

    clearAllErrors();
    if (!newName) return showError('popup-name-error', 'Task name cannot be empty!');
    if (!newDescription) return showError('popup-description-error', 'Task description cannot be empty!');
    if (checkDuplicateTaskName(newName, editingIndex)) return showError('popup-name-error', 'A task with this name already exists!');
    if (newStartTime && newEndTime && !validateDates(newStartTime, newEndTime)) return showError('popup-general-error', 'Start time cannot be after end time!');

    showConfirmDialog("Are you sure you want to save these changes?", () => {
        const formattedStartTime = newStartTime ? formatDateForDisplay(newStartTime) : null;
        const formattedEndTime = newEndTime ? formatDateForDisplay(newEndTime) : null;
        ToDo[editingIndex].edit(newName, newDescription, formattedStartTime, formattedEndTime);
        ToDo[editingIndex].setStatus(taskStatus);
        saveTasks();
        applyFiltersAndRender();
        updateDescriptionPopupContent(editingIndex);
        showToast(`Task "${newName}" was updated!`);
        addNotification(`Task updated: ${newName}`);
    });
});

function deleteWithSubtasks(taskIndex, reason) {
    const taskToDelete = ToDo[taskIndex];
    if (!taskToDelete || taskToDelete.deleted_at) return; 

    taskToDelete.delete(reason);

    if (taskToDelete.subtodos && taskToDelete.subtodos.length > 0) {
        taskToDelete.subtodos.forEach(subtaskId => {
            const subtaskIndex = ToDo.findIndex(t => t.id === subtaskId);
            if (subtaskIndex > -1) {
                deleteWithSubtasks(subtaskIndex, "Parent task deleted");
            }
        });
    }
}

document.querySelector('#delete-task-btn').addEventListener('click', function (event) {
    const action = event.target.dataset.action;
    if (action === 'perm-delete') {
        const taskToDelete = ToDo[editingIndex];
        const taskName = taskToDelete.name;
        const taskId = taskToDelete.id;

        showConfirmDialog(`Are you sure you want to permanently delete "${taskName}"? This action cannot be undone.`, () => {
            ToDo.splice(editingIndex, 1);
            ToDo.forEach(parentTask => {
                const indexInParent = parentTask.subtodos.indexOf(taskId);
                if (indexInParent > -1) {
                    parentTask.subtodos.splice(indexInParent, 1);
                }
            });
            saveTasks();
            applyFiltersAndRender();
            descriptionPopup.close();
            showToast(`Task "${taskName}" was permanently deleted!`);
            addNotification(`Task permanently deleted: ${taskName}`);
        });
    } else {
        document.querySelector('#delete-reason-dialog').showModal();
    }
});

document.querySelector('#delete-reason-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const reasonInput = document.querySelector('#delete-reason-input');
    const reason = reasonInput.value.trim();
    if (!reason) return showError('delete-reason-error', 'A reason is mandatory to delete a task.');
    
    const taskName = ToDo[editingIndex].name;
    deleteWithSubtasks(editingIndex, reason);

    saveTasks();
    applyFiltersAndRender();
    document.querySelector('#delete-reason-dialog').close();
    descriptionPopup.close();
    reasonInput.value = '';
    showToast(`Task "${taskName}" and its subtasks were deleted.`);
    addNotification(`Task deleted: ${taskName}`);
});

document.querySelector('#delete-reason-dialog').addEventListener('close', () => {
    document.querySelector('#delete-reason-input').value = '';
    showError('delete-reason-error', '');
});

document.querySelector('#cancel-delete-reason-btn').addEventListener('click', () => {
    document.querySelector('#delete-reason-dialog').close();
});

descriptionPopup.addEventListener('click', function (event) {
    if (event.target === this) {
        this.close();
    }
});
descriptionPopup.addEventListener('close', clearAllErrors);

document.querySelector('#popup-status-input').addEventListener('change', function () {
    const status = this.value;
    handleFieldVisibility(status);
    document.querySelector('#save-task-btn').style.display = 'inline-block';
});

const subtodoListContainer = document.querySelector('#subtodo-list-container');

document.querySelector('#add-subtodo-btn').addEventListener('click', () => {
    isCreatingSubtask = true;
    parentTaskIndex = editingIndex;
    descriptionPopup.close();
    openAddTaskDialog();
});


function renderSubTodos() {
    const currentTask = ToDo[editingIndex];
    const subtasksSection = document.getElementById('subtasks-section');
    subtodoListContainer.innerHTML = '';
    
    if (!currentTask || !currentTask.subtodos || currentTask.subtodos.length === 0) {
        subtasksSection.style.display = 'none';
        return;
    }
    
    const validSubtodos = currentTask.subtodos.filter(subtaskId => ToDo.some(task => task.id === subtaskId));

    if (validSubtodos.length === 0) {
        subtasksSection.style.display = 'none';
        return;
    }
    
    subtasksSection.style.display = 'block';

    validSubtodos.forEach(subtaskId => {
        const subtask = ToDo.find(task => task.id === subtaskId);
        if (!subtask) return;

        const item = document.createElement('div');
        item.classList.add('subtodo-link-item');
        if(subtask.deleted_at){
            item.classList.add('subtask-deleted');
        }
        item.textContent = subtask.name;
        
        item.addEventListener('click', () => {
            const subtaskIndex = ToDo.findIndex(task => task.id === subtaskId);
            if (subtaskIndex !== -1) {
                descriptionPopup.close();
                setTimeout(() => showDescriptionPopup(subtaskIndex), 100);
            }
        });
        subtodoListContainer.appendChild(item);
    });
}

const fileUploader = document.querySelector('#file-uploader');
const attachmentsListContainer = document.querySelector('#attachments-list-container');

document.querySelector('#add-attachment-btn').addEventListener('click', () => fileUploader.click());
fileUploader.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        ToDo[editingIndex].attachments.push({
            fileName: file.name,
            fileData: e.target.result,
            fileType: file.type
        });
        saveTasks();
        renderAttachments();
    };
    reader.readAsDataURL(file);
    event.target.value = null;
});

attachmentsListContainer.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('.attachment-delete-btn');
    if (!deleteButton) return;
    const attachmentItem = deleteButton.closest('.attachment-item');
    const attachmentIndex = parseInt(attachmentItem.dataset.index);
    ToDo[editingIndex].attachments.splice(attachmentIndex, 1);
    saveTasks();
    renderAttachments();
});

function getFileIcon(fileType) {
    if (fileType.startsWith('image/')) {
        return ''; // Should be handled by thumbnail logic
    }
    if (fileType === 'application/pdf') {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19,2H5A2,2 0 0,0 3,4V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V4A2,2 0 0,0 19,2M9,4H15V10L12,7.5L9,10V4Z"></path></svg>'; // Simple PDF icon
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M13,3.5L18.5,9H13V3.5M12,11H18V13H12V11M12,15H18V17H12V15Z"></path></svg>'; // Generic file icon
}


function renderAttachments() {
    const currentTask = ToDo[editingIndex];
    attachmentsListContainer.innerHTML = '';
    if (!currentTask || !currentTask.attachments) return;

    currentTask.attachments.forEach((attachment, index) => {
        const item = document.createElement('div');
        item.classList.add('attachment-item');
        item.dataset.index = index;

        const previewLink = document.createElement('a');
        previewLink.href = attachment.fileData;
        previewLink.download = attachment.fileName;
        previewLink.target = '_blank';
        previewLink.classList.add('attachment-preview-link');
        
        if (attachment.fileType && attachment.fileType.startsWith('image/')) {
            previewLink.innerHTML = `
                <img src="${attachment.fileData}" alt="${attachment.fileName}" class="attachment-thumbnail">
                <span class="attachment-filename">${attachment.fileName}</span>
            `;
        } else {
            const iconSvg = getFileIcon(attachment.fileType || '');
            previewLink.innerHTML = `
                <div class="attachment-icon">${iconSvg}</div>
                <span class="attachment-filename">${attachment.fileName}</span>
            `;
        }
        
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.classList.add('attachment-delete-btn');
        deleteButton.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2m-6 5v6m4-6v6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        
        item.appendChild(previewLink);
        item.appendChild(deleteButton);

        attachmentsListContainer.appendChild(item);
    });
}

function formatDateForDisplay(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: '2-digit' });
}

function formatDateForInput(displayDate) {
    if (!displayDate) return '';
    const dateObj = parseDate(displayDate);
    if (!dateObj || isNaN(dateObj.getTime())) return '';
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseDate(dateString) {
    if (!dateString) return null;
    if (dateString.includes('-')) return new Date(dateString);
    const parts = dateString.split(' ');
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const monthName = parts[1];
        const year = parseInt('20' + parts[2], 10);
        const monthMap = { "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5, "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11 };
        return new Date(year, monthMap[monthName], day);
    }
    return null;
}

function showError(errorId, message) {
    const errorElement = document.querySelector(`#${errorId}`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.toggle('show', !!message);
    }
}

function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(element => {
        element.textContent = '';
        element.classList.remove('show');
    });
}

function showConfirmDialog(message, onConfirm) {
    const dialog = document.querySelector('#confirm-dialog');
    const messageEl = document.querySelector('#confirm-message');
    const confirmBtn = document.querySelector('#confirm-btn-yes');
    const cancelBtn = document.querySelector('#confirm-btn-cancel');

    messageEl.textContent = message;

    const controller = new AbortController();
    const { signal } = controller;

    const cleanupAndClose = () => {
        controller.abort();
        dialog.close();
    };

    confirmBtn.addEventListener('click', () => {
        onConfirm();
        cleanupAndClose();
    }, { signal });

    cancelBtn.addEventListener('click', cleanupAndClose, { signal });
    dialog.addEventListener('close', cleanupAndClose, { signal });

    dialog.showModal();
}

const addFeatureBtn = document.getElementById('add-feature-btn');
addFeatureBtn.addEventListener('click', function (event) {
    const dropdown = document.querySelector('#add-feature-dropdown');
    dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
    event.stopPropagation();
});

window.addEventListener('click', function (event) {
    const dropdown = document.querySelector('#add-feature-dropdown');
    if (dropdown.style.display === 'flex' && !addFeatureBtn.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});

const gridViewBtn = document.querySelector('#grid-view-btn');
const tabularViewBtn = document.querySelector('#tabular-view-btn');

gridViewBtn.addEventListener('click', () => {
    taskContainer.classList.remove('is-hidden');
    tableContainer.classList.add('is-hidden');
    taskContainer.className = 'grid-view';
    gridViewBtn.classList.add('active');
    tabularViewBtn.classList.remove('active');
});

tabularViewBtn.addEventListener('click', () => {
    tableContainer.classList.remove('is-hidden');
    taskContainer.classList.add('is-hidden');
    tabularViewBtn.classList.add('active');
    gridViewBtn.classList.remove('active');
});


document.getElementById('search-input').addEventListener('keyup', applyFiltersAndRender);
document.getElementById('filter-status').addEventListener('change', applyFiltersAndRender);
document.getElementById('filter-start-date').addEventListener('change', applyFiltersAndRender);
document.getElementById('filter-end-date').addEventListener('change', applyFiltersAndRender);

document.getElementById('reset-filters-btn').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.getElementById('filter-status').value = 'all';
    document.getElementById('filter-start-date').value = '';
    document.getElementById('filter-end-date').value = '';
    applyFiltersAndRender();
});

const bellElement = document.querySelector('.notification-bell');
const panelElement = document.getElementById('notification-panel');

bellElement.addEventListener('click', (event) => {
    panelElement.classList.toggle('is-hidden');
    if (!panelElement.classList.contains('is-hidden')) {
        markAllNotificationsAsRead();
    }
    event.stopPropagation();
});

panelElement.addEventListener('click', (event) => {
    const deleteBtn = event.target.closest('.notification-delete-btn');
    if (deleteBtn) {
        const idToDelete = Number(deleteBtn.dataset.id);
        deleteNotification(idToDelete);
    }
    event.stopPropagation();
});

document.addEventListener('click', () => {
    if (!panelElement.classList.contains('is-hidden')) {
        panelElement.classList.add('is-hidden');
    }
});

loadTasks();
loadNotifications();
applyFiltersAndRender();