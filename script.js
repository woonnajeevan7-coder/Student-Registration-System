// Student Registration System - JavaScript Implementation
// Two-page layout support

// Global variables and DOM element references
let students = [];
let editingIndex = -1;
let deleteIndex = -1;
let todayCount = 0;

// Determine which page we're on
const currentPage = window.location.pathname.includes('view-students') ? 'view' : 'register';

// Initialize application on page load
document.addEventListener('DOMContentLoaded', function() {
    loadStudentsFromLocalStorage();
    
    if (currentPage === 'register') {
        initializeRegisterPage();
    } else {
        initializeViewPage();
    }
});

// Initialize Register Page
function initializeRegisterPage() {
    const studentForm = document.getElementById('studentForm');
    const studentNameInput = document.getElementById('studentName');
    const studentIdInput = document.getElementById('studentId');
    const emailIdInput = document.getElementById('emailId');
    const contactNumberInput = document.getElementById('contactNumber');
    const studentClassInput = document.getElementById('studentClass');
    const studentAddressInput = document.getElementById('studentAddress');
    const classError = document.getElementById('classError');
    const addressError = document.getElementById('addressError');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const successMessage = document.getElementById('successMessage');
    
    // Error message elements
    const nameError = document.getElementById('nameError');
    const idError = document.getElementById('idError');
    const emailError = document.getElementById('emailError');
    const contactError = document.getElementById('contactError');
    
    // Update stats
    updateStats();
    
    // Check if we're editing (from localStorage)
    const editIndex = localStorage.getItem('editingStudent');
    if (editIndex !== null) {
        const student = students[parseInt(editIndex)];
        if (student) {
            studentNameInput.value = student.name;
            studentIdInput.value = student.id;
            emailIdInput.value = student.email;
            contactNumberInput.value = student.contact;
            studentClassInput.value = student.class;
            studentAddressInput.value = student.address;
            editingIndex = parseInt(editIndex);
            submitBtn.querySelector('.btn-text').textContent = 'Update Student';
            cancelBtn.style.display = 'inline-flex';
        }
        localStorage.removeItem('editingStudent');
    }
    
    // Form submission event handler
    studentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Clear previous error messages
        clearErrors();
        
        // Validate all form fields
        if (validateForm()) {
            const studentData = {
            name: studentNameInput.value.trim(),
            id: studentIdInput.value.trim(),
            class: studentClassInput.value.trim(),
            email: emailIdInput.value.trim(),
            contact: contactNumberInput.value.trim(),
            address: studentAddressInput.value.trim()
            };

            
            if (editingIndex >= 0) {
                // Update existing student
                students[editingIndex] = studentData;
                editingIndex = -1;
                submitBtn.querySelector('.btn-text').textContent = 'Add Student';
                cancelBtn.style.display = 'none';
            } else {
                // Add new student
                students.push(studentData);
                todayCount++;
                localStorage.setItem('todayCount', todayCount);
            }
            
            // Save to localStorage and show success
            saveStudentsToLocalStorage();
            studentForm.reset();
            showSuccessMessage();
            updateStats();
        }
    });
    
    // Cancel button event handler
    cancelBtn.addEventListener('click', function() {
        studentForm.reset();
        clearErrors();
        editingIndex = -1;
        submitBtn.querySelector('.btn-text').textContent = 'Add Student';
        cancelBtn.style.display = 'none';
    });
    
    // Validation helper functions
    function validateForm() {
    let isValid = true;

    // Name
    const nameValue = studentNameInput.value.trim();
    if (nameValue === '') {
        nameError.textContent = 'Name is required';
        isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(nameValue)) {
        nameError.textContent = 'Name must contain only letters';
        isValid = false;
    }

    // Student ID
    const idValue = studentIdInput.value.trim();
    if (idValue === '') {
        idError.textContent = 'Student ID is required';
        isValid = false;
    } else if (!/^[0-9]+$/.test(idValue)) {
        idError.textContent = 'Student ID must contain only numbers';
        isValid = false;
    } else if (editingIndex === -1 && students.some(s => s.id === idValue)) {
        idError.textContent = 'Student ID already exists';
        isValid = false;
    }

    // Class
    if (studentClassInput.value.trim() === '') {
        classError.textContent = 'Class is required';
        isValid = false;
    }

    // Email
    const emailValue = emailIdInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailValue === '') {
        emailError.textContent = 'Email is required';
        isValid = false;
    } else if (!emailRegex.test(emailValue)) {
        emailError.textContent = 'Enter a valid email';
        isValid = false;
    }

    // Contact
    const contactValue = contactNumberInput.value.trim();
    if (contactValue === '') {
        contactError.textContent = 'Contact number is required';
        isValid = false;
    } else if (!/^[0-9]+$/.test(contactValue)) {
        contactError.textContent = 'Only numbers allowed';
        isValid = false;
    } else if (contactValue.length < 10) {
        contactError.textContent = 'Minimum 10 digits required';
        isValid = false;
    }

    // Address
    if (studentAddressInput.value.trim() === '') {
        addressError.textContent = 'Address is required';
        isValid = false;
    }

    return isValid;
}

    
    function clearErrors() {
    nameError.textContent = '';
    idError.textContent = '';
    classError.textContent = '';
    emailError.textContent = '';
    contactError.textContent = '';
    addressError.textContent = '';
}


    
    function showSuccessMessage() {
        successMessage.classList.add('show');
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 3000);
    }
    
    function updateStats() {
        document.getElementById('totalStudents').textContent = students.length;
        document.getElementById('todayRegistrations').textContent = todayCount;
    }
}

