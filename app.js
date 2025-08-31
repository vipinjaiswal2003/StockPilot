// Inventory Dashboard UI (Mock) — BillSwift
(function() {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const state = {
    items: [],
    sortKey: 'name',
    sortDir: 'asc',
    filters: { q: '', supplier: '', stock: '' },
    lowStockThreshold: 10
  };

  function fmtCurrency(n) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);
  }

  function loadItems() {
    try {
      const raw = localStorage.getItem('inv_items');
      state.items = raw ? JSON.parse(raw) : seedData();
    } catch {
      state.items = seedData();
    }
  }

  function saveItems() {
    localStorage.setItem('inv_items', JSON.stringify(state.items));
  }

  function seedData() {
    const demo = [
      { id: uid(), name: 'A4 Paper Ream (500 sheets)', supplier: 'Acme Traders', stock: 25, value: 230 },
      { id: uid(), name: 'Blue Ball Pens (Box of 50)', supplier: 'WriteWell Supplies', stock: 8, value: 175 },
      { id: uid(), name: 'Stapler No. 10', supplier: 'OfficeMart', stock: 0, value: 120 },
      { id: uid(), name: 'Notebook (200 pages)', supplier: 'WriteWell Supplies', stock: 42, value: 85 },
      { id: uid(), name: 'Whiteboard Marker (Pack of 10)', supplier: 'OfficeMart', stock: 12, value: 260 },
    ];
    localStorage.setItem('inv_items', JSON.stringify(demo));
    return demo;
  }

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

  function applyFilters(list) {
    const q = state.filters.q.trim().toLowerCase();
    const supplier = state.filters.supplier;
    const stock = state.filters.stock;

    return list.filter(it => {
      const matchesQ = !q || it.name.toLowerCase().includes(q) || it.supplier.toLowerCase().includes(q);
      const matchesSupplier = !supplier || it.supplier === supplier;
      let matchesStock = true;
      if (stock === 'low') matchesStock = it.stock > 0 && it.stock < state.lowStockThreshold;
      if (stock === 'out') matchesStock = it.stock === 0;
      return matchesQ && matchesSupplier && matchesStock;
    });
  }

  function sortList(list) {
    const { sortKey, sortDir } = state;
    return list.slice().sort((a,b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === 'stock' || sortKey === 'value') {
        va = Number(va) || 0; vb = Number(vb) || 0;
      } else {
        va = (va || '').toString().toLowerCase();
        vb = (vb || '').toString().toLowerCase();
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  function render() {
    const tbody = $('#tableBody');
    tbody.innerHTML = '';

    const filtered = applyFilters(state.items);
    const sorted = sortList(filtered);

    sorted.forEach(it => {
      const tr = document.createElement('tr');
      if (it.stock === 0) tr.classList.add('out-stock');
      else if (it.stock < state.lowStockThreshold) tr.classList.add('low-stock');

      tr.innerHTML = `
        <td>${escapeHtml(it.name)}</td>
        <td>${escapeHtml(it.supplier)}</td>
        <td class="text-end">${it.stock}</td>
        <td class="text-end">${fmtCurrency(it.value)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary me-1 btn-edit" data-id="${it.id}"><i class="bi bi-pencil-square"></i></button>
          <button class="btn btn-sm btn-outline-danger btn-del" data-id="${it.id}"><i class="bi bi-trash"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Bind row actions
    tbody.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', () => openEdit(btn.getAttribute('data-id'))));
    tbody.querySelectorAll('.btn-del').forEach(btn => btn.addEventListener('click', () => removeItem(btn.getAttribute('data-id'))));

    // Stats & filters
    updateStats();
    populateSupplierFilter();
    updateTableCompact();
  }

  function updateStats() {
    const totalSkus = state.items.length;
    const totalUnits = state.items.reduce((s, it) => s + (Number(it.stock) || 0), 0);
    const worth = state.items.reduce((s, it) => s + (Number(it.stock) || 0) * (Number(it.value) || 0), 0);
    $('#statSkus').textContent = totalSkus;
    $('#statUnits').textContent = totalUnits;
    $('#statWorth').textContent = fmtCurrency(worth);
  }

  function populateSupplierFilter() {
    const sel = $('#supplierFilter');
    const current = sel.value;
    const suppliers = Array.from(new Set(state.items.map(it => it.supplier))).sort((a,b)=>a.localeCompare(b));
    sel.innerHTML = '<option value="">All Suppliers</option>' + suppliers.map(s => `<option value="${escapeHtmlAttr(s)}">${escapeHtml(s)}</option>`).join('');
    sel.value = current; // preserve selection if possible
  }

  function openAdd() {
    $('#itemModalTitle').textContent = 'Add Item';
    $('#itemId').value = '';
    $('#itemName').value = '';
    $('#itemSupplier').value = '';
    $('#itemStock').value = 0;
    $('#itemValue').value = 0;
    const modal = bootstrap.Modal.getOrCreateInstance('#itemModal');
    modal.show();
  }

  function openEdit(id) {
    const it = state.items.find(x => x.id === id);
    if (!it) return;
    $('#itemModalTitle').textContent = 'Edit Item';
    $('#itemId').value = it.id;
    $('#itemName').value = it.name;
    $('#itemSupplier').value = it.supplier;
    $('#itemStock').value = it.stock;
    $('#itemValue').value = it.value;
    const modal = bootstrap.Modal.getOrCreateInstance('#itemModal');
    modal.show();
  }

  function upsertFromForm(e) {
    e.preventDefault();
    const id = $('#itemId').value || uid();
    const name = $('#itemName').value.trim();
    const supplier = $('#itemSupplier').value.trim();
    const stock = Math.max(0, Math.floor(Number($('#itemStock').value || 0)));
    const value = Math.max(0, Number($('#itemValue').value || 0));

    if (!name || !supplier) {
      alert('Please enter both Item Name and Supplier.');
      return;
    }

    const existingIdx = state.items.findIndex(x => x.id === id);
    const obj = { id, name, supplier, stock, value };
    if (existingIdx >= 0) state.items[existingIdx] = obj;
    else state.items.push(obj);

    saveItems();
    bootstrap.Modal.getInstance('#itemModal')?.hide();
    render();
  }

  function removeItem(id) {
    const it = state.items.find(x => x.id === id);
    if (!it) return;
    if (!confirm(`Delete "\${it.name}"?`)) return;
    state.items = state.items.filter(x => x.id !== id);
    saveItems();
    render();
  }

  function handleSort(e) {
    const th = e.currentTarget.closest('th');
    const key = th?.dataset.key;
    if (!key) return;
    if (state.sortKey === key) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
    else { state.sortKey = key; state.sortDir = 'asc'; }
    render();
  }

  function updateTableCompact() {
    const table = $('#inventoryTable');
    if ($('#compactToggle').checked) table.classList.add('compact');
    else table.classList.remove('compact');
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(state.items, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'inventory.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data)) throw new Error('Invalid JSON: expected an array.');
        state.items = data.map(x => ({
          id: x.id || uid(),
          name: String(x.name || ''),
          supplier: String(x.supplier || ''),
          stock: Math.max(0, Math.floor(Number(x.stock || 0))),
          value: Math.max(0, Number(x.value || 0))
        }));
        saveItems();
        render();
        alert('Inventory imported successfully!');
      } catch (err) {
        alert('Failed to import: ' + err.message);
      } finally {
        $('#fileInput').value = '';
      }
    };
    reader.readAsText(file);
  }

  function escapeHtml(str='') {
    return str.replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[m]));
  }
  function escapeHtmlAttr(str='') {
    return escapeHtml(str).replace(/"/g, '&quot;');
  }

  // Event bindings
  $('#searchInput').addEventListener('input', (e) => { state.filters.q = e.target.value; render(); });
  $('#supplierFilter').addEventListener('change', (e) => { state.filters.supplier = e.target.value; render(); });
  $('#stockFilter').addEventListener('change', (e) => { state.filters.stock = e.target.value; render(); });
  $('#compactToggle').addEventListener('change', updateTableCompact);

  $$('.sortable').forEach(th => th.addEventListener('click', handleSort));

  $('#itemForm').addEventListener('submit', upsertFromForm);
  document.querySelector('[data-bs-target="#itemModal"]').addEventListener('click', openAdd);

  $('#btnExport').addEventListener('click', exportJSON);
  $('#btnImport').addEventListener('click', () => $('#fileInput').click());
  $('#fileInput').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) importJSON(file);
  });

  // Init
  loadItems();
  render();
})();