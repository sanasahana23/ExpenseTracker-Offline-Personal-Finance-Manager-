/* ===============================================
   EXPENSE TRACKER - JAVASCRIPT APPLICATION
   ===============================================
   
   A comprehensive expense tracking application with:
   - Local storage persistence
   - Chart visualizations using Chart.js
   - CSV export and JSON import functionality
   - Search, filtering, and sorting capabilities
   - Dark mode support
   - Responsive design and accessibility
   - Form validation and user feedback
   
   =============================================== */

/* ===============================================
   GLOBAL CONSTANTS AND CONFIGURATION
   =============================================== */
const CONFIG = {
    STORAGE_KEYS: {
        EXPENSES: 'expenseTracker_v1',
        THEME: 'expenseTracker_theme'
    },
    CATEGORIES: ['Food', 'Travel', 'Shopping', 'Bills', 'Other'],
    CATEGORY_COLORS: {
        'Food': '#f59e0b',
        'Travel': '#8b5cf6',
        'Shopping': '#ec4899',
        'Bills': '#ef4444',
        'Other': '#6b7280'
    },
    PAGINATION: {
        PAGE_SIZE: 25
    },
    CURRENCY: {
        LOCALE: 'en-US',
        CODE: 'USD'
    }
};

/* ===============================================
   APPLICATION STATE MANAGEMENT
   =============================================== */
class ExpenseTracker {
    constructor() {
        // Initialize application state
        this.expenses = [];
        this.filteredExpenses = [];
        this.currentPage = 1;
        this.isEditMode = false;
        this.editExpenseId = null;
        this.charts = {
            category: null,
            monthly: null
        };
        
        // Bind DOM elements
        this.bindDOMElements();
        
        // Initialize the application
        this.init();
    }

    /* ===============================================
       INITIALIZATION METHODS
       =============================================== */
    
    /**
     * Initialize the application
     * Sets up event listeners, loads data, and renders UI
     */
    init() {
        this.setupEventListeners();
        this.loadExpensesFromStorage();
        this.loadThemeFromStorage();
        this.checkForSampleDataImport();
        this.setDefaultDate();
        this.renderUI();
        
        console.log('ExpenseTracker initialized successfully');
    }
    
    /**
     * Bind all DOM elements to class properties for easy access
     */
    bindDOMElements() {
        // Form elements
        this.elements = {
            // Form section and form
            formSection: document.getElementById('expense-form-section'),
            form: document.getElementById('expense-form'),
            titleInput: document.getElementById('expense-title'),
            amountInput: document.getElementById('expense-amount'),
            categorySelect: document.getElementById('expense-category'),
            dateInput: document.getElementById('expense-date'),
            notesInput: document.getElementById('expense-notes'),
            editIdInput: document.getElementById('edit-expense-id'),
            submitBtnText: document.getElementById('submit-btn-text'),
            
            // Header buttons
            themeToggle: document.getElementById('theme-toggle'),
            importBtn: document.getElementById('import-btn'),
            exportBtn: document.getElementById('export-btn'),
            addExpenseBtn: document.getElementById('add-expense-btn'),
            closeFormBtn: document.getElementById('close-form-btn'),
            cancelBtn: document.getElementById('cancel-btn'),
            
            // Summary cards
            totalSpent: document.getElementById('total-spent'),
            monthlySpent: document.getElementById('monthly-spent'),
            biggestCategory: document.getElementById('biggest-category'),
            expenseCount: document.getElementById('expense-count'),
            
            // Charts
            categoryChart: document.getElementById('category-chart'),
            monthlyChart: document.getElementById('monthly-chart'),
            categoryEmpty: document.getElementById('category-empty'),
            monthlyEmpty: document.getElementById('monthly-empty'),
            
            // Controls
            searchInput: document.getElementById('search-input'),
            categoryFilter: document.getElementById('category-filter'),
            dateFrom: document.getElementById('date-from'),
            dateTo: document.getElementById('date-to'),
            sortSelect: document.getElementById('sort-select'),
            clearFiltersBtn: document.getElementById('clear-filters-btn'),
            
            // Expenses list
            expensesList: document.getElementById('expenses-list'),
            noExpenses: document.getElementById('no-expenses'),
            filteredCount: document.getElementById('filtered-count'),
            
            // Pagination
            pagination: document.getElementById('pagination'),
            prevPageBtn: document.getElementById('prev-page'),
            nextPageBtn: document.getElementById('next-page'),
            paginationInfo: document.getElementById('pagination-info'),
            
            // Modal
            deleteModal: document.getElementById('delete-modal'),
            cancelDeleteBtn: document.getElementById('cancel-delete'),
            confirmDeleteBtn: document.getElementById('confirm-delete'),
            
            // File input
            importFileInput: document.getElementById('import-file-input'),
            
            // Toast container
            toastContainer: document.getElementById('toast-container')
        };
    }
    
