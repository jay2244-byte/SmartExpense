# SmartExpense 💰

A full-stack expense tracker application with multi-currency support.

## Features
- **Track Expenses**: Add daily expenses with categories.
- **Multi-Currency**: Support for USD, INR, EUR, GBP, JPY.
- **Visualizations**: Monthly summaries and category-wise breakdown charts.
- **Tech Stack**: React (Frontend) + Node.js/Express (Backend) + SQLite (Database).

## How to Run
The project is configured as a merged application (Frontend + Backend in one).

1. **Install Dependencies** (First time only)
   ```bash
   cd client
   npm install
   cd ../server
   npm install
   ```

2. **Build Frontend** (If code changed)
   ```bash
   cd client
   npm run build
   ```

3. **Start Application**
   ```bash
   cd server
   node index.js
   ```
   Open [http://localhost:5000](http://localhost:5000).

## Project Structure
- `/client`: React Frontend
- `/server`: Express Backend and Database (`expense.db`)
