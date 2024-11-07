// Replace with your own CrudCrud API endpoint
const API_BASE_URL = 'https://crudcrud.com/api/509017e35cb5472f93237d074d25109b';

// Select DOM elements
const form = document.getElementById('formm');
const nameInput = document.getElementById('name');
const descriptionInput = document.getElementById('description');
const todoList = document.getElementById('todo-list');
const doneList = document.getElementById('done-list');
const editIdInput = document.getElementById('edit-id');

// Event Listener for Form Submission
form.addEventListener('submit', handleFormSubmit);

// Fetch and display todos on page load
document.addEventListener('DOMContentLoaded', fetchTodos);

// Handle Form Submission
function handleFormSubmit(event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    const editId = editIdInput.value;

    if (name === '' || description === '') {
        alert('Please fill out both fields.');
        return;
    }

    if (editId) {
        // Update existing todo
        updateTodo(editId, { name, description });
    } else {
        // Create new todo
        createTodo({ name, description, status: 'pending' });
    }

    // Clear form fields
    form.reset();
    editIdInput.value = '';
}

// Create a new todo (Create)
function createTodo(todo) {
    axios.post(API_BASE_URL, todo)
        .then(response => {
            console.log('Todo created:', response.data);
            addTodoToDOM(response.data);
        })
        .catch(error => {
            console.error('Error creating todo:', error);
        });
}

// Fetch all todos (Read)
function fetchTodos() {
    axios.get(API_BASE_URL)
        .then(response => {
            response.data.forEach(todo => addTodoToDOM(todo));
        })
        .catch(error => {
            console.error('Error fetching todos:', error);
        });
}

// Add a todo item to the DOM
function addTodoToDOM(todo) {
    const li = document.createElement('li');
    li.setAttribute('data-id', todo._id);
    li.innerHTML = `
        <strong>${todo.name}</strong>: ${todo.description}
        <button class="done-button">${todo.status === 'pending' ? 'Done' : 'Undone'}</button>
        <button class="edit-button">Edit</button>
        <button class="delete-button">Delete</button>
    `;

    // Append to respective list based on status
    if (todo.status === 'pending') {
        todoList.appendChild(li);
    } else {
        doneList.appendChild(li);
    }

    // Event Listeners for buttons
    li.querySelector('.done-button').addEventListener('click', () => toggleDone(todo, li));
    li.querySelector('.edit-button').addEventListener('click', () => editTodo(todo));
    li.querySelector('.delete-button').addEventListener('click', () => deleteTodo(todo._id, li));
}

// Toggle Todo Status (Update)
function toggleDone(todo, listItem) {
    const updatedStatus = todo.status === 'pending' ? 'done' : 'pending';
    axios.put(`${API_BASE_URL}/${todo._id}`, { ...todo, status: updatedStatus })
        .then(response => {
            console.log('Todo updated:', response.data);
            // Move the todo to the appropriate list
            listItem.remove();
            todo.status = updatedStatus;
            addTodoToDOM(todo);
        })
        .catch(error => {
            console.error('Error updating todo:', error);
        });
}

// Edit Todo (Update)
function editTodo(todo) {
    nameInput.value = todo.name;
    descriptionInput.value = todo.description;
    editIdInput.value = todo._id;
    // Optionally, scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Delete Todo (Delete)
function deleteTodo(id, listItem) {
    axios.delete(`${API_BASE_URL}/${id}`)
        .then(() => {
            console.log('Todo deleted');
            listItem.remove();
        })
        .catch(error => {
            console.error('Error deleting todo:', error);
        });
}

// Update Todo
function updateTodo(id, updatedData) {
    // First, get the current todo to preserve its status
    axios.get(`${API_BASE_URL}/${id}`)
        .then(response => {
            const currentTodo = response.data;
            return axios.put(`${API_BASE_URL}/${id}`, { ...updatedData, status: currentTodo.status });
        })
        .then(response => {
            console.log('Todo updated:', response.data);
            // Find the list item and update its content
            const listItem = document.querySelector(`li[data-id="${id}"]`);
            if (listItem) {
                listItem.querySelector('strong').textContent = response.data.name;
                listItem.childNodes[2].textContent = response.data.description;
            }
        })
        .catch(error => {
            console.error('Error updating todo:', error);
        });
}
