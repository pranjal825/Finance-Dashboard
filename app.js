/* ================================================================
   1. CONSTANTS & LOOKUP MAPS
================================================================ */

/** Chart.js palette — dark mode */
const COLORS_DARK  = ['#c8f264','#4a9eff','#ff6b7a','#ffb547','#a78bfa','#40d9a0','#ff9f43','#ee5a24'];
/** Chart.js palette — light mode */
const COLORS_LIGHT = ['#5a9e00','#2070d0','#d83040','#c07800','#6d4fd4','#0a9e6e','#c07010','#b83018'];

/** Category → emoji mapping */
const CAT_EMOJI = {
  'Food & Dining': '🍜',
  'Housing':       '🏠',
  'Transport':     '🚌',
  'Shopping':      '🛍',
  'Entertainment': '🎬',
  'Health':        '❤️',
  'Education':     '📚',
  'Utilities':     '💡',
  'Salary':        '💼',
  'Freelance':     '💻',
  'Investment':    '📈',
  'Other':         '✦',
};

/** Chart.js instance references — kept so we can destroy before re-render */
let trendChartInst   = null;
let donutChartInst   = null;
let monthlyChartInst = null;


/* ================================================================
   2. APPLICATION STATE
================================================================ */

let role      = 'admin';    // 'admin' | 'viewer'
let sortBy    = 'date';     // column currently sorted by
let sortDir   = 'desc';     // 'asc' | 'desc'
let editingId = null;       // id of transaction being edited, or null

// Overview filters
let overviewSearch = '';
let overviewType   = '';
let overviewCat    = '';
let overviewMonth  = '';


/* ================================================================
   3. MOCK / SEED DATA
================================================================ */

const DEFAULT_TRANSACTIONS = [
  { id:1,  desc:'Salary — June',       amount:85000, type:'income',  cat:'Salary',        date:'2025-06-01' },
  { id:2,  desc:'Rent',                amount:18000, type:'expense', cat:'Housing',       date:'2025-06-02' },
  { id:3,  desc:'Zomato Order',         amount:650,   type:'expense', cat:'Food & Dining', date:'2025-06-03' },
  { id:4,  desc:'Freelance Project',    amount:22000, type:'income',  cat:'Freelance',     date:'2025-06-05' },
  { id:5,  desc:'Metro Pass',           amount:800,   type:'expense', cat:'Transport',     date:'2025-06-06' },
  { id:6,  desc:'Electricity Bill',     amount:1400,  type:'expense', cat:'Utilities',     date:'2025-06-07' },
  { id:7,  desc:'Amazon Shopping',      amount:3200,  type:'expense', cat:'Shopping',      date:'2025-06-09' },
  { id:8,  desc:'Netflix',              amount:649,   type:'expense', cat:'Entertainment', date:'2025-06-10' },
  { id:9,  desc:'Gym Membership',       amount:1200,  type:'expense', cat:'Health',        date:'2025-06-11' },
  { id:10, desc:'Udemy Course',         amount:499,   type:'expense', cat:'Education',     date:'2025-06-12' },
  { id:11, desc:'Salary — May',         amount:85000, type:'income',  cat:'Salary',        date:'2025-05-01' },
  { id:12, desc:'Rent',                 amount:18000, type:'expense', cat:'Housing',       date:'2025-05-02' },
  { id:13, desc:'Swiggy Order',         amount:480,   type:'expense', cat:'Food & Dining', date:'2025-05-04' },
  { id:14, desc:'Petrol',               amount:2200,  type:'expense', cat:'Transport',     date:'2025-05-05' },
  { id:15, desc:'Grocery — BigBasket',  amount:3800,  type:'expense', cat:'Food & Dining', date:'2025-05-08' },
  { id:16, desc:'Stock Dividend',       amount:5500,  type:'income',  cat:'Investment',    date:'2025-05-15' },
  { id:17, desc:'Electricity Bill',     amount:1200,  type:'expense', cat:'Utilities',     date:'2025-05-07' },
  { id:18, desc:'Movie Tickets',        amount:900,   type:'expense', cat:'Entertainment', date:'2025-05-18' },
  { id:19, desc:'Salary — April',       amount:85000, type:'income',  cat:'Salary',        date:'2025-04-01' },
  { id:20, desc:'Rent',                 amount:18000, type:'expense', cat:'Housing',       date:'2025-04-02' },
  { id:21, desc:'Freelance Design',     amount:15000, type:'income',  cat:'Freelance',     date:'2025-04-10' },
  { id:22, desc:'Doctor Visit',         amount:700,   type:'expense', cat:'Health',        date:'2025-04-14' },
  { id:23, desc:'Clothes Shopping',     amount:4500,  type:'expense', cat:'Shopping',      date:'2025-04-20' },
  { id:24, desc:'Salary — March',       amount:82000, type:'income',  cat:'Salary',        date:'2025-03-01' },
  { id:25, desc:'Rent',                 amount:18000, type:'expense', cat:'Housing',       date:'2025-03-02' },
  { id:26, desc:'Zomato',               amount:1200,  type:'expense', cat:'Food & Dining', date:'2025-03-10' },
  { id:27, desc:'Salary — February',    amount:82000, type:'income',  cat:'Salary',        date:'2025-02-01' },
  { id:28, desc:'Rent',                 amount:17500, type:'expense', cat:'Housing',       date:'2025-02-02' },
  { id:29, desc:'Salary — January',     amount:80000, type:'income',  cat:'Salary',        date:'2025-01-01' },
  { id:30, desc:'Rent',                 amount:17500, type:'expense', cat:'Housing',       date:'2025-01-02' },
];


