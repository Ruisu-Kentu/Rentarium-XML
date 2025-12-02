// Sample unit data
let units = [
  {
    id: 1,
    unitNumber: "A-101",
    type: "1br",
    tenantName: "John Smith",
    rentAmount: 15000,
    status: "occupied",
    moveInDate: "2024-01-15"
  },
  {
    id: 2,
    unitNumber: "A-102",
    type: "studio",
    tenantName: "Maria Garcia",
    rentAmount: 12000,
    status: "occupied",
    moveInDate: "2024-03-01"
  },
  {
    id: 3,
    unitNumber: "B-201",
    type: "2br",
    tenantName: "",
    rentAmount: 22000,
    status: "available",
    moveInDate: ""
  },
  {
    id: 4,
    unitNumber: "B-202",
    type: "1br",
    tenantName: "James Lee",
    rentAmount: 16500,
    status: "occupied",
    moveInDate: "2024-02-10"
  },
  {
    id: 5,
    unitNumber: "C-301",
    type: "studio",
    tenantName: "",
    rentAmount: 11500,
    status: "maintenance",
    moveInDate: ""
  },
  {
    id: 6,
    unitNumber: "C-302",
    type: "1br",
    tenantName: "",
    rentAmount: 14000,
    status: "available",
    moveInDate: ""
  },
  {
    id: 7,
    unitNumber: "D-401",
    type: "2br",
    tenantName: "Robert Wilson",
    rentAmount: 20000,
    status: "occupied",
    moveInDate: "2023-12-01"
  },
  {
    id: 8,
    unitNumber: "D-402",
    type: "studio",
    tenantName: "",
    rentAmount: 11500,
    status: "reserved",
    moveInDate: ""
  }
];

let currentView = 'table';
let editingId = null;
const sampleData = JSON.parse(JSON.stringify(units));

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderStats();
  renderUnits();
  setupEventListeners();
});

function setupEventListeners() {
  // Modal controls
  document.getElementById('addUnitBtn').addEventListener('click', openAddModal);
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  document.getElementById('unitForm').addEventListener('submit', handleFormSubmit);

  // View toggle
  document.getElementById('tableViewBtn').addEventListener('click', () => switchView('table'));
  document.getElementById('gridViewBtn').addEventListener('click', () => switchView('grid'));

  // Search and filters
  document.getElementById('searchInput').addEventListener('input', filterUnits);
  document.getElementById('statusFilter').addEventListener('change', filterUnits);
  document.getElementById('typeFilter').addEventListener('change', filterUnits);

  // Export functions
  document.getElementById('exportCsvBtn').addEventListener('click', exportToCSV);
  document.getElementById('exportXmlBtn').addEventListener('click', exportToXML);
  document.getElementById('xmlFileInput').addEventListener('change', importFromXML);

  // Reset button
  document.getElementById('resetSampleBtn').addEventListener('click', resetToSample);

  // Close modal on overlay click
  document.getElementById('unitModal').addEventListener('click', (e) => {
    if (e.target.id === 'unitModal') closeModal();
  });
}

