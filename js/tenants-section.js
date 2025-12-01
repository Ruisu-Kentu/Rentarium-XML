// Sample tenant data
let tenants = [
  {
    id: 1,
    fullName: "John Smith",
    email: "john.smith@email.com",
    phone: "+63 912 345 6789",
    emergencyContact: "+63 912 345 6790",
    unitNumber: "A-101",
    rentAmount: 15000,
    leaseStart: "2024-01-15",
    leaseEnd: "2025-01-14",
    status: "active",
    deposit: 30000,
    notes: "Good tenant, pays on time"
  },
  {
    id: 2,
    fullName: "Maria Garcia",
    email: "maria.garcia@email.com",
    phone: "+63 923 456 7890",
    emergencyContact: "+63 923 456 7891",
    unitNumber: "A-102",
    rentAmount: 12000,
    leaseStart: "2024-03-01",
    leaseEnd: "2025-02-28",
    status: "active",
    deposit: 24000,
    notes: ""
  },
  {
    id: 3,
    fullName: "James Lee",
    email: "james.lee@email.com",
    phone: "+63 934 567 8901",
    emergencyContact: "+63 934 567 8902",
    unitNumber: "B-202",
    rentAmount: 16500,
    leaseStart: "2024-02-10",
    leaseEnd: "2025-02-09",
    status: "active",
    deposit: 33000,
    notes: ""
  },
  {
    id: 4,
    fullName: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+63 945 678 9012",
    emergencyContact: "+63 945 678 9013",
    unitNumber: "B-201",
    rentAmount: 22000,
    leaseStart: "2025-01-15",
    leaseEnd: "2026-01-14",
    status: "pending",
    deposit: 44000,
    notes: "New tenant, move-in pending"
  },
  {
    id: 5,
    fullName: "Michael Chen",
    email: "m.chen@email.com",
    phone: "+63 956 789 0123",
    emergencyContact: "+63 956 789 0124",
    unitNumber: "D-402",
    rentAmount: 11500,
    leaseStart: "2023-06-01",
    leaseEnd: "2024-05-31",
    status: "expired",
    deposit: 23000,
    notes: "Lease expired, awaiting renewal decision"
  }
];

let currentView = 'table';
let editingId = null;
const sampleData = JSON.parse(JSON.stringify(tenants));

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderStats();
  renderTenants();
  populateUnitFilter();
  populateUnitDropdown();
  setupEventListeners();
});