/* ================================================================
   4. PERSISTENCE  (localStorage)
================================================================ */

function loadTransactions() {
  const saved = localStorage.getItem('finio_transactions');
  return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
}

function persistTransactions() {
  localStorage.setItem('finio_transactions', JSON.stringify(transactions));
}

/** Mutable transactions array — single source of truth */
let transactions = loadTransactions();


/* ================================================================
   5. UTILITY HELPERS
================================================================ */

/** Format a number as Indian-locale currency string */
function fmt(n) {
  return '₹' + Math.abs(n).toLocaleString('en-IN');
}

/** Format a date string as "12 Jun 2025" */
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/** Are we currently in dark mode? */
function isDark() {
  return !document.documentElement.classList.contains('light');
}

/** Return the correct color palette based on current theme */
function getColors() {
  return isDark() ? COLORS_DARK : COLORS_LIGHT;
}

/** Axis/legend text color for Chart.js */
function getTextColor()  { return isDark() ? '#9099b0' : '#5a6280'; }

/** Grid line color for Chart.js */
function getGridColor()  { return isDark() ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'; }

/** Generate a next unique id from the existing array */
function nextId() {
  return transactions.reduce((max, t) => Math.max(max, t.id), 0) + 1;
}
function getRefDate() {
    if (!transactions.length) return new Date();
    const Latest = transactions.reduce((max,t) => t.date > max ? t.date : max, transactions[0].date);
    return new Date(Latest);
}


/** Get filtered transactions for overview */
function getOverviewFiltered() {
  return transactions.filter(t => {
    if (overviewSearch && !t.desc.toLowerCase().includes(overviewSearch) && !t.cat.toLowerCase().includes(overviewSearch)) return false;
    if (overviewType   && t.type !== overviewType)   return false;
    if (overviewCat    && t.cat  !== overviewCat)    return false;
    if (overviewMonth  && !t.date.startsWith(overviewMonth)) return false;
    return true;
  });
}


/* ================================================================
   6. NAVIGATION
================================================================ */

/**
 * navigate(page, el)
 * Show the correct page section and mark the nav item active.
 * @param {string} page  - 'overview' | 'transactions' | 'insights'
 * @param {Element|null} el - the clicked nav element (or null)
 */
function navigate(page, el) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // Deactivate all nav items
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Show requested page
  document.getElementById('page-' + page).classList.add('active');

  // Mark nav item active
  if (el) {
    el.classList.add('active');
  } else {
    document.querySelectorAll('.nav-item').forEach(n => {
      if (n.textContent.toLowerCase().includes(page)) n.classList.add('active');
    });
  }

  // Lazy-build page-specific content
  if (page === 'insights')      buildInsights();
  if (page === 'transactions') { renderTransactions(); populateFilters(); }
  if (page === 'overview')     { populateOverviewFilters(); updateStats(); }
}


/* ================================================================
   7. ROLE-BASED UI
================================================================ */

/**
 * setRole(r)
 * Switch between 'admin' and 'viewer'.
 * Admin can add, edit, delete. Viewer is read-only.
 */