function renderStats() {
  const total = units.length;
  const occupied = units.filter(u => u.status === 'occupied').length;
  const available = units.filter(u => u.status === 'available').length;
  const maintenance = units.filter(u => u.status === 'maintenance').length;
  const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

  document.getElementById('statsSummary').innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${total}</div>
      <div class="stat-label">Total Units</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${occupied}</div>
      <div class="stat-label">Occupied Units</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${available}</div>
      <div class="stat-label">Available Units</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${occupancyRate}%</div>
      <div class="stat-label">Occupancy Rate</div>
    </div>
  `;
}

function renderUnits(filteredUnits = units) {
  if (currentView === 'table') {
    renderTableView(filteredUnits);
  } else {
    renderGridView(filteredUnits);
  }
}

function renderTableView(data) {
  const tbody = document.getElementById('unitsTbody');
  
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#94a3b8">No units found</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(unit => `
    <tr>
      <td style="font-weight:600;color:#1e293b">${unit.unitNumber}</td>
      <td>${formatType(unit.type)}</td>
      <td>${unit.tenantName || '-'}</td>
      <td style="font-weight:600">₱${unit.rentAmount.toLocaleString()}</td>
      <td><span class="status-badge ${unit.status}">${capitalize(unit.status)}</span></td>
      <td>${unit.moveInDate ? formatDate(unit.moveInDate) : '-'}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn view" onclick="viewUnit(${unit.id})">View</button>
          <button class="action-btn edit" onclick="editUnit(${unit.id})">Edit</button>
          <button class="action-btn delete" onclick="deleteUnit(${unit.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderGridView(data) {
  const grid = document.getElementById('gridItems');
  
  if (data.length === 0) {
    grid.innerHTML = '<p style="text-align:center;padding:40px;color:#94a3b8;grid-column:1/-1">No units found</p>';
    return;
  }

  grid.innerHTML = data.map(unit => `
    <div class="unit-card">
      <div class="unit-card-header">
        <div>
          <div class="unit-card-number">${unit.unitNumber}</div>
          <div class="unit-card-type">${formatType(unit.type)}</div>
        </div>
        <span class="status-badge ${unit.status}">${capitalize(unit.status)}</span>
      </div>
      <div class="unit-card-details">
        <div class="detail-row">
          <span class="detail-label">Tenant</span>
          <span class="detail-value">${unit.tenantName || 'Vacant'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Monthly Rent</span>
          <span class="detail-value">₱${unit.rentAmount.toLocaleString()}</span>
        </div>
        <div class="detail-row" style="border:none">
          <span class="detail-label">Move-in Date</span>
          <span class="detail-value">${unit.moveInDate ? formatDate(unit.moveInDate) : 'N/A'}</span>
        </div>
      </div>
      <div class="action-btns">
        <button class="action-btn view" onclick="viewUnit(${unit.id})">View</button>
        <button class="action-btn edit" onclick="editUnit(${unit.id})">Edit</button>
        <button class="action-btn delete" onclick="deleteUnit(${unit.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

function switchView(view) {
  currentView = view;
  
  document.getElementById('tableViewBtn').classList.toggle('active', view === 'table');
  document.getElementById('gridViewBtn').classList.toggle('active', view === 'grid');
  
  document.getElementById('tableContainer').style.display = view === 'table' ? 'block' : 'none';
  document.getElementById('gridContainer').style.display = view === 'grid' ? 'block' : 'none';
  
  renderUnits();
}

function openAddModal() {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Add Unit';
  document.getElementById('unitForm').reset();
  document.getElementById('unitId').value = '';
  document.getElementById('unitModal').classList.add('show');
}

function editUnit(id) {
  const unit = units.find(u => u.id === id);
  if (!unit) return;

  editingId = id;
  document.getElementById('modalTitle').textContent = 'Edit Unit';
  document.getElementById('unitId').value = unit.id;
  document.getElementById('unitNumber').value = unit.unitNumber;
  document.getElementById('unitType').value = unit.type;
  document.getElementById('tenantName').value = unit.tenantName || '';
  document.getElementById('rentAmount').value = unit.rentAmount;
  document.getElementById('status').value = unit.status;
  document.getElementById('moveInDate').value = unit.moveInDate || '';
  
  document.getElementById('unitModal').classList.add('show');
}

function viewUnit(id) {
  const unit = units.find(u => u.id === id);
  if (!unit) return;

  const details = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px">
      <div>
        <h4 style="color:#1e293b;margin-bottom:16px;font-size:16px">Unit Information</h4>
        <div class="detail-row">
          <span class="detail-label">Unit Number</span>
          <span class="detail-value">${unit.unitNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Type</span>
          <span class="detail-value">${formatType(unit.type)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Monthly Rent</span>
          <span class="detail-value">₱${unit.rentAmount.toLocaleString()}</span>
        </div>
        <div class="detail-row" style="border:none">
          <span class="detail-label">Status</span>
          <span class="status-badge ${unit.status}">${capitalize(unit.status)}</span>
        </div>
      </div>
      <div>
        <h4 style="color:#1e293b;margin-bottom:16px;font-size:16px">Tenant Information</h4>
        <div class="detail-row">
          <span class="detail-label">Tenant Name</span>
          <span class="detail-value">${unit.tenantName || 'Vacant'}</span>
        </div>
        <div class="detail-row" style="border:none">
          <span class="detail-label">Move-in Date</span>
          <span class="detail-value">${unit.moveInDate ? formatDate(unit.moveInDate) : 'N/A'}</span>
        </div>
      </div>
    </div>
  `;

  // Create a temporary modal for viewing
  const existingDetailsModal = document.getElementById('detailsModal');
  if (existingDetailsModal) {
    existingDetailsModal.remove();
  }

  const detailsModal = document.createElement('div');
  detailsModal.id = 'detailsModal';
  detailsModal.className = 'modal-overlay show';
  detailsModal.innerHTML = `
    <div class="modal modal-large" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3>Unit Details - ${unit.unitNumber}</h3>
        <button class="link" onclick="closeDetailsModal()">Close</button>
      </div>
      <div style="padding:20px">${details}</div>
    </div>
  `;
  document.body.appendChild(detailsModal);

  detailsModal.addEventListener('click', (e) => {
    if (e.target.id === 'detailsModal') closeDetailsModal();
  });
}

function closeDetailsModal() {
  const modal = document.getElementById('detailsModal');
  if (modal) modal.remove();
}

function deleteUnit(id) {
  if (!confirm('Are you sure you want to delete this unit?')) return;
  
  units = units.filter(u => u.id !== id);
  renderStats();
  renderUnits();
  filterUnits();
}

function handleFormSubmit(e) {
  e.preventDefault();
  
  const formData = {
    unitNumber: document.getElementById('unitNumber').value,
    type: document.getElementById('unitType').value,
    tenantName: document.getElementById('tenantName').value,
    rentAmount: parseInt(document.getElementById('rentAmount').value),
    status: document.getElementById('status').value,
    moveInDate: document.getElementById('moveInDate').value
  };

  if (editingId) {
    const index = units.findIndex(u => u.id === editingId);
    units[index] = { ...units[index], ...formData };
  } else {
    const newId = Math.max(...units.map(u => u.id), 0) + 1;
    units.push({ id: newId, ...formData });
  }

  closeModal();
  renderStats();
  renderUnits();
  filterUnits();
}

function closeModal() {
  document.getElementById('unitModal').classList.remove('show');
}

function filterUnits() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const statusFilter = document.getElementById('statusFilter').value;
  const typeFilter = document.getElementById('typeFilter').value;

  let filtered = units.filter(unit => {
    const matchesSearch = 
      unit.unitNumber.toLowerCase().includes(search) ||
      (unit.tenantName && unit.tenantName.toLowerCase().includes(search)) ||
      formatType(unit.type).toLowerCase().includes(search);
    
    const matchesStatus = statusFilter === 'all' || unit.status === statusFilter;
    const matchesType = typeFilter === 'all' || unit.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  renderUnits(filtered);
  
  const statusText = statusFilter === 'all' ? 'All' : capitalize(statusFilter);
  document.getElementById('listTitle').textContent = 
    `${statusText} Units (${filtered.length})`;
}

function exportToCSV() {
  const headers = ['ID', 'Unit Number', 'Type', 'Tenant Name', 'Rent', 'Status', 'Move-in Date'];
  const rows = units.map(u => [
    u.id,
    u.unitNumber,
    formatType(u.type),
    u.tenantName || '',
    u.rentAmount,
    u.status,
    u.moveInDate || ''
  ]);

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  downloadFile(csv, 'units.csv', 'text/csv');
}

function exportToXML() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<units>\n';
  
  units.forEach(unit => {
    xml += '  <unit>\n';
    xml += `    <id>${unit.id}</id>\n`;
    xml += `    <unitNumber>${escapeXml(unit.unitNumber)}</unitNumber>\n`;
    xml += `    <type>${unit.type}</type>\n`;
    xml += `    <tenantName>${escapeXml(unit.tenantName || '')}</tenantName>\n`;
    xml += `    <rentAmount>${unit.rentAmount}</rentAmount>\n`;
    xml += `    <status>${unit.status}</status>\n`;
    xml += `    <moveInDate>${unit.moveInDate || ''}</moveInDate>\n`;
    xml += '  </unit>\n';
  });
  
  xml += '</units>';
  downloadFile(xml, 'units.xml', 'text/xml');
}

function importFromXML(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(event.target.result, 'text/xml');
      const unitNodes = xmlDoc.getElementsByTagName('unit');
      
      const imported = [];
      for (let node of unitNodes) {
        imported.push({
          id: parseInt(node.querySelector('id')?.textContent) || Date.now(),
          unitNumber: node.querySelector('unitNumber')?.textContent || '',
          type: node.querySelector('type')?.textContent || 'studio',
          tenantName: node.querySelector('tenantName')?.textContent || '',
          rentAmount: parseInt(node.querySelector('rentAmount')?.textContent) || 0,
          status: node.querySelector('status')?.textContent || 'available',
          moveInDate: node.querySelector('moveInDate')?.textContent || ''
        });
      }

      if (imported.length > 0) {
        units = imported;
        renderStats();
        renderUnits();
        filterUnits();
        alert(`Successfully imported ${imported.length} units!`);
      }
    } catch (err) {
      alert('Error importing XML: ' + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function resetToSample() {
  if (!confirm('Reset to sample data? This will discard all changes.')) return;
  units = JSON.parse(JSON.stringify(sampleData));
  renderStats();
  renderUnits();
  filterUnits();
}

// Helper functions
function formatType(type) {
  const types = {
    'studio': 'Studio',
    '1br': '1 Bedroom',
    '2br': '2 Bedroom',
    '3br': '3 Bedroom'
  };
  return types[type] || type;
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeXml(str) {
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}