
    /**********************
     * Data & Persistence *
     **********************/
    const STORAGE_KEY = 'rentarium_units_v1';

// Sample data (used on first load or reset)
const SAMPLE_UNITS = [{
        id: uid(),
        unit: 'A-101',
        building: 'A',
        floor: '1',
        type: '1br',
        tenant: 'John Smith',
        rent: 15000,
        status: 'occupied',
        moveIn: '2024-01-15'
    },
    {
        id: uid(),
        unit: 'A-102',
        building: 'A',
        floor: '1',
        type: 'studio',
        tenant: 'Maria Garcia',
        rent: 12000,
        status: 'occupied',
        moveIn: '2024-03-01'
    },
    {
        id: uid(),
        unit: 'B-201',
        building: 'B',
        floor: '2',
        type: '2br',
        tenant: '',
        rent: 22000,
        status: 'available',
        moveIn: ''
    },
    {
        id: uid(),
        unit: 'B-202',
        building: 'B',
        floor: '2',
        type: '1br',
        tenant: 'James Lee',
        rent: 16500,
        status: 'occupied',
        moveIn: '2024-02-10'
    },
    {
        id: uid(),
        unit: 'C-301',
        building: 'C',
        floor: '3',
        type: 'studio',
        tenant: '',
        rent: 11500,
        status: 'maintenance',
        moveIn: ''
    },
    {
        id: uid(),
        unit: 'C-302',
        building: 'C',
        floor: '3',
        type: '2br',
        tenant: 'Sarah Kim',
        rent: 20000,
        status: 'occupied',
        moveIn: '2024-04-05'
    },
    {
        id: uid(),
        unit: 'D-401',
        building: 'D',
        floor: '4',
        type: '3br',
        tenant: 'Robert Brown',
        rent: 28000,
        status: 'occupied',
        moveIn: '2024-01-20'
    },
    {
        id: uid(),
        unit: 'D-402',
        building: 'D',
        floor: '4',
        type: 'studio',
        tenant: '',
        rent: 12500,
        status: 'reserved',
        moveIn: ''
    }
];

// In-memory store
let units = loadFromStorage() || SAMPLE_UNITS.slice();
let filteredUnits = [...units];

/**********************
 * Helpers
 **********************/
function uid() {
    return 'u_' + Math.random().toString(36).slice(2, 9);
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(units));
}

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.error('load error', e);
        return null;
    }
}

function formatDateForDisplay(d) {
    if (!d) return '-';
    // returns formatted like "Jan 15, 2024"
    try {
        const dt = new Date(d);
        if (isNaN(dt)) return d;
        return dt.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });
    } catch (e) {
        return d
    }
}

/**********************
 * DOM refs
 **********************/