function setRole(r) {
  role = r;
  const canEdit = r === 'admin';

  // Update button text
  const roleButton = document.getElementById('roleButton');
  roleButton.textContent = r === 'admin' ? '⚡ Admin ▼' : '👁 Viewer ▼';

  // Close dropdown
  document.getElementById('roleDropdown').classList.add('hidden');

  // Show/hide Add buttons
  document.getElementById('addTxnBtn').style.display  = canEdit ? '' : 'none';
  document.getElementById('addTxnBtn2').style.display = canEdit ? '' : 'none';

  // Show/hide Actions column header
  document.getElementById('editColHeader').textContent = canEdit ? 'Actions' : '';

  // Re-render tables to add/remove edit controls
  renderTransactions();
  updateStats();
}

/** Toggle role dropdown visibility */
function toggleRoleDropdown() {
  const dropdown = document.getElementById('roleDropdown');
  dropdown.classList.toggle('hidden');
}


/* ================================================================
   8. STATS  (Summary Cards)
================================================================ */

/**
 * updateStats()
 * Recalculates all summary card values and triggers chart rebuilds.
 */
function updateStats() {
  const filtered = getOverviewFiltered();
  const now  = getRefDate();
  const curM = now.getMonth(),  curY = now.getFullYear();
  const prevM = curM === 0 ? 11 : curM - 1;
  const prevY = curM === 0 ? curY - 1 : curY;

  /** Aggregate income and expenses for a given month/year */
  function monthlyStats(txns, m, y) {
    const subset = txns.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === m && d.getFullYear() === y;
    });
    return {
      inc: subset.filter(x => x.type === 'income') .reduce((a, b) => a + b.amount, 0),
      exp: subset.filter(x => x.type === 'expense').reduce((a, b) => a + b.amount, 0),
    };
  }

  const cur  = monthlyStats(filtered, curM,  curY);
  const prev = monthlyStats(filtered, prevM, prevY);

  const totalInc = filtered.filter(x => x.type === 'income') .reduce((a, b) => a + b.amount, 0);
  const totalExp = filtered.filter(x => x.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const balance  = totalInc - totalExp;
  const savings  = totalInc > 0 ? Math.round((balance / totalInc) * 100) : 0;

  // Update DOM
  document.getElementById('stat-balance').textContent = Math.abs(balance).toLocaleString('en-IN');
  document.getElementById('stat-income') .textContent = totalInc.toLocaleString('en-IN');
  document.getElementById('stat-expense').textContent = totalExp.toLocaleString('en-IN');
  document.getElementById('stat-savings').textContent = savings + '%';

  /**
   * Helper to update a change badge.
   * @param {string}  id             - element id
   * @param {number}  cur            - current value
   * @param {number}  prev           - previous value
   * @param {boolean} lowerIsBetter  - for expenses: down = good
   */
  function updateChangeBadge(id, cur, prev, lowerIsBetter = false) {
    const el  = document.getElementById(id);
    if (prev === 0) { el.textContent = 'New'; return; }
    const pct = Math.round(((cur - prev) / prev) * 100);
    const up  = pct >= 0;
    el.textContent  = (up ? '↑' : '↓') + ' ' + Math.abs(pct) + '% vs last month';
    el.className    = 'card-change inline-flex items-center gap-1 text-[12px] font-medium px-2 py-1 rounded-md mt-2 ' +
                      (lowerIsBetter ? (up ? 'down' : 'up') : (up ? 'up' : 'down'));
  }

  updateChangeBadge('stat-income-change',  cur.inc, prev.inc);
  updateChangeBadge('stat-expense-change', cur.exp, prev.exp, true);
  updateChangeBadge('stat-balance-change', cur.inc - cur.exp, prev.inc - prev.exp);

  // Rebuild charts with fresh data
  buildTrendChart();
  buildDonutChart();
  renderRecent();
}


/* ================================================================
   9. CHARTS
================================================================ */

