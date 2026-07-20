const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_PATH = path.join(__dirname, 'database.json');

app.use(cors());
app.use(bodyParser.json());

// Helper function to read DB
function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file:', err);
    return { vendors: [], contracts: [], performance: [], invoices: [], activities: [] };
  }
}

// Helper function to write DB
function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// Helper to log activities
function logActivity(db, type, description) {
  const newActivity = {
    id: `a-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    type,
    description
  };
  db.activities.unshift(newActivity);
}

// --- VENDOR ENDPOINTS ---
app.get('/api/vendors', (req, res) => {
  const db = readDB();
  res.json(db.vendors);
});

app.post('/api/vendors', (req, res) => {
  const db = readDB();
  const { name, contactPerson, email, phone, category, status, address, onboardingStep } = req.body;

  if (!name || !contactPerson || !email) {
    return res.status(400).json({ error: 'Name, contact person, and email are required.' });
  }

  const newVendor = {
    id: `v-${Date.now()}`,
    name,
    contactPerson,
    email,
    phone: phone || '',
    category: category || 'IT',
    status: status || 'Pending',
    rating: 0.0,
    address: address || '',
    onboardingDate: new Date().toISOString(),
    onboardingStep: onboardingStep !== undefined ? onboardingStep : 1
  };

  db.vendors.push(newVendor);
  logActivity(db, 'vendor_onboarded', `Onboarding started for vendor '${name}' (${newVendor.id}).`);
  writeDB(db);

  res.status(201).json(newVendor);
});

app.put('/api/vendors/:id', (req, res) => {
  const db = readDB();
  const index = db.vendors.findIndex(v => v.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Vendor not found.' });
  }

  const existingVendor = db.vendors[index];
  const updatedVendor = {
    ...existingVendor,
    ...req.body,
    id: existingVendor.id // prevent ID overwrite
  };

  db.vendors[index] = updatedVendor;

  if (req.body.status && req.body.status !== existingVendor.status) {
    logActivity(db, 'status_changed', `Vendor '${updatedVendor.name}' status updated to '${req.body.status}'.`);
  } else {
    logActivity(db, 'status_changed', `Vendor info updated for '${updatedVendor.name}'.`);
  }

  writeDB(db);
  res.json(updatedVendor);
});

app.delete('/api/vendors/:id', (req, res) => {
  const db = readDB();
  const vendor = db.vendors.find(v => v.id === req.params.id);

  if (!vendor) {
    return res.status(404).json({ error: 'Vendor not found.' });
  }

  db.vendors = db.vendors.filter(v => v.id !== req.params.id);
  db.contracts = db.contracts.filter(c => c.vendorId !== req.params.id);
  db.invoices = db.invoices.filter(i => i.vendorId !== req.params.id);
  db.performance = db.performance.filter(p => p.vendorId !== req.params.id);

  logActivity(db, 'status_changed', `Vendor '${vendor.name}' and all associated records deleted.`);
  writeDB(db);

  res.json({ message: 'Vendor successfully deleted.' });
});

// --- CONTRACT ENDPOINTS ---
app.get('/api/contracts', (req, res) => {
  const db = readDB();
  res.json(db.contracts);
});

app.post('/api/contracts', (req, res) => {
  const db = readDB();
  const { vendorId, title, value, startDate, endDate, status } = req.body;

  if (!vendorId || !title || !value || !startDate || !endDate) {
    return res.status(400).json({ error: 'All contract fields are required.' });
  }

  const vendor = db.vendors.find(v => v.id === vendorId);
  if (!vendor) {
    return res.status(404).json({ error: 'Vendor not found.' });
  }

  const newContract = {
    id: `c-${Date.now()}`,
    vendorId,
    title,
    value: Number(value),
    startDate,
    endDate,
    status: status || 'Active'
  };

  db.contracts.push(newContract);
  logActivity(db, 'contract_added', `New contract '${title}' ($${Number(value).toLocaleString()}) registered for vendor '${vendor.name}'.`);
  writeDB(db);

  res.status(201).json(newContract);
});

app.put('/api/contracts/:id', (req, res) => {
  const db = readDB();
  const index = db.contracts.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Contract not found.' });
  }

  db.contracts[index] = {
    ...db.contracts[index],
    ...req.body,
    id: db.contracts[index].id
  };

  const vendor = db.vendors.find(v => v.id === db.contracts[index].vendorId);
  logActivity(db, 'contract_added', `Contract '${db.contracts[index].title}' for '${vendor ? vendor.name : 'Unknown'}' was updated.`);

  writeDB(db);
  res.json(db.contracts[index]);
});

// --- PERFORMANCE ENDPOINTS ---
app.get('/api/performance', (req, res) => {
  const db = readDB();
  res.json(db.performance);
});

app.post('/api/performance', (req, res) => {
  const db = readDB();
  const { vendorId, quality, delivery, communication, cost, compliance, notes } = req.body;

  if (!vendorId) {
    return res.status(400).json({ error: 'Vendor ID is required.' });
  }

  const vendorIndex = db.vendors.findIndex(v => v.id === vendorId);
  if (vendorIndex === -1) {
    return res.status(404).json({ error: 'Vendor not found.' });
  }

  const newReview = {
    id: `p-${Date.now()}`,
    vendorId,
    quality: Number(quality) || 5,
    delivery: Number(delivery) || 5,
    communication: Number(communication) || 5,
    cost: Number(cost) || 5,
    compliance: Number(compliance) || 5,
    date: new Date().toISOString().split('T')[0],
    notes: notes || ''
  };

  db.performance.push(newReview);

  // Recalculate average performance rating for this vendor
  const vendorReviews = db.performance.filter(p => p.vendorId === vendorId);
  const totalScores = vendorReviews.reduce((sum, r) => {
    return sum + ((r.quality + r.delivery + r.communication + r.cost + r.compliance) / 5);
  }, 0);
  const avgScore = Number((totalScores / vendorReviews.length).toFixed(1));

  db.vendors[vendorIndex].rating = avgScore;

  logActivity(db, 'performance_rated', `Performance score of ${avgScore}/5 registered for '${db.vendors[vendorIndex].name}'.`);
  writeDB(db);

  res.status(201).json({ review: newReview, vendorRating: avgScore });
});

// --- INVOICE ENDPOINTS ---
app.get('/api/invoices', (req, res) => {
  const db = readDB();
  res.json(db.invoices);
});

app.post('/api/invoices', (req, res) => {
  const db = readDB();
  const { vendorId, amount, issueDate, dueDate, description } = req.body;

  if (!vendorId || !amount || !issueDate || !dueDate || !description) {
    return res.status(400).json({ error: 'All invoice fields are required.' });
  }

  const vendor = db.vendors.find(v => v.id === vendorId);
  if (!vendor) {
    return res.status(404).json({ error: 'Vendor not found.' });
  }

  const newInvoice = {
    id: `i-${Date.now()}`,
    vendorId,
    amount: Number(amount),
    issueDate,
    dueDate,
    status: 'Pending',
    description
  };

  db.invoices.push(newInvoice);
  logActivity(db, 'invoice_paid', `Invoice created for '${vendor.name}' of $${Number(amount).toLocaleString()} due on ${dueDate}.`);
  writeDB(db);

  res.status(201).json(newInvoice);
});

app.put('/api/invoices/:id/pay', (req, res) => {
  const db = readDB();
  const index = db.invoices.findIndex(i => i.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Invoice not found.' });
  }

  db.invoices[index].status = 'Paid';
  const vendor = db.vendors.find(v => v.id === db.invoices[index].vendorId);
  logActivity(db, 'invoice_paid', `Invoice ${db.invoices[index].id} paid to '${vendor ? vendor.name : 'Unknown Vendor'}' for $${db.invoices[index].amount.toLocaleString()}.`);

  writeDB(db);
  res.json(db.invoices[index]);
});

// --- ACTIVITY ENDPOINTS ---
app.get('/api/activities', (req, res) => {
  const db = readDB();
  res.json(db.activities.slice(0, 50)); // cap at 50 logs
});

// --- STATS ENDPOINT FOR DASHBOARD ---
app.get('/api/stats', (req, res) => {
  const db = readDB();
  
  const totalVendors = db.vendors.length;
  const activeVendors = db.vendors.filter(v => v.status === 'Active').length;
  const pendingVendors = db.vendors.filter(v => v.status === 'Pending').length;
  
  const activeContractsCount = db.contracts.filter(c => c.status === 'Active').length;
  const totalContractValue = db.contracts.reduce((sum, c) => sum + (c.status === 'Active' ? c.value : 0), 0);
  
  const pendingInvoices = db.invoices.filter(i => i.status === 'Pending');
  const overdueInvoices = db.invoices.filter(i => i.status === 'Overdue');
  const pendingInvoiceAmount = pendingInvoices.reduce((sum, i) => sum + i.amount, 0);
  const overdueInvoiceAmount = overdueInvoices.reduce((sum, i) => sum + i.amount, 0);
  
  // Average performance rating of all ACTIVE vendors rated
  const activeVendorsWithRating = db.vendors.filter(v => v.rating > 0 && v.status === 'Active');
  const avgRating = activeVendorsWithRating.length > 0 
    ? Number((activeVendorsWithRating.reduce((sum, v) => sum + v.rating, 0) / activeVendorsWithRating.length).toFixed(1))
    : 0.0;

  // Group spends/vendors by Category
  const categorySpend = {};
  const categoryCount = {};
  db.vendors.forEach(v => {
    categoryCount[v.category] = (categoryCount[v.category] || 0) + 1;
  });
  db.contracts.forEach(c => {
    if (c.status === 'Active') {
      const vendor = db.vendors.find(v => v.id === c.vendorId);
      if (vendor) {
        categorySpend[vendor.category] = (categorySpend[vendor.category] || 0) + c.value;
      }
    }
  });

  res.json({
    kpis: {
      totalVendors,
      activeVendors,
      pendingVendors,
      activeContractsCount,
      totalContractValue,
      pendingInvoicesCount: pendingInvoices.length + overdueInvoices.length,
      pendingInvoiceAmount: pendingInvoiceAmount + overdueInvoiceAmount,
      overdueInvoiceAmount,
      avgPerformanceRating: avgRating
    },
    categoryStats: Object.keys(categoryCount).map(cat => ({
      category: cat,
      count: categoryCount[cat] || 0,
      spend: categorySpend[cat] || 0
    }))
  });
});

app.listen(PORT, () => {
  console.log(`VMS Backend server running on http://localhost:${PORT}`);
});

// If a frontend build exists, serve it as static files so backend can run standalone
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}
