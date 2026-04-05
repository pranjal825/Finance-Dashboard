# Finio — Personal Finance Dashboard 💰

> A sleek, fully client-side personal finance tracker with dark/light mode, interactive charts, role-based access, and CSV export — built with vanilla JS, Chart.js, and Tailwind CSS.

![Finio Dashboard](https://img.shields.io/badge/Status-Active-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![Chart.js](https://img.shields.io/badge/Chart.js-4.4.1-ff6384) ![TailwindCSS](https://img.shields.io/badge/Tailwind-CDN-38bdf8)

---

## 📸 Preview

| Dark Mode | Light Mode |
|-----------|------------|
| Overview with trend chart & donut | Same layout, light palette |

---

## ✨ Features

- **Overview Dashboard** — Summary cards for Total Balance, Income, Expenses & Savings Rate with month-over-month change badges
- **Balance Trend Chart** — Line chart showing Income, Expenses & Net over the last 6 months
- **Spending Donut Chart** — Category-wise expense breakdown with total rendered in the true center of the ring
- **Transactions Page** — Full history with search, filter by type/category/month, sort by date/amount
- **Insights Page** — Auto-generated insight cards + grouped monthly bar chart + horizontal spending breakdown
- **Add / Edit / Delete** — Modal form to manage transactions with full validation
- **Role-Based Access** — Admin (full CRUD) and Viewer (read-only) modes
- **Dark / Light Theme** — Toggle with preference saved to localStorage
- **CSV Export** — One-click download of filtered transactions
- **Overview Filters** — Filter the dashboard charts and recent transactions simultaneously

---

## 🗂️ Project Structure

```
finio/
├── index.html       # App shell, layout, pages, modal
├── style.css        # CSS variables (tokens), component styles, animations
└── app.js           # All JS — state, charts, filters, CRUD, theme, export
```

---

## 🚀 Getting Started

No build step required. Just open in a browser.

### Option 1 — Open directly
```bash
# Clone the repo
git clone https://github.com/your-username/finio.git

# Open in browser
open index.html
```

### Option 2 — Local dev server (recommended)
```bash
# Using VS Code Live Server extension
# Right-click index.html → Open with Live Server

# OR using Python
python -m http.server 8080
# Visit http://localhost:8080
```

---

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| **Vanilla JavaScript (ES6+)** | All app logic, state management |
| **Chart.js 4.4.1** | Line, Doughnut, Bar charts |
| **Tailwind CSS (Play CDN)** | Utility-first layout & spacing |
| **DM Serif Display + DM Sans** | Typography (Google Fonts) |
| **localStorage** | Client-side data persistence |

---

## 📊 Charts

| Chart | Page | Type |
|---|---|---|
| Balance Trend | Overview | Line (Income / Expenses / Net) |
| Spending by Category | Overview | Doughnut with canvas center text |
| Monthly Income vs Expenses | Insights | Grouped Bar |
| Spending Breakdown | Insights | Horizontal progress bars |

All charts support **dark and light themes** — colors update automatically on toggle.

---

## 👤 Role System

| Feature | Admin | Viewer |
|---|---|---|
| View dashboard | ✅ | ✅ |
| Add transaction | ✅ | ❌ |
| Edit transaction | ✅ | ❌ |
| Delete transaction | ✅ | ❌ |
| Export CSV | ✅ | ✅ |

Switch roles using the dropdown in the sidebar.

---

## 🎛️ Filters

Both the **Overview** and **Transactions** pages support:

- 🔍 **Search** — by description or category
- 📂 **Type** — Income / Expense / All
- 🏷️ **Category** — Housing, Food & Dining, Transport, etc.
- 📅 **Month** — Any month present in the data

Overview filters also update the **summary cards** and **charts** in real time.

---

## 💾 Data & Persistence

- Transactions are stored in **`localStorage`** under the key `finio_transactions`
- Theme preference stored under `finio_theme`
- Comes pre-loaded with **30 seed transactions** across Jan–Jun 2025
- All charts auto-anchor to the **most recent transaction date** (not today's date) — so seed data always displays correctly

---

## 📁 Seed Data

30 sample transactions included out of the box covering:

- Monthly salaries (Jan–Jun 2025)
- Rent payments
- Food & dining (Zomato, Swiggy, BigBasket)
- Freelance income
- Investments (stock dividend)
- Utilities, shopping, health, entertainment, education

---

## 🔧 Customisation

### Add a new category
In `app.js` → `CAT_EMOJI` object (Section 1):
```js
const CAT_EMOJI = {
  'Your Category': '🎯',   // ← add here
  ...
};
```
Then add it to the `<select id="f-cat">` in `index.html`.

### Change accent color
In `style.css` → `:root` (Section 1):
```css
--accent: #c8f264;   /* dark mode accent */
```
```css
.light {
  --accent: #5a9e00; /* light mode accent */
}
```

---

## 📤 CSV Export

Click **↓ Export** on the Overview page. Downloads a `.csv` file of all currently filtered transactions with columns: `ID, Description, Amount, Type, Category, Date`.
*Made with ❤️by Pranjal *