// Initialize View Page
function initializeViewPage() {
    const tableBody = document.getElementById('studentsTableBody');
    const noRecordsDiv = document.getElementById('noRecords');
    const totalCountSpan = document.getElementById('totalCount');
    const searchInput = document.getElementById('searchInput');
    const tableContainer = document.getElementById('tableContainer');
    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    
    // Initial render
    renderStudents();
    updateDynamicScrollbar();
    
    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm) ||
        student.id.toLowerCase().includes(searchTerm) ||
        student.class.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm) ||
        student.contact.includes(searchTerm) ||
        student.address.toLowerCase().includes(searchTerm)
    );

        renderStudents(filteredStudents);
        updateDynamicScrollbar();
    });
    
    // Modal event handlers
    confirmDeleteBtn.addEventListener('click', deleteStudent);
    
    cancelDeleteBtn.addEventListener('click', function() {
        deleteModal.classList.remove('show');
        deleteIndex = -1;
    });
    
    // Close modal when clicking outside
    deleteModal.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            deleteModal.classList.remove('show');
            deleteIndex = -1;
        }
    });
    
    /**
     * Renders student records in the table
     * @param {Array} studentsToRender - Array of students to display (default: all students)
     */
    function renderStudents(studentsToRender = students) {
        // Clear existing table rows
        tableBody.innerHTML = '';
        
        // Update total count
        totalCountSpan.textContent = students.length;
        
        // Show/hide no records message
        if (studentsToRender.length === 0) {
            noRecordsDiv.classList.add('show');
            return;
        } else {
            noRecordsDiv.classList.remove('show');
        }
        
        // Render each student record
        studentsToRender.forEach(student => {

            // Find actual index in main students array
            const actualIndex = students.indexOf(student);
            
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${escapeHtml(student.name)}</td>
            <td>${escapeHtml(student.id)}</td>
            <td>${escapeHtml(student.class)}</td>
            <td>${escapeHtml(student.email)}</td>
            <td>${escapeHtml(student.contact)}</td>
            <td>${escapeHtml(student.address)}</td>
            <td>
            <button class="action-btn edit-btn" onclick="editStudent(${actualIndex})">Edit</button>
            <button class="action-btn delete-btn" onclick="confirmDelete(${actualIndex})">Delete</button>
            </td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    /**
     * Deletes a student record
     */
    function deleteStudent() {
        if (deleteIndex >= 0) {
            students.splice(deleteIndex, 1);
            saveStudentsToLocalStorage();
            renderStudents();
            updateDynamicScrollbar();
            deleteIndex = -1;
        }
        deleteModal.classList.remove('show');
    }
    
    /**
     * Dynamically adds vertical scrollbar when table exceeds certain height
     */
    function updateDynamicScrollbar() {
        const table = document.getElementById('studentsTable');
        const tableHeight = table.offsetHeight;
        
        // If table height exceeds 500px, add scrollable class
        if (tableHeight > 500) {
            tableContainer.classList.add('scrollable');
        } else {
            tableContainer.classList.remove('scrollable');
        }
    }
}

/**
 * Escapes HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Edits a student record (redirects to register page)
 * @param {number} index - Index of student to edit
 */
function editStudent(index) {
    // Store editing index in localStorage
    localStorage.setItem('editingStudent', index);
    // Redirect to register page
    window.location.href = 'index.html';
}

/**
 * Shows delete confirmation modal
 * @param {number} index - Index of student to delete
 */
function confirmDelete(index) {
    deleteIndex = index;
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.classList.add('show');
}

// Close delete modal when ESC key is pressed
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        const deleteModal = document.getElementById('deleteModal');
        if (deleteModal && deleteModal.classList.contains('show')) {
            deleteModal.classList.remove('show');
            deleteIndex = -1;
        }
    }
});

// LocalStorage Functions

/**
 * Saves students array to localStorage
 */
function saveStudentsToLocalStorage() {
    localStorage.setItem('students', JSON.stringify(students));
}

/**
 * Loads students array from localStorage
 */
function loadStudentsFromLocalStorage() {
    const storedStudents = localStorage.getItem('students');
    if (storedStudents) {
        students = JSON.parse(storedStudents);
    }
    todayCount = Number(localStorage.getItem('todayCount')) || 0;
}

// Make functions globally accessible for inline onclick handlers
window.editStudent = editStudent;
window.confirmDelete = confirmDelete;