const unitsTbody = document.getElementById('unitsTbody');
const statsSummary = document.getElementById('statsSummary');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const typeFilter = document.getElementById('typeFilter');
const addUnitBtn = document.getElementById('addUnitBtn');
const unitModal = document.getElementById('unitModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const unitForm = document.getElementById('unitForm');
const unitIdInp = document.getElementById('unitId');
const unitNumberInp = document.getElementById('unitNumber');
const unitTypeInp = document.getElementById('unitType');
const tenantNameInp = document.getElementById('tenantName');
const rentAmountInp = document.getElementById('rentAmount');
const statusInp = document.getElementById('status');
const moveInDateInp = document.getElementById('moveInDate');
const cancelBtn = document.getElementById('cancelBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const exportXmlBtn = document.getElementById('exportXmlBtn');
const xmlFileInput = document.getElementById('xmlFileInput');
const resetSampleBtn = document.getElementById('resetSampleBtn');

const tableViewBtn = document.getElementById('tableViewBtn');
const gridViewBtn = document.getElementById('gridViewBtn');
const tableContainer = document.getElementById('tableContainer');
const gridContainer = document.getElementById('gridContainer');
const gridItems = document.getElementById('gridItems');
const listTitle = document.getElementById('listTitle');

/**********************
 * Rendering
 **********************/
function render() {
    applyFilters();
    renderTable();
    renderGrid();
    renderStats();
    updateTitle();
    saveToStorage();
}

function updateTitle() {
    listTitle.textContent = `All Units (${filteredUnits.length})`;
}

function applyFilters() {
    const q = searchInput.value.trim().toLowerCase();
    const status = statusFilter.value;
    const type = typeFilter.value;
    filteredUnits = units.filter(u => {
        if (status !== 'all' && u.status !== status) return false;
        if (type !== 'all' && u.type !== type) return false;
        if (!q) return true;
        // search unit number, tenant, type, building
        const hay = `${u.unit} ${u.tenant} ${u.type} ${u.building}`.toLowerCase();
        return hay.includes(q);
    });
}

function renderTable() {
    unitsTbody.innerHTML = '';
    if (filteredUnits.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="7" class="small muted" style="padding:18px">No units found.</td>`;
        unitsTbody.appendChild(tr);
        return;
    }
    filteredUnits.forEach(u => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
        <td>
          <div class="unit-info">
            <div class="unit-icon">${shortIcon(u.unit)}</div>
            <div class="unit-details">
              <h4 style="margin:0">${escapeHtml(u.unit)}</h4>
              <p class="small muted" style="margin:4px 0 0">Building ${escapeHtml(u.building)}, Floor ${escapeHtml(u.floor)}</p>
            </div>
          </div>
        </td>
        <td>${typeLabel(u.type)}</td>
        <td>
          <div class="tenant-info">
            <div class="tenant-avatar">${avatarInitials(u.tenant)}</div>
            <div>${u.tenant ? escapeHtml(u.tenant) : '-'}</div>
          </div>
        </td>
        <td><span class="rent-amount">₱${numberWithCommas(u.rent)}</span></td>
        <td><span class="status-badge ${u.status}">${capitalize(u.status)}</span></td>
        <td>${u.moveIn ? formatDateForDisplay(u.moveIn) : '-'}</td>
        <td>
          <div class="action-buttons">
            <button class="icon-btn view" title="View Details" onclick="viewUnit('${u.id}')">👁</button>
            <button class="icon-btn edit" title="Edit Unit" onclick="openEditUnitModal('${u.id}')">✏️</button>
            <button class="icon-btn delete" title="Remove Unit" onclick="confirmDelete('${u.id}')">🗑️</button>
          </div>
        </td>
      `;
        unitsTbody.appendChild(tr);
    });
}

function renderGrid() {
    gridItems.innerHTML = '';
    filteredUnits.forEach(u => {
        const card = document.createElement('div');
        card.style.background = '#fff';
        card.style.padding = '12px';
        card.style.borderRadius = '8px';
        card.style.boxShadow = '0 1px 6px rgba(2,6,23,0.06)';
        card.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:56px;height:56px;border-radius:8px;background:#eef2ff;display:flex;align-items:center;justify-content:center;font-weight:700">${shortIcon(u.unit)}</div>
          <div style="flex:1">
            <div style="font-weight:700">${escapeHtml(u.unit)}</div>
            <div class="small muted">Building ${escapeHtml(u.building)}, Floor ${escapeHtml(u.floor)}</div>
          </div>
        </div>
        <div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center">
          <div class="small muted">${typeLabel(u.type)}</div>
          <div class="small"><strong>₱${numberWithCommas(u.rent)}</strong></div>
        </div>
        <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center">
          <div><span class="status-badge ${u.status}">${capitalize(u.status)}</span></div>
          <div>
            <button class="icon-btn" onclick="openEditUnitModal('${u.id}')">✏️</button>
            <button class="icon-btn" onclick="confirmDelete('${u.id}')">🗑️</button>
          </div>
        </div>
      `;
        gridItems.appendChild(card);
    });
}

function renderStats() {
    const total = units.length;
    const counts = units.reduce((acc, u) => {
        acc[u.status] = (acc[u.status] || 0) + 1;
        return acc;
    }, {});
    const occupied = counts.occupied || 0;
    const available = counts.available || 0;
    const maintenance = counts.maintenance || 0;

    statsSummary.innerHTML = `
      <div class="stat-box">
        <div class="stat-label">Total Units</div>
        <div class="stat-value">${total}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Occupied Units</div>
        <div class="stat-value">${occupied}</div>
        <div class="stat-percentage">${total?((occupied/total)*100).toFixed(1)+'% occupancy':'-'}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Available Units</div>
        <div class="stat-value">${available}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Under Maintenance Units</div>
        <div class="stat-value">${maintenance}</div>
      </div>
    `;
}

/**********************
 * Utilities
 **********************/
function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    } [c]));
}

function numberWithCommas(x) {
    if (x == null || x == undefined || x === '') return '-';
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function capitalize(s) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1)
}

function shortIcon(unit) {
    return (unit || '--').split('-').pop().slice(0, 3).toUpperCase();
}

function avatarInitials(name) {
    if (!name) return '--';
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] || '').toUpperCase() + (parts[1] ? parts[1][0].toUpperCase() : '');
}

function typeLabel(t) {
    if (t === 'studio') return 'Studio';
    if (t === '1br') return '1 Bedroom';
    if (t === '2br') return '2 Bedroom';
    if (t === '3br') return '3 Bedroom';
    return t;
}

/**********************
 * CRUD actions
 **********************/
addUnitBtn.addEventListener('click', () => openAddUnitModal());
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();
});
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

unitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = unitIdInp.value;
    const payload = {
        id: id || uid(),
        unit: unitNumberInp.value.trim(),
        building: inferBuilding(unitNumberInp.value.trim()),
        floor: inferFloor(unitNumberInp.value.trim()),
        type: unitTypeInp.value,
        tenant: tenantNameInp.value.trim(),
        rent: Number(rentAmountInp.value) || 0,
        status: statusInp.value,
        moveIn: moveInDateInp.value || ''
    };

    if (!payload.unit) {
        alert('Unit number is required');
        return;
    }

    if (id) {
        // update
        const idx = units.findIndex(x => x.id === id);
        if (idx >= 0) {
            units[idx] = payload;
        }
    } else {
        // insert at start
        units.unshift(payload);
    }
    render();
    closeModal();
});

function openAddUnitModal() {
    unitForm.reset();
    unitIdInp.value = '';
    document.getElementById('modalTitle').textContent = 'Add Unit';
    statusInp.value = 'available';
    openModal();
}

function openEditUnitModal(id) {
    const u = units.find(x => x.id === id);
    if (!u) {
        alert('Unit not found');
        return;
    }
    unitIdInp.value = u.id;
    unitNumberInp.value = u.unit || '';
    unitTypeInp.value = u.type || 'studio';
    tenantNameInp.value = u.tenant || '';
    rentAmountInp.value = u.rent || '';
    statusInp.value = u.status || 'available';
    moveInDateInp.value = u.moveIn || '';
    document.getElementById('modalTitle').textContent = 'Edit Unit';
    openModal();
}

function openModal() {
    unitModal.style.display = 'flex';
    unitNumberInp.focus();
}

function closeModal() {
    unitModal.style.display = 'none';
}

function confirmDelete(id) {
    if (!confirm('Delete this unit? This action cannot be undone.')) return;
    units = units.filter(u => u.id !== id);
    render();
}

function viewUnit(id) {
    const u = units.find(x => x.id === id);
    if (!u) return alert('Not found');
    // small quick view
    alert(`${u.unit}\n${typeLabel(u.type)}\nTenant: ${u.tenant || '-'}\nRent: ₱${numberWithCommas(u.rent)}\nStatus: ${capitalize(u.status)}\nMove-in: ${u.moveIn || '-'}`);
}

function inferBuilding(unitNumber) {
    if (!unitNumber) return '';
    const parts = unitNumber.split('-');
    return parts[0] ? parts[0].replace(/\D/g, '') ? parts[0].slice(0, 1) : parts[0].slice(0, 1) : '';
}

function inferFloor(unitNumber) {
    if (!unitNumber) return '';
    const parts = unitNumber.split('-');
    if (parts[1]) return parts[1][0] || '';
    return '';
}

/**********************
 * Search & Filters handlers
 **********************/
[searchInput, statusFilter, typeFilter].forEach(el => {
    el.addEventListener('input', debounce(() => {
        render();
    }, 180));
    el.addEventListener('change', () => {
        render();
    });
});

function debounce(fn, ms = 200) {
    let t;
    return (...a) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...a), ms);
    };
}

/**********************
 * Export CSV
 **********************/
exportCsvBtn.addEventListener('click', () => {
    const csv = toCSV(units);
    downloadFile(csv, 'units_export.csv', 'text/csv');
});

function toCSV(records) {
    const header = ['unit', 'building', 'floor', 'type', 'tenant', 'rent', 'status', 'moveIn'];
    const rows = records.map(r => header.map(h => `"${String(r[h] ?? '').replace(/"/g,'""')}"`).join(','));
    return header.join(',') + '\n' + rows.join('\n');
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], {
        type
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

/**********************
 * XML import/export
 **********************/
exportXmlBtn.addEventListener('click', () => {
    const xml = toXML(units);
    downloadFile(xml, 'units_export.xml', 'application/xml');
});

xmlFileInput.addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const parsed = parseUnitsFromXML(reader.result);
            if (parsed && parsed.length) {
                // Merge: add new ones; optionally you can overwrite. For now, append with new IDs.
                parsed.forEach(u => {
                    u.id = uid();
                    units.unshift(u);
                });
                render();
                alert('Imported ' + parsed.length + ' units from XML.');
            } else {
                alert('No units found in XML.');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to parse XML: ' + err.message);
        }
    };
    reader.readAsText(f);
    // clear input so same file can be re-selected later
    xmlFileInput.value = '';
});

