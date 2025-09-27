# ExpenseTracker - Offline Personal Finance Manager

A modern, responsive expense tracking web application built with vanilla HTML, CSS, and JavaScript. Features offline functionality, data visualization, and comprehensive expense management tools.

## ✨ Features

### Core Functionality
- **Add, Edit, Delete Expenses** - Complete CRUD operations with form validation
- **Persistent Storage** - All data saved locally using localStorage
- **Search & Filter** - Find expenses by title, notes, category, or date range
- **Smart Sorting** - Sort by date, amount (ascending/descending)
- **Pagination** - Efficient handling of large expense lists (25 items per page)

### Data Visualization
- **Category Pie Chart** - Visual breakdown of spending by category
- **Monthly Bar Chart** - Spending trends over the last 12 months
- **Summary Cards** - Key metrics at a glance (total spent, monthly spending, top category)

### Import/Export
- **CSV Export** - Export all expenses to CSV format with timestamp
- **JSON Import** - Import expense data from JSON files (merges with existing data)
- **Sample Data** - Pre-loaded sample expenses for testing and demonstration

### User Experience
- **Dark Mode** - Toggle between light and dark themes (preference saved)
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Accessibility** - Full keyboard navigation, ARIA labels, screen reader support
- **Form Validation** - Real-time validation with helpful error messages
- **Toast Notifications** - User feedback for all actions

### Categories
- Food
- Travel
- Shopping
- Bills
- Other

## 🚀 Getting Started

### Installation
1. **Download or clone** this repository
2. **Open `index.html`** in any modern web browser
3. **Start tracking** your expenses immediately!

No server required - this is a fully offline application.

### Quick Demo with Sample Data
To see the app with sample data, open: `index.html?importSample=true`

## 📱 Usage Guide

### Adding Expenses
1. Click **"Add Expense"** button
2. Fill in the required fields (Title, Amount, Category, Date)
3. Optionally add notes
4. Click **"Add Expense"** to save

### Managing Expenses
- **Edit**: Click the ✏️ icon next to any expense
- **Delete**: Click the 🗑️ icon and confirm deletion
- **Search**: Use the search box to find expenses by title or notes
- **Filter**: Filter by category or date range
- **Sort**: Choose sorting criteria (date/amount, ascending/descending)

### Importing Data
1. Click **"Import"** in the header
2. Select a JSON file with expense data
3. Data will be merged with existing expenses (duplicates skipped)

### Exporting Data
1. Click **"Export"** in the header
2. CSV file will download automatically with filename `expenses_export_YYYYMMDD.csv`

## ⌨️ Keyboard Shortcuts

- **Ctrl/Cmd + N**: Add new expense
- **Ctrl/Cmd + E**: Export to CSV
- **Escape**: Close modals or forms
- **Tab**: Navigate between form fields and buttons

## 🏗️ Technical Implementation

### Architecture
- **Vanilla JavaScript** (ES6+) with modular class-based structure
- **CSS Variables** for consistent theming and easy customization
- **Chart.js** for data visualization
- **localStorage** for data persistence
- **Responsive CSS Grid/Flexbox** layouts

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### File Structure
```
/
├── index.html          # Main application HTML
├── styles.css          # Complete styling with CSS variables
├── scripts.js          # Full application logic (~1000+ lines)
├── assets/
│   ├── logo.svg       # Application logo
│   └── favicon.svg    # Browser favicon
├── data/
│   └── sample-expenses.json  # Sample data for testing
└── README.md          # This documentation
```

## 🧪 Testing Checklist

To verify the application works correctly:

- [ ] **Add Expense**: Try valid and invalid inputs
- [ ] **Edit Expense**: Modify existing expense details
- [ ] **Delete Expense**: Confirm deletion modal appears and works
- [ ] **Search**: Find expenses by typing in search box
- [ ] **Filter**: Use category and date range filters
- [ ] **Sort**: Test all sorting options
- [ ] **Export CSV**: Download and verify file contents
- [ ] **Import JSON**: Upload sample data file
- [ ] **Dark Mode**: Toggle theme and verify persistence after page refresh
- [ ] **Charts**: Verify charts update when data changes
- [ ] **Persistence**: Add expense, refresh page, confirm data remains
- [ ] **Responsive**: Test on mobile, tablet, and desktop sizes

## 🎯 Resume Project Description

**Built an offline, responsive Expense Tracker web application using HTML, CSS and vanilla JavaScript. Implemented persistent storage with localStorage, dynamic charts using Chart.js, CSV export/import, filtering/searching, dark mode, and accessibility best practices. Demonstrates data handling, UI/UX design, and front-end engineering skills.**

## 📊 Data Format

### Expense Object Structure
```json
{
  "id": "exp_1640995200000_abc123",
  "title": "Grocery Shopping",
  "amount": 125.67,
  "category": "Food",
  "date": "2024-11-15",
  "notes": "Weekly groceries",
  "createdAt": "2024-11-15T10:30:00.000Z"
}
```

### CSV Export Format
```csv
id,title,amount,category,date,notes,createdAt
exp_123,Grocery Shopping,125.67,Food,2024-11-15,Weekly groceries,2024-11-15T10:30:00.000Z
```

## 🔧 Customization

### Adding New Categories
1. Edit `CONFIG.CATEGORIES` array in `scripts.js`
2. Add corresponding colors to `CONFIG.CATEGORY_COLORS`
3. Update category options in `index.html`

### Modifying Currency
1. Update `CONFIG.CURRENCY` settings in `scripts.js`
2. Adjust locale and currency code as needed

### Styling Changes
1. Modify CSS variables in `:root` section of `styles.css`
2. Colors, fonts, spacing, and breakpoints are all configurable

## 📝 License

This project is released under the MIT License. Feel free to use, modify, and distribute.

---

**ExpenseTracker** - Track your spending, understand your habits, and take control of your finances. 💰