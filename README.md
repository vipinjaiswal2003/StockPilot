# StockPilot – Responsive Inventory Dashboard

StockPilot is a clean, responsive inventory dashboard I built to showcase front-end skills in UI design, table layouts, and basic state management. It handles common inventory tasks like adding items, editing/deleting records, searching, filtering, and sorting — all without a backend.

This project complements BillSwift (invoice generator) to form a business-oriented front-end portfolio.

## ✨ Features
- **Inventory table** with: Item, Supplier, Stock, Value (₹/unit)
- **Add / Edit / Delete** items (modal form)
- **Search** (by item or supplier) & **filters** (supplier, low/out of stock)
- **Sorting** by clicking column headers
- **Responsive layout** using Bootstrap
- **LocalStorage** persistence (mocked data store)
- **Import / Export** inventory as JSON
- **Stats**: total SKUs, total units, inventory worth (Stock × Value)

> “Value” is per‑unit price. Overall **inventory worth** is calculated as the sum of `stock × value` for each item.

## 🧰 Tech Stack
- HTML, CSS, JavaScript
- [Bootstrap 5](https://getbootstrap.com/) + [Bootstrap Icons](https://icons.getbootstrap.com/)

## 📦 Getting Started
1. Download the ZIP and extract it.
2. Open `index.html` in a modern browser (Chrome/Edge/Firefox).
3. Use **Add Item** to create entries, **search & sort** to explore data.
4. Data is saved automatically in your browser’s **LocalStorage**.

> Use **Export** to back up a JSON file of your items. Restore with **Import**.

## 📁 Project Structure
```
inventory-dashboard-ui/
├── index.html   # UI layout (Bootstrap + modal form + table)
├── styles.css   # Custom styling & responsive tweaks
└── app.js       # CRUD, filters, sorting, LocalStorage, import/export
```


## 🔒 Optional Enhancements
- CSV import/export and bulk actions
- Category/tags per item and multi‑column filters
- Pagination or virtualized table for 1k+ items
- Role‑based access (if you add a backend)