function setupEventListeners() {
  // Modal controls
  document.getElementById('addTenantBtn').addEventListener('click', openAddModal);
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  document.getElementById('closeDetailsBtn').addEventListener('click', closeDetailsModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  document.getElementById('tenantForm').addEventListener('submit', handleFormSubmit);

  // View toggle
  document.getElementById('tableViewBtn').addEventListener('click', () => switchView('table'));
  document.getElementById('gridViewBtn').addEventListener('click', () => switchView('grid'));

  // Search and filters
  document.getElementById('searchInput').addEventListener('input', filterTenants);
  document.getElementById('statusFilter').addEventListener('change', filterTenants);
  document.getElementById('unitFilter').addEventListener('change', filterTenants);

  // Export functions
  document.getElementById('exportCsvBtn').addEventListener('click', exportToCSV);
  document.getElementById('exportXmlBtn').addEventListener('click', exportToXML);
  document.getElementById('xmlFileInput').addEventListener('change', importFromXML);

  // Reset button
  document.getElementById('resetSampleBtn').addEventListener('click', resetToSample);

  // Close modal on overlay click
  document.getElementById('tenantModal').addEventListener('click', (e) => {
    if (e.target.id === 'tenantModal') closeModal();
  });
  document.getElementById('detailsModal').addEventListener('click', (e) => {
    if (e.target.id === 'detailsModal') closeDetailsModal();
  });
}

function renderStats() {
  const active = tenants.filter(t => t.status === 'active').length;
  const pending = tenants.filter(t => t.status === 'pending').length;
  const expired = tenants.filter(t => t.status === 'expired').length;
  const totalRevenue = tenants
    .filter(t => t.status === 'active')
    .reduce((sum, t) => sum + t.rentAmount, 0);

  document.getElementById('statsSummary').innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${tenants.length}</div>
      <div class="stat-label">Total Tenants</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${active}</div>
      <div class="stat-label">Active Tenants</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${pending}</div>
      <div class="stat-label">Pending</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">₱${totalRevenue.toLocaleString()}</div>
      <div class="stat-label">Monthly Revenue</div>
    </div>
  `;
}

function renderTenants(filteredTenants = tenants) {
  if (currentView === 'table') {
    renderTableView(filteredTenants);
  } else {
    renderGridView(filteredTenants);
  }
}

function renderTableView(data) {
  const tbody = document.getElementById('tenantsTbody');
  
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:#94a3b8">No tenants found</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(tenant => `
    <tr>
      <td>
        <div class="tenant-info">
          <div class="tenant-avatar">${getInitials(tenant.fullName)}</div>
          <div class="tenant-details">
            <h4>${tenant.fullName}</h4>
            <p>${tenant.email}</p>
          </div>
        </div>
      </td>
      <td>${tenant.phone}</td>
      <td>${tenant.unitNumber}</td>
      <td>₱${tenant.rentAmount.toLocaleString()}</td>
      <td>${formatDate(tenant.leaseStart)}</td>
      <td>${formatDate(tenant.leaseEnd)}</td>
      <td><span class="status-badge ${tenant.status}">${capitalize(tenant.status)}</span></td>
      <td>
        <div class="action-btns">
          <button class="action-btn view" onclick="viewTenant(${tenant.id})">View</button>
          <button class="action-btn edit" onclick="editTenant(${tenant.id})">Edit</button>
          <button class="action-btn delete" onclick="deleteTenant(${tenant.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderGridView(data) {
  const grid = document.getElementById('gridItems');
  
  if (data.length === 0) {
    grid.innerHTML = '<p style="text-align:center;padding:40px;color:#94a3b8;grid-column:1/-1">No tenants found</p>';
    return;
  }

  grid.innerHTML = data.map(tenant => `
    <div class="tenant-card">
      <div class="tenant-card-header">
        <div class="tenant-card-avatar">${getInitials(tenant.fullName)}</div>
        <div class="tenant-card-info">
          <h4>${tenant.fullName}</h4>
          <p>${tenant.unitNumber}</p>
        </div>
      </div>
      <div class="tenant-card-details">
        <div class="detail-row">
          <span class="detail-label">Email</span>
          <span class="detail-value">${tenant.email}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Phone</span>
          <span class="detail-value">${tenant.phone}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Rent</span>
          <span class="detail-value">₱${tenant.rentAmount.toLocaleString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Lease End</span>
          <span class="detail-value">${formatDate(tenant.leaseEnd)}</span>
        </div>
        <div class="detail-row" style="border:none">
          <span class="detail-label">Status</span>
          <span class="status-badge ${tenant.status}">${capitalize(tenant.status)}</span>
        </div>
      </div>
      <div class="action-btns">
        <button class="action-btn view" onclick="viewTenant(${tenant.id})">View</button>
        <button class="action-btn edit" onclick="editTenant(${tenant.id})">Edit</button>
        <button class="action-btn delete" onclick="deleteTenant(${tenant.id})">Delete</button>
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
  
  renderTenants();
}

function openAddModal() {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Add Tenant';
  document.getElementById('tenantForm').reset();
  document.getElementById('tenantId').value = '';
  document.getElementById('tenantModal').classList.add('show');
}

function editTenant(id) {
  const tenant = tenants.find(t => t.id === id);
  if (!tenant) return;

  editingId = id;
  document.getElementById('modalTitle').textContent = 'Edit Tenant';
  document.getElementById('tenantId').value = tenant.id;
  document.getElementById('fullName').value = tenant.fullName;
  document.getElementById('email').value = tenant.email;
  document.getElementById('phone').value = tenant.phone;
  document.getElementById('emergencyContact').value = tenant.emergencyContact || '';
  document.getElementById('unitNumber').value = tenant.unitNumber;
  document.getElementById('rentAmount').value = tenant.rentAmount;
  document.getElementById('leaseStart').value = tenant.leaseStart;
  document.getElementById('leaseEnd').value = tenant.leaseEnd;
  document.getElementById('status').value = tenant.status;
  document.getElementById('deposit').value = tenant.deposit || '';
  document.getElementById('notes').value = tenant.notes || '';
  
  document.getElementById('tenantModal').classList.add('show');
}

function viewTenant(id) {
  const tenant = tenants.find(t => t.id === id);
  if (!tenant) return;

  const daysUntilEnd = Math.ceil((new Date(tenant.leaseEnd) - new Date()) / (1000 * 60 * 60 * 24));
  const leaseStatus = daysUntilEnd > 0 ? `${daysUntilEnd} days remaining` : 'Expired';

  document.getElementById('detailsModalTitle').textContent = `${tenant.fullName} - Details`;
  document.getElementById('detailsContent').innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px">
      <div>
        <h4 style="color:#1e293b;margin-bottom:16px;font-size:16px">Personal Information</h4>
        <div class="detail-row">
          <span class="detail-label">Full Name</span>
          <span class="detail-value">${tenant.fullName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email</span>
          <span class="detail-value">${tenant.email}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Phone</span>
          <span class="detail-value">${tenant.phone}</span>
        </div>
        <div class="detail-row" style="border:none">
          <span class="detail-label">Emergency Contact</span>
          <span class="detail-value">${tenant.emergencyContact || 'N/A'}</span>
        </div>
      </div>
      <div>
        <h4 style="color:#1e293b;margin-bottom:16px;font-size:16px">Lease Information</h4>
        <div class="detail-row">
          <span class="detail-label">Unit Number</span>
          <span class="detail-value">${tenant.unitNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Monthly Rent</span>
          <span class="detail-value">₱${tenant.rentAmount.toLocaleString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Security Deposit</span>
          <span class="detail-value">₱${(tenant.deposit || 0).toLocaleString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Lease Start</span>
          <span class="detail-value">${formatDate(tenant.leaseStart)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Lease End</span>
          <span class="detail-value">${formatDate(tenant.leaseEnd)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Lease Status</span>
          <span class="detail-value">${leaseStatus}</span>
        </div>
        <div class="detail-row" style="border:none">
          <span class="detail-label">Status</span>
          <span class="status-badge ${tenant.status}">${capitalize(tenant.status)}</span>
        </div>
      </div>
    </div>
    ${tenant.notes ? `
      <div style="margin-top:24px">
        <h4 style="color:#1e293b;margin-bottom:12px;font-size:16px">Notes</h4>
        <p style="color:#64748b;line-height:1.6">${tenant.notes}</p>
      </div>
    ` : ''}
  `;
  
  document.getElementById('detailsModal').classList.add('show');
}

function deleteTenant(id) {
  if (!confirm('Are you sure you want to delete this tenant?')) return;
  
  tenants = tenants.filter(t => t.id !== id);
  renderStats();
  renderTenants();
  filterTenants();
}

function handleFormSubmit(e) {
  e.preventDefault();
  
  const formData = {
    fullName: document.getElementById('fullName').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    emergencyContact: document.getElementById('emergencyContact').value,
    unitNumber: document.getElementById('unitNumber').value,
    rentAmount: parseInt(document.getElementById('rentAmount').value),
    leaseStart: document.getElementById('leaseStart').value,
    leaseEnd: document.getElementById('leaseEnd').value,
    status: document.getElementById('status').value,
    deposit: parseInt(document.getElementById('deposit').value) || 0,
    notes: document.getElementById('notes').value
  };

  if (editingId) {
    const index = tenants.findIndex(t => t.id === editingId);
    tenants[index] = { ...tenants[index], ...formData };
  } else {
    const newId = Math.max(...tenants.map(t => t.id), 0) + 1;
    tenants.push({ id: newId, ...formData });
  }

  closeModal();
  renderStats();
  renderTenants();
  filterTenants();
  populateUnitFilter();
}

function closeModal() {
  document.getElementById('tenantModal').classList.remove('show');
}

function closeDetailsModal() {
  document.getElementById('detailsModal').classList.remove('show');
}

function filterTenants() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const statusFilter = document.getElementById('statusFilter').value;
  const unitFilter = document.getElementById('unitFilter').value;

  let filtered = tenants.filter(tenant => {
    const matchesSearch = 
      tenant.fullName.toLowerCase().includes(search) ||
      tenant.email.toLowerCase().includes(search) ||
      tenant.phone.includes(search) ||
      tenant.unitNumber.toLowerCase().includes(search);
    
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    const matchesUnit = unitFilter === 'all' || tenant.unitNumber === unitFilter;

    return matchesSearch && matchesStatus && matchesUnit;
  });

  renderTenants(filtered);
  
  const statusText = statusFilter === 'all' ? 'All' : capitalize(statusFilter);
  document.getElementById('listTitle').textContent = 
    `${statusText} Tenants (${filtered.length})`;
}

function populateUnitFilter() {
  const units = [...new Set(tenants.map(t => t.unitNumber))].sort();
  const select = document.getElementById('unitFilter');
  const currentValue = select.value;
  
  select.innerHTML = '<option value="all">All Units</option>' +
    units.map(unit => `<option value="${unit}">${unit}</option>`).join('');
  
  select.value = currentValue;
}

function populateUnitDropdown() {
  // Available units from the system (you can fetch this from your units data)
  const units = ['A-101', 'A-102', 'B-201', 'B-202', 'C-301', 'D-402'];
  const select = document.getElementById('unitNumber');
  
  select.innerHTML = '<option value="">Select Unit</option>' +
    units.map(unit => `<option value="${unit}">${unit}</option>`).join('');
}

function exportToCSV() {
  const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Emergency Contact', 'Unit', 'Rent', 'Lease Start', 'Lease End', 'Status', 'Deposit', 'Notes'];
  const rows = tenants.map(t => [
    t.id,
    t.fullName,
    t.email,
    t.phone,
    t.emergencyContact || '',
    t.unitNumber,
    t.rentAmount,
    t.leaseStart,
    t.leaseEnd,
    t.status,
    t.deposit || 0,
    t.notes || ''
  ]);

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  downloadFile(csv, 'tenants.csv', 'text/csv');
}

function exportToXML() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<tenants>\n';
  
  tenants.forEach(tenant => {
    xml += '  <tenant>\n';
    xml += `    <id>${tenant.id}</id>\n`;
    xml += `    <fullName>${escapeXml(tenant.fullName)}</fullName>\n`;
    xml += `    <email>${escapeXml(tenant.email)}</email>\n`;
    xml += `    <phone>${escapeXml(tenant.phone)}</phone>\n`;
    xml += `    <emergencyContact>${escapeXml(tenant.emergencyContact || '')}</emergencyContact>\n`;
    xml += `    <unitNumber>${escapeXml(tenant.unitNumber)}</unitNumber>\n`;
    xml += `    <rentAmount>${tenant.rentAmount}</rentAmount>\n`;
    xml += `    <leaseStart>${tenant.leaseStart}</leaseStart>\n`;
    xml += `    <leaseEnd>${tenant.leaseEnd}</leaseEnd>\n`;
    xml += `    <status>${tenant.status}</status>\n`;
    xml += `    <deposit>${tenant.deposit || 0}</deposit>\n`;
    xml += `    <notes>${escapeXml(tenant.notes || '')}</notes>\n`;
    xml += '  </tenant>\n';
  });
  
  xml += '</tenants>';
  downloadFile(xml, 'tenants.xml', 'text/xml');
}