/* ── 9a. Trend Line Chart (Overview) ── */
function buildTrendChart() {
  const filtered = getOverviewFiltered();
  const labels = [], incData = [], expData = [], balData = [];
  const now = getRefDate();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth(), y = d.getFullYear();
    labels.push(d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }));

    const subset = filtered.filter(t => {
      const dd = new Date(t.date);
      return dd.getMonth() === m && dd.getFullYear() === y;
    });
    const I = subset.filter(x => x.type === 'income') .reduce((a, b) => a + b.amount, 0);
    const E = subset.filter(x => x.type === 'expense').reduce((a, b) => a + b.amount, 0);
    incData.push(I); expData.push(E); balData.push(I - E);
  }

  const ctx    = document.getElementById('trendChart').getContext('2d');
  const accent = isDark() ? '#c8f264' : '#5a9e00';
  const blue   = isDark() ? '#4a9eff' : '#2070d0';
  const red    = isDark() ? '#ff6b7a' : '#d83040';
  const tc     = getTextColor();
  const gc     = getGridColor();

  if (trendChartInst) trendChartInst.destroy();

  trendChartInst = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Income',   data: incData, borderColor: blue,   backgroundColor: 'transparent', tension: 0.4, pointRadius: 3, borderWidth: 2 },
        { label: 'Expenses', data: expData, borderColor: red,    backgroundColor: 'transparent', tension: 0.4, pointRadius: 3, borderWidth: 2 },
        { label: 'Net',      data: balData, borderColor: accent, backgroundColor: isDark() ? 'rgba(200,242,100,0.08)' : 'rgba(90,158,0,0.08)', fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2.5 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, labels: { color: tc, boxWidth: 10, font: { size: 11 }, padding: 12 } },
      },
      scales: {
        x: { ticks: { color: tc, font: { size: 11 } }, grid: { color: gc } },
        y: {
          ticks: {
            color: tc, font: { size: 11 },
            callback: v => v >= 100000 ? '₹' + (v / 100000).toFixed(0) + 'L' : '₹' + (v / 1000).toFixed(0) + 'K',
          },
          grid: { color: gc },
        },
      },
    },
  });
}

/* ── 9b. Donut / Pie Chart (Overview) ── */
function buildDonutChart() {
  const filtered = transactions.filter(t => {
    if (overviewSearch && !t.desc.toLowerCase().includes(overviewSearch) && !t.cat.toLowerCase().includes(overviewSearch)) return false;
    if (overviewCat  && t.cat !== overviewCat)   return false;
    if (overviewMonth && !t.date.startsWith(overviewMonth)) return false;
    return true;
  });
  const catTotals = {};
  filtered.filter(t => t.type === 'expense').forEach(t => {
    catTotals[t.cat] = (catTotals[t.cat] || 0) + t.amount;
  });

  const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const total  = Object.values(catTotals).reduce((a, b) => a + b, 0);

  //cument.getElementById('donutTotal').textContent = fmt(total);

  const ctx = document.getElementById('donutChart').getContext('2d');
  const C   = getColors();

  if (donutChartInst) donutChartInst.destroy();

  donutChartInst = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: sorted.map(([k]) => k),
      datasets: [{
        data:            sorted.map(([, v]) => v),
        backgroundColor: sorted.map((_, i) => C[i % C.length]),
        borderWidth:     2,
        borderColor:     isDark() ? '#13161e' : '#ffffff',
        hoverOffset:     8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'right',
          labels: { color: getTextColor(), boxWidth: 10, font: { size: 11 }, padding: 10 },
        },
      },
    },
  });
}
    plugins: [{                   
      id: 'centerText',
      afterDraw(chart) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        if (!meta || !meta.data || !meta.data[0]) return;
        const arc = meta.data[0];
        const cx  = arc.x;
        const cy  = arc.y;
        ctx.save();
        ctx.font         = 'bold 20px sans-serif';
        ctx.fillStyle    = isDark() ? '#ffffff' : '#111111';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(fmt(total), cx, cy - 10);
        ctx.font      = '12px sans-serif';
        ctx.fillStyle = getTextColor();
        ctx.fillText('expenses', cx, cy + 14);
        ctx.restore();
      }
    }]
  