    /**
     * Set up all event listeners for the application
     */
    setupEventListeners() {
        // Form events
        this.elements.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.elements.addExpenseBtn.addEventListener('click', () => this.showExpenseForm());
        this.elements.closeFormBtn.addEventListener('click', () => this.hideExpenseForm());
        this.elements.cancelBtn.addEventListener('click', () => this.cancelEdit());
        
        // Header events
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.elements.importBtn.addEventListener('click', () => this.triggerImport());
        this.elements.exportBtn.addEventListener('click', () => this.exportToCSV());
        
        // Control events - with debouncing for performance
        this.elements.searchInput.addEventListener('input', this.debounce(() => this.applyFilters(), 300));
        this.elements.categoryFilter.addEventListener('change', () => this.applyFilters());
        this.elements.dateFrom.addEventListener('change', () => this.applyFilters());
        this.elements.dateTo.addEventListener('change', () => this.applyFilters());
        this.elements.sortSelect.addEventListener('change', () => this.applyFilters());
        this.elements.clearFiltersBtn.addEventListener('click', () => this.clearAllFilters());
        
        // Pagination events
        this.elements.prevPageBtn.addEventListener('click', () => this.previousPage());
        this.elements.nextPageBtn.addEventListener('click', () => this.nextPage());
        
        // Modal events
        this.elements.cancelDeleteBtn.addEventListener('click', () => this.hideDeleteModal());
        this.elements.confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
        
        // File import
        this.elements.importFileInput.addEventListener('change', (e) => this.handleFileImport(e));
        
        // Modal overlay click to close
        this.elements.deleteModal.addEventListener('click', (e) => {
            if (e.target === this.elements.deleteModal) {
                this.hideDeleteModal();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Form input validation
        this.elements.titleInput.addEventListener('blur', () => this.validateField('title'));
        this.elements.amountInput.addEventListener('blur', () => this.validateField('amount'));
        this.elements.categorySelect.addEventListener('change', () => this.validateField('category'));
    }

    /* ===============================================
       STORAGE AND DATA MANAGEMENT
       =============================================== */
    
    /**
     * Load expenses from localStorage
     */
    loadExpensesFromStorage() {
        try {
            const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.EXPENSES);
            if (stored) {
                this.expenses = JSON.parse(stored);
                console.log(`Loaded ${this.expenses.length} expenses from storage`);
            } else {
                this.expenses = [];
                console.log('No stored expenses found, starting with empty array');
            }
        } catch (error) {
            console.error('Error loading expenses from storage:', error);
            this.expenses = [];
            this.showToast('Error loading saved expenses', 'error');
        }
    }
    
    /**
     * Save expenses to localStorage
     */
    saveExpensesToStorage() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.EXPENSES, JSON.stringify(this.expenses));
            console.log(`Saved ${this.expenses.length} expenses to storage`);
        } catch (error) {
            console.error('Error saving expenses to storage:', error);
            this.showToast('Error saving expenses. Storage may be full.', 'error');
        }
    }
    
    /**
     * Load theme preference from localStorage
     */
    loadThemeFromStorage() {
        try {
            const theme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);
            if (theme === 'dark') {
                document.body.classList.add('dark');
                this.elements.themeToggle.querySelector('.theme-icon').textContent = '☀️';
            }
        } catch (error) {
            console.error('Error loading theme from storage:', error);
        }
    }
    
    /**
     * Save theme preference to localStorage
     */
    saveThemeToStorage(theme) {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, theme);
        } catch (error) {
            console.error('Error saving theme to storage:', error);
        }
    }

    /* ===============================================
       EXPENSE MANAGEMENT METHODS
       =============================================== */
    
    /**
     * Generate a unique ID for new expenses
     * Uses timestamp and random number for uniqueness
     */
    generateId() {
        return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Add a new expense to the collection
     */
    addExpense(expenseData) {
        const expense = {
            id: this.generateId(),
            title: expenseData.title.trim(),
            amount: parseFloat(expenseData.amount),
            category: expenseData.category,
            date: expenseData.date,
            notes: expenseData.notes?.trim() || '',
            createdAt: new Date().toISOString()
        };
        
        this.expenses.unshift(expense); // Add to beginning for recency
        this.saveExpensesToStorage();
        
        console.log('Added new expense:', expense);
        return expense;
    }
    
    /**
     * Update an existing expense
     */
    updateExpense(id, expenseData) {
        const index = this.expenses.findIndex(exp => exp.id === id);
        if (index === -1) {
            throw new Error('Expense not found');
        }
        
        this.expenses[index] = {
            ...this.expenses[index],
            title: expenseData.title.trim(),
            amount: parseFloat(expenseData.amount),
            category: expenseData.category,
            date: expenseData.date,
            notes: expenseData.notes?.trim() || ''
        };
        
        this.saveExpensesToStorage();
        
        console.log('Updated expense:', this.expenses[index]);
        return this.expenses[index];
    }
    
    /**
     * Delete an expense by ID
     */
    deleteExpense(id) {
        const index = this.expenses.findIndex(exp => exp.id === id);
        if (index === -1) {
            throw new Error('Expense not found');
        }
        
        const deleted = this.expenses.splice(index, 1)[0];
        this.saveExpensesToStorage();
        
        console.log('Deleted expense:', deleted);
        return deleted;
    }
    
    /**
     * Get expense by ID
     */
    getExpenseById(id) {
        return this.expenses.find(exp => exp.id === id);
    }

    /* ===============================================
       FORM HANDLING METHODS
       =============================================== */
    
    /**
     * Handle form submission for adding/editing expenses
     */
    handleFormSubmit(event) {
        event.preventDefault();
        
        // Clear previous validation errors
        this.clearValidationErrors();
        
        // Get form data
        const formData = {
            title: this.elements.titleInput.value,
            amount: this.elements.amountInput.value,
            category: this.elements.categorySelect.value,
            date: this.elements.dateInput.value,
            notes: this.elements.notesInput.value
        };
        
        // Validate form data
        const validationErrors = this.validateExpenseData(formData);
        
        if (validationErrors.length > 0) {
            this.displayValidationErrors(validationErrors);
            return;
        }
        
        try {
            if (this.isEditMode) {
                // Update existing expense
                this.updateExpense(this.editExpenseId, formData);
                this.showToast('Expense updated successfully!', 'success');
                this.exitEditMode();
            } else {
                // Add new expense
                this.addExpense(formData);
                this.showToast('Expense added successfully!', 'success');
            }
            
            // Reset form and refresh UI
            this.resetForm();
            this.renderUI();
            
            // Hide form on mobile
            if (window.innerWidth < 768) {
                this.hideExpenseForm();
            }
            
        } catch (error) {
            console.error('Error saving expense:', error);
            this.showToast('Error saving expense. Please try again.', 'error');
        }
    }
    
    /**
     * Validate expense data and return array of errors
     */
    validateExpenseData(data) {
        const errors = [];
        
        if (!data.title || data.title.trim().length === 0) {
            errors.push({ field: 'title', message: 'Title is required' });
        } else if (data.title.trim().length > 100) {
            errors.push({ field: 'title', message: 'Title must be less than 100 characters' });
        }
        
        if (!data.amount || parseFloat(data.amount) <= 0) {
            errors.push({ field: 'amount', message: 'Amount must be greater than 0' });
        } else if (parseFloat(data.amount) > 999999.99) {
            errors.push({ field: 'amount', message: 'Amount is too large' });
        }
        
        if (!data.category) {
            errors.push({ field: 'category', message: 'Please select a category' });
        }
        
        if (!data.date) {
            errors.push({ field: 'date', message: 'Date is required' });
        } else {
            const selectedDate = new Date(data.date);
            const today = new Date();
            if (selectedDate > today) {
                errors.push({ field: 'date', message: 'Date cannot be in the future' });
            }
        }
        
        return errors;
    }
    
    /**
     * Validate individual form field
     */
    validateField(fieldName) {
        const data = {
            title: this.elements.titleInput.value,
            amount: this.elements.amountInput.value,
            category: this.elements.categorySelect.value,
            date: this.elements.dateInput.value
        };
        
        const errors = this.validateExpenseData(data);
        const fieldError = errors.find(error => error.field === fieldName);
        
        const errorElement = document.getElementById(`${fieldName}-error`);
        const inputElement = this.elements[`${fieldName}Input`] || this.elements[`${fieldName}Select`];
        
        if (fieldError) {
            errorElement.textContent = fieldError.message;
            inputElement.classList.add('error');
        } else {
            errorElement.textContent = '';
            inputElement.classList.remove('error');
        }
    }
    
    /**
     * Display validation errors in the form
     */
    displayValidationErrors(errors) {
        errors.forEach(error => {
            const errorElement = document.getElementById(`${error.field}-error`);
            const inputElement = this.elements[`${error.field}Input`] || this.elements[`${error.field}Select`];
            
            if (errorElement && inputElement) {
                errorElement.textContent = error.message;
                inputElement.classList.add('error');
            }
        });
        
        // Focus on first error field
        if (errors.length > 0) {
            const firstErrorField = errors[0].field;
            const firstErrorElement = this.elements[`${firstErrorField}Input`] || this.elements[`${firstErrorField}Select`];
            if (firstErrorElement) {
                firstErrorElement.focus();
            }
        }
    }
    
    /**
     * Clear all validation error messages and styles
     */
    clearValidationErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        const inputElements = document.querySelectorAll('.form-group input, .form-group select');
        
        errorElements.forEach(el => el.textContent = '');
        inputElements.forEach(el => el.classList.remove('error'));
    }
    
    /**
     * Reset the expense form to initial state
     */
    resetForm() {
        this.elements.form.reset();
        this.clearValidationErrors();
        this.setDefaultDate();
        this.exitEditMode();
    }
    
    /**
     * Set default date to today
     */
    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        this.elements.dateInput.value = today;
    }
    
    /**
     * Show expense form (mobile overlay)
     */
    showExpenseForm() {
        this.elements.formSection.classList.add('show');
        this.elements.titleInput.focus();
    }
    
    /**
     * Hide expense form (mobile overlay)
     */
    hideExpenseForm() {
        this.elements.formSection.classList.remove('show');
        this.resetForm();
    }
    
    /**
     * Enter edit mode for an expense
     */
    editExpense(id) {
        const expense = this.getExpenseById(id);
        if (!expense) {
            this.showToast('Expense not found', 'error');
            return;
        }
        
        // Populate form with expense data
        this.elements.titleInput.value = expense.title;
        this.elements.amountInput.value = expense.amount;
        this.elements.categorySelect.value = expense.category;
        this.elements.dateInput.value = expense.date;
        this.elements.notesInput.value = expense.notes || '';
        this.elements.editIdInput.value = expense.id;
        
        // Set edit mode
        this.isEditMode = true;
        this.editExpenseId = expense.id;
        this.elements.submitBtnText.textContent = 'Update Expense';
        
        // Show form
        this.showExpenseForm();
        
        console.log('Entering edit mode for expense:', expense);
    }
    
    /**
     * Exit edit mode and return to add mode
     */
    exitEditMode() {
        this.isEditMode = false;
        this.editExpenseId = null;
        this.elements.editIdInput.value = '';
        this.elements.submitBtnText.textContent = 'Add Expense';
    }
    
    /**
     * Cancel edit and reset form
     */
    cancelEdit() {
        this.resetForm();
        this.hideExpenseForm();
    }

    /* ===============================================
       DELETE CONFIRMATION MODAL
       =============================================== */
    
    /**
     * Show delete confirmation modal
     */
    showDeleteModal(id) {
        this.deleteExpenseId = id;
        this.elements.deleteModal.classList.add('show');
        this.elements.cancelDeleteBtn.focus();
        
        // Trap focus in modal for accessibility
        this.trapFocus(this.elements.deleteModal);
    }
    
    /**
     * Hide delete confirmation modal
     */
    hideDeleteModal() {
        this.elements.deleteModal.classList.remove('show');
        this.deleteExpenseId = null;
    }
    
    /**
     * Confirm and execute delete operation
     */
    confirmDelete() {
        if (!this.deleteExpenseId) return;
        
        try {
            this.deleteExpense(this.deleteExpenseId);
            this.showToast('Expense deleted successfully', 'success');
            this.renderUI();
            this.hideDeleteModal();
        } catch (error) {
            console.error('Error deleting expense:', error);
            this.showToast('Error deleting expense', 'error');
        }
    }

    /* ===============================================
       FILTERING, SEARCHING, AND SORTING
       =============================================== */
    
    /**
     * Apply all active filters to the expenses list
     */
    applyFilters() {
        let filtered = [...this.expenses];
        
        // Apply search filter
        const searchTerm = this.elements.searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filtered = filtered.filter(expense => 
                expense.title.toLowerCase().includes(searchTerm) ||
                (expense.notes && expense.notes.toLowerCase().includes(searchTerm))
            );
        }
        
        // Apply category filter
        const categoryFilter = this.elements.categoryFilter.value;
        if (categoryFilter) {
            filtered = filtered.filter(expense => expense.category === categoryFilter);
        }
        
        // Apply date range filter
        const dateFrom = this.elements.dateFrom.value;
        const dateTo = this.elements.dateTo.value;
        
        if (dateFrom) {
            filtered = filtered.filter(expense => expense.date >= dateFrom);
        }
        
        if (dateTo) {
            filtered = filtered.filter(expense => expense.date <= dateTo);
        }
        
        // Apply sorting
        const sortBy = this.elements.sortSelect.value;
        filtered = this.sortExpenses(filtered, sortBy);
        
        // Update filtered expenses and reset pagination
        this.filteredExpenses = filtered;
        this.currentPage = 1;
        
        // Re-render expenses list
        this.renderExpensesList();
        
        console.log(`Applied filters: ${filtered.length} expenses match criteria`);
    }
    
    /**
     * Sort expenses array based on selected criteria
     */
    sortExpenses(expenses, sortBy) {
        const sorted = [...expenses];
        
        switch (sortBy) {
            case 'date-desc':
                return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            case 'date-asc':
                return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            case 'amount-desc':
                return sorted.sort((a, b) => b.amount - a.amount);
            case 'amount-asc':
                return sorted.sort((a, b) => a.amount - b.amount);
            default:
                return sorted;
        }
    }
    
    /**
     * Clear all active filters
     */
    clearAllFilters() {
        this.elements.searchInput.value = '';
        this.elements.categoryFilter.value = '';
        this.elements.dateFrom.value = '';
        this.elements.dateTo.value = '';
        this.elements.sortSelect.value = 'date-desc';
        
        this.applyFilters();
        this.showToast('All filters cleared', 'success');
    }

    /* ===============================================
       PAGINATION METHODS
       =============================================== */
    
    /**
     * Go to previous page
     */
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderExpensesList();
        }
    }
    
    /**
     * Go to next page
     */
    nextPage() {
        const totalPages = Math.ceil(this.filteredExpenses.length / CONFIG.PAGINATION.PAGE_SIZE);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderExpensesList();
        }
    }
    
    /**
     * Get paginated expenses for current page
     */
    getPaginatedExpenses() {
        const startIndex = (this.currentPage - 1) * CONFIG.PAGINATION.PAGE_SIZE;
        const endIndex = startIndex + CONFIG.PAGINATION.PAGE_SIZE;
        return this.filteredExpenses.slice(startIndex, endIndex);
    }
    
    /**
     * Update pagination controls
     */
    updatePaginationControls() {
        const totalPages = Math.ceil(this.filteredExpenses.length / CONFIG.PAGINATION.PAGE_SIZE);
        
        // Update buttons state
        this.elements.prevPageBtn.disabled = this.currentPage <= 1;
        this.elements.nextPageBtn.disabled = this.currentPage >= totalPages;
        
        // Update pagination info
        if (totalPages === 0) {
            this.elements.paginationInfo.textContent = 'No pages';
            this.elements.pagination.style.display = 'none';
        } else {
            this.elements.paginationInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
            this.elements.pagination.style.display = totalPages > 1 ? 'flex' : 'none';
        }
    }

    /* ===============================================
       STATISTICS AND CALCULATIONS
       =============================================== */
    
    /**
     * Calculate total amount spent across all expenses
     */
    calculateTotalSpent() {
        return this.expenses.reduce((total, expense) => total + expense.amount, 0);
    }
    
    /**
     * Calculate total spent in current month
     */
    calculateMonthlySpent() {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        return this.expenses
            .filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
            })
            .reduce((total, expense) => total + expense.amount, 0);
    }
    
    /**
     * Find the category with highest total spending
     */
    getBiggestCategory() {
        const categoryTotals = {};
        
        // Calculate totals for each category
        this.expenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        });
        
        // Find category with highest total
        let biggestCategory = '';
        let highestAmount = 0;
        
        Object.entries(categoryTotals).forEach(([category, amount]) => {
            if (amount > highestAmount) {
                highestAmount = amount;
                biggestCategory = category;
            }
        });
        
        return biggestCategory || '-';
    }
    
    /**
     * Get spending data grouped by category for pie chart
     */
    getCategoryData() {
        const categoryTotals = {};
        
        this.expenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        });
        
        return {
            labels: Object.keys(categoryTotals),
            amounts: Object.values(categoryTotals),
            colors: Object.keys(categoryTotals).map(cat => CONFIG.CATEGORY_COLORS[cat])
        };
    }
    
    /**
     * Get spending data grouped by month for bar chart
     */
    getMonthlyData() {
        const monthlyTotals = {};
        const currentDate = new Date();
        
        // Initialize last 12 months
        for (let i = 11; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            monthlyTotals[key] = { label, amount: 0 };
        }
        
        // Add expense amounts to corresponding months
        this.expenses.forEach(expense => {
            const expenseDate = new Date(expense.date);
            const key = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyTotals[key]) {
                monthlyTotals[key].amount += expense.amount;
            }
        });
        
        return {
            labels: Object.values(monthlyTotals).map(data => data.label),
            amounts: Object.values(monthlyTotals).map(data => data.amount)
        };
    }

    /* ===============================================
       CHART RENDERING METHODS
       =============================================== */
    
    /**
     * Render category pie chart
     */
    renderCategoryChart() {
        const categoryData = this.getCategoryData();
        
        // Show empty state if no data
        if (categoryData.labels.length === 0) {
            this.elements.categoryChart.style.display = 'none';
            this.elements.categoryEmpty.style.display = 'block';
            return;
        }
        
        // Show chart and hide empty state
        this.elements.categoryChart.style.display = 'block';
        this.elements.categoryEmpty.style.display = 'none';
        
        // Destroy existing chart
        if (this.charts.category) {
            this.charts.category.destroy();
        }
        
        // Create new chart
        const ctx = this.elements.categoryChart.getContext('2d');
        this.charts.category = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: categoryData.labels,
                datasets: [{
                    data: categoryData.amounts,
                    backgroundColor: categoryData.colors,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = this.formatCurrency(context.parsed);
                                const percentage = ((context.parsed / categoryData.amounts.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        console.log('Category chart rendered with', categoryData.labels.length, 'categories');
    }
    
    /**
     * Render monthly bar chart
     */
    renderMonthlyChart() {
        const monthlyData = this.getMonthlyData();
        
        // Check if there's any data
        const hasData = monthlyData.amounts.some(amount => amount > 0);
        
        if (!hasData) {
            this.elements.monthlyChart.style.display = 'none';
            this.elements.monthlyEmpty.style.display = 'block';
            return;
        }
        
        // Show chart and hide empty state
        this.elements.monthlyChart.style.display = 'block';
        this.elements.monthlyEmpty.style.display = 'none';
        
        // Destroy existing chart
        if (this.charts.monthly) {
            this.charts.monthly.destroy();
        }
        
        // Create new chart
        const ctx = this.elements.monthlyChart.getContext('2d');
        this.charts.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthlyData.labels,
                datasets: [{
                    label: 'Monthly Spending',
                    data: monthlyData.amounts,
                    backgroundColor: CONFIG.CATEGORY_COLORS['Travel'] + '80', // Semi-transparent
                    borderColor: CONFIG.CATEGORY_COLORS['Travel'],
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrency(value),
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        },
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border-light')
                        }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `Spending: ${this.formatCurrency(context.parsed.y)}`
                        }
                    }
                }
            }
        });
        
        console.log('Monthly chart rendered');
    }

    /* ===============================================
       UI RENDERING METHODS
       =============================================== */
    
    /**
     * Render all UI components
     */
    renderUI() {
        this.renderSummaryCards();
        this.renderCharts();
        this.applyFilters(); // This will trigger renderExpensesList()
    }
    
    /**
     * Render summary statistics cards
     */
    renderSummaryCards() {
        const totalSpent = this.calculateTotalSpent();
        const monthlySpent = this.calculateMonthlySpent();
        const biggestCategory = this.getBiggestCategory();
        const expenseCount = this.expenses.length;
        
        this.elements.totalSpent.textContent = this.formatCurrency(totalSpent);
        this.elements.monthlySpent.textContent = this.formatCurrency(monthlySpent);
        this.elements.biggestCategory.textContent = biggestCategory;
        this.elements.expenseCount.textContent = expenseCount;
    }
    
    /**
     * Render all charts
     */
    renderCharts() {
        this.renderCategoryChart();
        this.renderMonthlyChart();
    }
    
    /**
     * Render the expenses list with current filters and pagination
     */
    renderExpensesList() {
        const paginatedExpenses = this.getPaginatedExpenses();
        
        // Update filtered count
        this.elements.filteredCount.textContent = 
            `${this.filteredExpenses.length} expense${this.filteredExpenses.length !== 1 ? 's' : ''}`;
        
        // Show/hide no expenses message
        if (this.filteredExpenses.length === 0) {
            this.elements.expensesList.innerHTML = '';
            this.elements.expensesList.appendChild(this.elements.noExpenses);
            this.updatePaginationControls();
            return;
        }
        
        // Clear current list
        this.elements.expensesList.innerHTML = '';
        
        // Render each expense item
        paginatedExpenses.forEach(expense => {
            const expenseElement = this.createExpenseElement(expense);
            this.elements.expensesList.appendChild(expenseElement);
        });
        
        // Update pagination controls
        this.updatePaginationControls();
        
        console.log(`Rendered ${paginatedExpenses.length} expenses (page ${this.currentPage})`);
    }
    
    /**
     * Create DOM element for a single expense
     */
    createExpenseElement(expense) {
        const expenseDiv = document.createElement('div');
        expenseDiv.className = 'expense-item fade-in';
        expenseDiv.setAttribute('role', 'listitem');
        
        const formattedDate = this.formatDate(expense.date);
        const formattedAmount = this.formatCurrency(expense.amount);
        
        expenseDiv.innerHTML = `
            <div class="expense-main">
                <div class="expense-title">${this.escapeHtml(expense.title)}</div>
                <div class="expense-details">
                    <span class="category-badge ${expense.category.toLowerCase()}">${expense.category}</span>
                    <span class="expense-date">${formattedDate}</span>
                    ${expense.notes ? `<span class="expense-notes">${this.escapeHtml(expense.notes)}</span>` : ''}
                </div>
            </div>
            <div class="expense-amount">${formattedAmount}</div>
            <div class="expense-actions">
                <button class="icon-btn edit-btn" onclick="app.editExpense('${expense.id}')" 
                        aria-label="Edit expense" title="Edit">
                    ✏️
                </button>
                <button class="icon-btn delete-btn" onclick="app.showDeleteModal('${expense.id}')" 
                        aria-label="Delete expense" title="Delete">
                    🗑️
                </button>
            </div>
        `;
        
        return expenseDiv;
    }

    /* ===============================================
       IMPORT/EXPORT FUNCTIONALITY
       =============================================== */
    
    /**
     * Trigger file import dialog
     */
    triggerImport() {
        this.elements.importFileInput.click();
    }
    
    /**
     * Handle file import
     */
    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.json')) {
            this.showToast('Please select a JSON file', 'error');
            return;
        }
        
        // Read file
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                this.importExpenses(importData);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                this.showToast('Invalid JSON file format', 'error');
            }
        };
        
        reader.onerror = () => {
            this.showToast('Error reading file', 'error');
        };
        
        reader.readAsText(file);
        
        // Clear file input for next import
        event.target.value = '';
    }
    
    /**
     * Import expenses from JSON data
     */
    importExpenses(importData) {
        if (!Array.isArray(importData)) {
            this.showToast('JSON file must contain an array of expenses', 'error');
            return;
        }
        
        let importedCount = 0;
        let skippedCount = 0;
        
        importData.forEach(item => {
            // Validate expense structure
            if (this.validateImportExpense(item)) {
                // Check if expense with same ID already exists
                const existingExpense = this.getExpenseById(item.id);
                
                if (!existingExpense) {
                    // Add new expense (ensure ID is unique)
                    const expense = {
                        id: item.id || this.generateId(),
                        title: item.title?.trim() || 'Imported Expense',
                        amount: parseFloat(item.amount) || 0,
                        category: CONFIG.CATEGORIES.includes(item.category) ? item.category : 'Other',
                        date: item.date || new Date().toISOString().split('T')[0],
                        notes: item.notes?.trim() || '',
                        createdAt: item.createdAt || new Date().toISOString()
                    };
                    
                    this.expenses.push(expense);
                    importedCount++;
                } else {
                    skippedCount++;
                }
            } else {
                skippedCount++;
            }
        });
        
        // Save to storage and update UI
        if (importedCount > 0) {
            this.saveExpensesToStorage();
            this.renderUI();
        }
        
        // Show import summary
        let message = `Import complete: ${importedCount} expenses added`;
        if (skippedCount > 0) {
            message += `, ${skippedCount} skipped (invalid or duplicate)`;
        }
        
        this.showToast(message, importedCount > 0 ? 'success' : 'warning');
        
        console.log('Import summary:', { imported: importedCount, skipped: skippedCount });
    }
    
    /**
     * Validate imported expense structure
     */
    validateImportExpense(expense) {
        return (
            expense &&
            typeof expense === 'object' &&
            expense.title &&
            expense.amount &&
            !isNaN(parseFloat(expense.amount)) &&
            parseFloat(expense.amount) > 0
        );
    }
    
    /**
     * Export expenses to CSV format
     */
    exportToCSV() {
        if (this.expenses.length === 0) {
            this.showToast('No expenses to export', 'warning');
            return;
        }
        
        // Create CSV header
        const csvHeader = 'id,title,amount,category,date,notes,createdAt\n';
        
        // Create CSV rows
        const csvRows = this.expenses.map(expense => {
            return [
                expense.id,
                `"${expense.title.replace(/"/g, '""')}"`, // Escape quotes
                expense.amount,
                expense.category,
                expense.date,
                `"${(expense.notes || '').replace(/"/g, '""')}"`,
                expense.createdAt
            ].join(',');
        });
        
        // Combine header and rows
        const csvContent = csvHeader + csvRows.join('\n');
        
        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `expenses_export_${this.formatDateForFile()}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast(`Exported ${this.expenses.length} expenses to CSV`, 'success');
        
        console.log(`Exported ${this.expenses.length} expenses to CSV`);
    }
    
    /**
     * Check for sample data import from URL parameter
     */
    checkForSampleDataImport() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('importSample') === 'true' && this.expenses.length === 0) {
            // Load sample data
            fetch('./data/sample-expenses.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Sample data not found');
                    }
                    return response.json();
                })
                .then(sampleData => {
                    this.importExpenses(sampleData);
                    this.showToast('Sample data imported successfully!', 'success');
                })
                .catch(error => {
                    console.error('Error loading sample data:', error);
                    this.showToast('Sample data could not be loaded', 'error');
                });
        }
    }

    /* ===============================================
       THEME MANAGEMENT
       =============================================== */
    
    /**
     * Toggle between light and dark theme
     */
    toggleTheme() {
        const isDark = document.body.classList.toggle('dark');
        const themeIcon = this.elements.themeToggle.querySelector('.theme-icon');
        
        if (isDark) {
            themeIcon.textContent = '☀️';
            this.saveThemeToStorage('dark');
        } else {
            themeIcon.textContent = '🌙';
            this.saveThemeToStorage('light');
        }
        
        // Re-render charts to update colors
        setTimeout(() => this.renderCharts(), 100);
        
        this.showToast(`Switched to ${isDark ? 'dark' : 'light'} theme`, 'success');
    }

    /* ===============================================
       UTILITY AND HELPER METHODS
       =============================================== */
    
    /**
     * Format number as currency
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat(CONFIG.CURRENCY.LOCALE, {
            style: 'currency',
            currency: CONFIG.CURRENCY.CODE,
            minimumFractionDigits: 2
        }).format(amount);
    }
    
    /**
     * Format date for display
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString(CONFIG.CURRENCY.LOCALE, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    /**
     * Format date for filename
     */
    formatDateForFile() {
        const now = new Date();
        return now.toISOString().split('T')[0].replace(/-/g, '');
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }
    
    /**
     * Debounce function for performance optimization
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Trap focus within an element for modal accessibility
     */
    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }
    
    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        // Escape key to close modals/forms
        if (event.key === 'Escape') {
            if (this.elements.deleteModal.classList.contains('show')) {
                this.hideDeleteModal();
            } else if (this.elements.formSection.classList.contains('show') && window.innerWidth < 768) {
                this.hideExpenseForm();
            }
        }
        
        // Ctrl/Cmd + N to add new expense
        if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
            event.preventDefault();
            this.showExpenseForm();
        }
        
        // Ctrl/Cmd + E to export
        if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
            event.preventDefault();
            this.exportToCSV();
        }
    }
    
    /**
     * Show toast notification
     */
    showToast(message, type = 'success', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', 'alert');
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️'
        };
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || '💬'}</span>
            <span class="toast-message">${this.escapeHtml(message)}</span>
            <button class="toast-close" onclick="this.parentElement.remove()" aria-label="Close notification">×</button>
        `;
        
        this.elements.toastContainer.appendChild(toast);
        
        // Show toast with animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // Auto-remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.remove();
                    }
                }, 300);
            }
        }, duration);
        
        console.log(`Toast: ${type} - ${message}`);
    }
}

/* ===============================================
   APPLICATION INITIALIZATION
   =============================================== */

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance for onclick handlers
    window.app = new ExpenseTracker();
    
    console.log('Expense Tracker application started successfully');
});

// Service Worker Registration (if available)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}