function importFromXML(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(event.target.result, 'text/xml');
      const tenantNodes = xmlDoc.getElementsByTagName('tenant');
      
      const imported = [];
      for (let node of tenantNodes) {
        imported.push({
          id: parseInt(node.querySelector('id')?.textContent) || Date.now(),
          fullName: node.querySelector('fullName')?.textContent || '',
          email: node.querySelector('email')?.textContent || '',
          phone: node.querySelector('phone')?.textContent || '',
          emergencyContact: node.querySelector('emergencyContact')?.textContent || '',
          unitNumber: node.querySelector('unitNumber')?.textContent || '',
          rentAmount: parseInt(node.querySelector('rentAmount')?.textContent) || 0,
          leaseStart: node.querySelector('leaseStart')?.textContent || '',
          leaseEnd: node.querySelector('leaseEnd')?.textContent || '',
          status: node.querySelector('status')?.textContent || 'active',
          deposit: parseInt(node.querySelector('deposit')?.textContent) || 0,
          notes: node.querySelector('notes')?.textContent || ''
        });
      }

      if (imported.length > 0) {
        tenants = imported;
        renderStats();
        renderTenants();
        filterTenants();
        populateUnitFilter();
        alert(`Successfully imported ${imported.length} tenants!`);
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
  tenants = JSON.parse(JSON.stringify(sampleData));
  renderStats();
  renderTenants();
  filterTenants();
  populateUnitFilter();
}

// Helper functions
function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
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