/* ── 9c. Monthly Grouped Bar Chart (Insights) ── */
function buildMonthlyChart() {
  const labels = [], incData = [], expData = [];
  const now = getRefDate();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth(), y = d.getFullYear();
    labels.push(d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }));

    const subset = transactions.filter(t => {
      const dd = new Date(t.date);
      return dd.getMonth() === m && dd.getFullYear() === y;
    });
    incData.push(subset.filter(x => x.type === 'income') .reduce((a, b) => a + b.amount, 0));
    expData.push(subset.filter(x => x.type === 'expense').reduce((a, b) => a + b.amount, 0));
  }

  const ctx = document.getElementById('monthlyChart').getContext('2d');
  const tc  = getTextColor();
  const gc  = getGridColor();

  if (monthlyChartInst) monthlyChartInst.destroy();

  monthlyChartInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Income',   data: incData, backgroundColor: isDark() ? 'rgba(74,158,255,0.7)'  : 'rgba(32,112,208,0.7)',  borderRadius: 6 },
        { label: 'Expenses', data: expData, backgroundColor: isDark() ? 'rgba(255,107,122,0.7)' : 'rgba(216,48,64,0.7)',   borderRadius: 6 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: tc, boxWidth: 10, font: { size: 11 }, padding: 12 } },
      },
      scales: {
        x: { ticks: { color: tc, font: { size: 11 } }, grid: { display: false } },
        y: {
          ticks: {
            color: tc, font: { size: 11 },
            callback: v => v >= 100000 ? '₹' + (v / 100000).toFixed(0) + 'L' : '₹' + (v / 1000).toFixed(0) + 'K',
          },
          grid: { color: gc },
        },
      },
    },
  });
}


/* ================================================================
   10. TRANSACTION TABLE HELPERS
================================================================ */

/**
 * txnRow(t, withEdit)
 * Generate the HTML string for one <tr> in the transactions table.
 */
function txnRow(t, withEdit = true) {
  const C    = getColors();
  const cats = Object.keys(CAT_EMOJI);
  const ci   = cats.indexOf(t.cat) % COLORS_DARK.length;
  const col  = C[Math.max(ci, 0)];

  const editCell = (withEdit && role === 'admin')
    ? `<td class="text-center">
         <button class="px-2 py-1 text-[11px] rounded-lg border border-[var(--border2)] bg-[var(--bg2)] text-[var(--text2)] hover:text-[var(--text)] mr-1 transition-all" onclick="editTxn(${t.id})">Edit</button>
         <button class="px-2 py-1 text-[11px] rounded-lg border border-[var(--red-dim)] bg-[var(--red-dim)] text-[var(--red)] hover:opacity-80 transition-all" onclick="deleteTxn(${t.id})">✕</button>
       </td>`
    : '<td></td>';

  return `
    <tr>
      <td class="font-medium">${t.desc}</td>
      <td>
        <span class="cat-badge" style="background:${col}22;color:${col}">
          ${CAT_EMOJI[t.cat] || '✦'} ${t.cat}
        </span>
      </td>
      <td class="text-[var(--text2)]">${fmtDate(t.date)}</td>
      <td><span class="type-badge type-${t.type}">${t.type}</span></td>
      <td class="text-right amount-${t.type}">${t.type === 'income' ? '+' : '−'} ${fmt(t.amount)}</td>
      ${editCell}
    </tr>`;
}

/* ── Recent transactions (Overview page, last 5) ── */
function renderRecent() {
  const filtered = getOverviewFiltered();
  const tbody  = document.getElementById('recentTbody');
  const recent = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  if (!recent.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">No transactions yet</div></div></td></tr>`;
    return;
  }
  tbody.innerHTML = recent.map(t => txnRow(t, false)).join('');
}


/* ================================================================
   11. FILTER & SORT  (Transactions page)
================================================================ */

/** Populate category and month <select> dropdowns from live data */
function populateFilters() {
  const cats   = [...new Set(transactions.map(t => t.cat))].sort();
  const months = [...new Set(transactions.map(t => t.date.substring(0, 7)))].sort().reverse();

  document.getElementById('filterCat').innerHTML =
    '<option value="">All Categories</option>' +
    cats.map(c => `<option>${c}</option>`).join('');

  document.getElementById('filterMonth').innerHTML =
    '<option value="">All Months</option>' +
    months.map(m => {
      const d = new Date(m + '-01');
      return `<option value="${m}">${d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</option>`;
    }).join('');
}

/** Populate overview filters */
function populateOverviewFilters() {
  const cats   = [...new Set(transactions.map(t => t.cat))].sort();
  const months = [...new Set(transactions.map(t => t.date.substring(0, 7)))].sort().reverse();

  document.getElementById('overviewFilterCat').innerHTML =
    '<option value="">All Categories</option>' +
    cats.map(c => `<option>${c}</option>`).join('');

  document.getElementById('overviewFilterMonth').innerHTML =
    '<option value="">All Months</option>' +
    months.map(m => {
      const d = new Date(m + '-01');
      return `<option value="${m}">${d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</option>`;
    }).join('');
}