function toXML(records) {
    const docParts = ['<?xml version="1.0" encoding="UTF-8"?>', '<units>'];
    records.forEach(r => {
        docParts.push(`<unit>`);
        docParts.push(`<unitNumber>${escapeXml(r.unit)}</unitNumber>`);
        docParts.push(`<building>${escapeXml(r.building)}</building>`);
        docParts.push(`<floor>${escapeXml(r.floor)}</floor>`);
        docParts.push(`<type>${escapeXml(r.type)}</type>`);
        docParts.push(`<tenant>${escapeXml(r.tenant)}</tenant>`);
        docParts.push(`<rent>${escapeXml(String(r.rent))}</rent>`);
        docParts.push(`<status>${escapeXml(r.status)}</status>`);
        docParts.push(`<moveIn>${escapeXml(r.moveIn || '')}</moveIn>`);
        docParts.push(`</unit>`);
    });
    docParts.push('</units>');
    return docParts.join('\n');
}

function escapeXml(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function parseUnitsFromXML(xmlStr) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlStr, 'application/xml');
    const err = doc.querySelector('parsererror');
    if (err) throw new Error(err.textContent || 'Invalid XML');
    const unitNodes = Array.from(doc.querySelectorAll('unit'));
    return unitNodes.map(n => {
        return {
            unit: (n.querySelector('unitNumber')?.textContent || '').trim(),
            building: (n.querySelector('building')?.textContent || '').trim(),
            floor: (n.querySelector('floor')?.textContent || '').trim(),
            type: (n.querySelector('type')?.textContent || '').trim() || 'studio',
            tenant: (n.querySelector('tenant')?.textContent || '').trim(),
            rent: Number(n.querySelector('rent')?.textContent || 0) || 0,
            status: (n.querySelector('status')?.textContent || 'available').trim(),
            moveIn: (n.querySelector('moveIn')?.textContent || '').trim()
        };
    });
}

/**********************
 * Reset / Sample
 **********************/
resetSampleBtn.addEventListener('click', () => {
    if (!confirm('Reset to sample data? This will overwrite your saved units.')) return;
    units = SAMPLE_UNITS.slice();
    saveToStorage();
    render();
});

/**********************
 * Misc helpers used in HTML event handlers
 **********************/
function confirmDelete(id) {
    if (window.confirm('Delete this unit?')) {
        units = units.filter(u => u.id !== id);
        render();
    }
}
window.confirmDelete = confirmDelete;
window.openEditUnitModal = openEditUnitModal;
window.viewUnit = viewUnit;

/**********************
 * Initialization
 **********************/
// Grid / Table view toggle
tableViewBtn.addEventListener('click', () => {
    tableViewBtn.classList.add('active');
    gridViewBtn.classList.remove('active');
    tableContainer.style.display = '';
    gridContainer.style.display = 'none';
});
gridViewBtn.addEventListener('click', () => {
    gridViewBtn.classList.add('active');
    tableViewBtn.classList.remove('active');
    tableContainer.style.display = 'none';
    gridContainer.style.display = '';
});

// initial render
render();

/**********************
 * End of script
 **********************/
 