/** Reset all filters to their default state */
function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('filterType').value  = '';
  document.getElementById('filterCat').value   = '';
  document.getElementById('filterMonth').value = '';
  renderTransactions();
}

/** Reset overview filters */
function clearOverviewFilters() {
  document.getElementById('overviewSearchInput').value = '';
  document.getElementById('overviewFilterType').value  = '';
  document.getElementById('overviewFilterCat').value   = '';
  document.getElementById('overviewFilterMonth').value = '';
  overviewSearch = '';
  overviewType   = '';
  overviewCat    = '';
  overviewMonth  = '';
  updateStats();
}

/** Update overview filters and refresh */
function updateOverviewFilters() {
  overviewSearch = (document.getElementById('overviewSearchInput')?.value || '').toLowerCase();
  overviewType   = document.getElementById('overviewFilterType')?.value  || '';
  overviewCat    = document.getElementById('overviewFilterCat')?.value   || '';
  overviewMonth  = document.getElementById('overviewFilterMonth')?.value || '';
  updateStats();
}

/**
 * setSortBy(col)
 * Toggle sort direction if same column, else switch column.
 */
function setSortBy(col) {
  if (sortBy === col) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy  = col;
    sortDir = 'desc';
  }
  // Update button indicators
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('sort-' + col);
  if (btn) { btn.classList.add('active'); btn.textContent = sortDir === 'asc' ? '↑' : '↓'; }

  renderTransactions();
}

/** Read filters → filter → sort → render table */
function renderTransactions() {
  const q     = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const type  = document.getElementById('filterType')?.value  || '';
  const cat   = document.getElementById('filterCat')?.value   || '';
  const month = document.getElementById('filterMonth')?.value || '';

  // 1. Filter
  let filtered = transactions.filter(t => {
    if (q     && !t.desc.toLowerCase().includes(q) && !t.cat.toLowerCase().includes(q)) return false;
    if (type  && t.type !== type)                  return false;
    if (cat   && t.cat  !== cat)                   return false;
    if (month && !t.date.startsWith(month))        return false;
    return true;
  });

  // 2. Sort
  filtered.sort((a, b) => {
    const va = sortBy === 'amount' ? a.amount : new Date(a.date);
    const vb = sortBy === 'amount' ? b.amount : new Date(b.date);
    return sortDir === 'asc' ? va - vb : vb - va;
  });

  // 3. Render
  const tbody = document.getElementById('txnTbody');
  if (!filtered.length) {
    tbody.innerHTML = `
      <tr><td colspan="6">
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <div class="empty-text">No transactions match your filters</div>
        </div>
      </td></tr>`;
  } else {
    tbody.innerHTML = filtered.map(t => txnRow(t, true)).join('');
  }

  // 4. Footer summary
  document.getElementById('txnCount').textContent =
    filtered.length + ' transaction' + (filtered.length !== 1 ? 's' : '');

  const net = filtered.reduce((a, t) => a + (t.type === 'income' ? t.amount : -t.amount), 0);
  const netEl = document.getElementById('txnTotal');
  netEl.textContent = 'Net: ' + (net >= 0 ? '+' : '') + fmt(net);
  netEl.style.color  = net >= 0 ? 'var(--blue)' : 'var(--red)';
}


/* ================================================================
   12. INSIGHTS PAGE
================================================================ */

function buildInsights() {
  // Expense totals by category
  const catTotals = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    catTotals[t.cat] = (catTotals[t.cat] || 0) + t.amount;
  });
  const sorted   = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const topCat   = sorted[0];
  const totalExp = sorted.reduce((a, [, v]) => a + v, 0);
  const totalInc = transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const savings  = totalInc > 0 ? Math.round(((totalInc - totalExp) / totalInc) * 100) : 0;

  // Month-over-month comparison
  const now  = new Date();
  function mStats(m, y) {
    const subset = transactions.filter(t => { const d = new Date(t.date); return d.getMonth() === m && d.getFullYear() === y; });
    return {
      inc: subset.filter(x => x.type === 'income') .reduce((a, b) => a + b.amount, 0),
      exp: subset.filter(x => x.type === 'expense').reduce((a, b) => a + b.amount, 0),
    };
  }
  const curM  = now.getMonth(), curY = now.getFullYear();
  const prevM = curM === 0 ? 11 : curM - 1, prevY = curM === 0 ? curY - 1 : curY;
  const cur   = mStats(curM,  curY);
  const prev  = mStats(prevM, prevY);
  const expChange = prev.exp > 0 ? Math.round(((cur.exp - prev.exp) / prev.exp) * 100) : 0;

  // Build 4 insight cards
  const cards = [
    {
      icon: '🏆',
      bg:   isDark() ? '#c8f26422' : '#5a9e0022',
      title: 'Top Spending Category',
      body:  `<b class="insight-highlight">${topCat ? topCat[0] : '—'}</b> is your biggest expense at <b class="insight-highlight">${topCat ? fmt(topCat[1]) : '₹0'}</b>, accounting for ${topCat ? Math.round((topCat[1] / totalExp) * 100) : 0}% of total spend.`,
    },
    {
      icon: '📊',
      bg:   isDark() ? '#4a9eff22' : '#2070d022',
      title: 'Monthly Comparison',
      body:  `This month's expenses are <b class="insight-highlight">${Math.abs(expChange)}% ${expChange > 0 ? 'higher' : 'lower'}</b> than last month. ${expChange <= 0 ? 'Great job keeping costs down!' : 'Consider reviewing variable spending.'}`,
    },
    {
      icon: '💰',
      bg:   isDark() ? '#ffb54722' : '#c0780022',
      title: 'Savings Rate',
      body:  `You are saving <b class="insight-highlight">${savings}%</b> of your total income. ${savings >= 20 ? 'Excellent — above the recommended 20%!' : savings >= 10 ? 'Good, but there\'s room to improve.' : 'Try to build up your savings buffer.'}`,
    },
    {
      icon: '📅',
      bg:   isDark() ? '#a78bfa22' : '#6d4fd422',
      title: 'Transaction Activity',
      body:  `You have <b class="insight-highlight">${transactions.length} transactions</b> on record. Most activity is in <b class="insight-highlight">${topActiveMonth()}</b>.`,
    },
  ];

  document.getElementById('insightCards').innerHTML = cards.map(c => `
    <div class="insight-card">
      <div class="insight-icon" style="background:${c.bg}">${c.icon}</div>
      <div>
        <div class="insight-title">${c.title}</div>
        <div class="insight-body">${c.body}</div>
      </div>
    </div>`).join('');

  buildMonthlyChart();
  buildBreakdown(sorted, totalExp);
}

/** Return the month name with the most transactions */
function topActiveMonth() {
  const mc = {};
  transactions.forEach(t => { const m = t.date.substring(0, 7); mc[m] = (mc[m] || 0) + 1; });
  const top = Object.entries(mc).sort((a, b) => b[1] - a[1])[0];
  if (!top) return '—';
  return new Date(top[0] + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

/** Render the horizontal bar breakdown for each category */
function buildBreakdown(sorted, total) {
  const C    = getColors();
  const cats = Object.keys(CAT_EMOJI);

  document.getElementById('spendingBreakdown').innerHTML = sorted.map(([cat, val]) => {
    const pct = total > 0 ? Math.round((val / total) * 100) : 0;
    const ci  = cats.indexOf(cat) % COLORS_DARK.length;
    const col = C[Math.max(ci, 0)];
    return `
      <div class="mb-4">
        <div class="flex justify-between items-center mb-1.5">
          <span class="text-[13px]">${CAT_EMOJI[cat] || '✦'} ${cat}</span>
          <span class="text-[13px] font-semibold">
            ${fmt(val)} <span class="text-[var(--text3)] font-normal">(${pct}%)</span>
          </span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%;background:${col}"></div>
        </div>
      </div>`;
  }).join('');
}


/* ================================================================
   13. MODAL  (Add / Edit Transaction)
================================================================ */

/**
 * openModal(txn?)
 * Opens the modal pre-filled if editing, blank if adding.
 */
function openModal(txn = null) {
  editingId = txn ? txn.id : null;
  document.getElementById('modalTitle').textContent = txn ? 'Edit Transaction' : 'New Transaction';
  document.getElementById('f-desc')  .value = txn ? txn.desc   : '';
  document.getElementById('f-amount').value = txn ? txn.amount : '';
  document.getElementById('f-type')  .value = txn ? txn.type   : 'expense';
  document.getElementById('f-cat')   .value = txn ? txn.cat    : 'Food & Dining';
  document.getElementById('f-date')  .value = txn ? txn.date   : new Date().toISOString().split('T')[0];
  document.getElementById('txnModal').classList.add('open');

  const modal = document.getElementById('txnModal');
  modal.classList.remove('hidden');
  modal.classList.add('open');
}

function closeModal() {
  const modal = document.getElementById('txnModal');
  modal.classList.remove('open');
  modal.classList.add('hidden');
  editingId = null;
}

/** Close modal when clicking the dark overlay (not the modal itself) */
function closeModalOnBg(e) {
  if (e.target.id === 'txnModal') closeModal();
}

/**
 * saveTransaction()
 * Validates form, then adds or updates the transaction in state.
 */
function saveTransaction() {
  const desc   = document.getElementById('f-desc')  .value.trim();
  const amount = parseFloat(document.getElementById('f-amount').value);
  const type   = document.getElementById('f-type')  .value;
  const cat    = document.getElementById('f-cat')   .value;
  const date   = document.getElementById('f-date')  .value;

  if (!desc || !amount || amount <= 0 || !date) {
    alert('Please fill in all fields with valid values.');
    return;
  }

  if (editingId) {
    // Update existing
    const idx = transactions.findIndex(t => t.id === editingId);
    if (idx >= 0) transactions[idx] = { ...transactions[idx], desc, amount, type, cat, date };
  } else {
    // Add new
    transactions.push({ id: nextId(), desc, amount, type, cat, date });
  }

  persistTransactions();
  closeModal();
  updateStats();
  renderTransactions();
  populateFilters();
  populateOverviewFilters();
}

/** Open modal in edit mode for a specific transaction */
function editTxn(id) {
  const t = transactions.find(x => x.id === id);
  if (t) openModal(t);
}

/** Permanently remove a transaction (with confirm) */
function deleteTxn(id) {
  if (!confirm('Delete this transaction? This cannot be undone.')) return;
  transactions = transactions.filter(t => t.id !== id);
  persistTransactions();
  updateStats();
  renderTransactions();
  populateFilters();
  populateOverviewFilters();
}


/* ================================================================
   14. THEME TOGGLE  (Dark / Light)
================================================================ */

function toggleTheme() {
  const isLight = document.documentElement.classList.toggle('light');
  const sw      = document.getElementById('themeSwitch');
  sw.classList.toggle('on', !isLight);
  localStorage.setItem('finio_theme', isLight ? 'light' : 'dark');

  // Rebuild charts after theme change so colors update
  setTimeout(() => {
    buildTrendChart();
    buildDonutChart();
    if (document.getElementById('page-insights').classList.contains('active')) {
      buildInsights();
    }
  }, 50);
}

/** Restore saved theme on load */
function restoreTheme() {
  const saved = localStorage.getItem('finio_theme');
  const sw    = document.getElementById('themeSwitch');

  if (saved === 'light') {
    document.documentElement.classList.add('light');
    sw.classList.remove('on');
  } else {
    document.documentElement.classList.remove('light');
    sw.classList.add('on');
  }
}


/* ================================================================
   15. EXPORT  (CSV Download)
================================================================ */

function exportData() {
  const filtered = getOverviewFiltered();
  const headers = ['ID', 'Description', 'Amount', 'Type', 'Category', 'Date'];
  const rows    = filtered.map(t => [t.id, t.desc, t.amount, t.type, t.cat, t.date]);
  const csv     = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');

  const a   = document.createElement('a');
  a.href    = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'finio-transactions.csv';
  a.click();
}


/* ================================================================
   16. INITIALISATION
================================================================ */

window.addEventListener('DOMContentLoaded', () => {
  // Set today's date in the header
  document.getElementById('todayDate').textContent = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  // Restore previously saved theme preference
  restoreTheme();

  // Apply initial role (admin by default)
  setRole('admin');

  // Render overview content
  updateStats();

  // Pre-populate filter dropdowns (hidden page, but needed for first visit)
  populateFilters();
  populateOverviewFilters();

  // Close role dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const roleButton = document.getElementById('roleButton');
    const roleDropdown = document.getElementById('roleDropdown');
    if (!roleButton.contains(e.target) && !roleDropdown.contains(e.target)) {
      roleDropdown.classList.add('hidden');
    }
  });
});
