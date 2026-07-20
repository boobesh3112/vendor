import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import ClickSpark from './components/ClickSpark';
import CustomCursor from './components/CustomCursor';
import IOSDock from './components/IOSDock';
import ScrollProgress from './components/ScrollProgress';
import DashboardView from './views/DashboardView';
import VendorsView from './views/VendorsView';
import ContractsView from './views/ContractsView';
import PerformanceView from './views/PerformanceView';
import InvoicesView from './views/InvoicesView';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activities, setActivities] = useState([]);

  // Fetch all initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, vendorsRes, contractsRes, perfRes, invRes, actRes] = await Promise.all([
        fetch(`${API_BASE}/stats`).then(r => r.json()),
        fetch(`${API_BASE}/vendors`).then(r => r.json()),
        fetch(`${API_BASE}/contracts`).then(r => r.json()),
        fetch(`${API_BASE}/performance`).then(r => r.json()),
        fetch(`${API_BASE}/invoices`).then(r => r.json()),
        fetch(`${API_BASE}/activities`).then(r => r.json())
      ]);

      setStats(statsRes);
      setVendors(vendorsRes);
      setContracts(contractsRes);
      setPerformanceData(perfRes);
      setInvoices(invRes);
      setActivities(actRes);
    } catch (err) {
      console.error('Error fetching VMS backend data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // API Mutations
  const handleAddVendor = async (vendorData) => {
    try {
      const res = await fetch(`${API_BASE}/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorData)
      });
      if (res.ok) {
        await fetchData(); // refresh state
        return true;
      }
    } catch (err) {
      console.error('Error adding vendor:', err);
    }
    return false;
  };

  const handleDeleteVendor = async (vendorId) => {
    if (!window.confirm('Are you sure you want to delete this vendor and all associated records?')) return;
    try {
      const res = await fetch(`${API_BASE}/vendors/${vendorId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
    } catch (err) {
      console.error('Error deleting vendor:', err);
    }
    return false;
  };

  const handleAddContract = async (contractData) => {
    try {
      const res = await fetch(`${API_BASE}/contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractData)
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
    } catch (err) {
      console.error('Error adding contract:', err);
    }
    return false;
  };

  const handleUpdateContract = async (contractId, updateData) => {
    try {
      const res = await fetch(`${API_BASE}/contracts/${contractId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
    } catch (err) {
      console.error('Error updating contract:', err);
    }
    return false;
  };

  const handleAddReview = async (reviewData) => {
    try {
      const res = await fetch(`${API_BASE}/performance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
    } catch (err) {
      console.error('Error adding review:', err);
    }
    return false;
  };

  const handleAddInvoice = async (invoiceData) => {
    try {
      const res = await fetch(`${API_BASE}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
    } catch (err) {
      console.error('Error adding invoice:', err);
    }
    return false;
  };

  const handlePayInvoice = async (invoiceId) => {
    try {
      const res = await fetch(`${API_BASE}/invoices/${invoiceId}/pay`, {
        method: 'PUT'
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
    } catch (err) {
      console.error('Error paying invoice:', err);
    }
    return false;
  };

  // Render correct view based on active tab
  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView stats={stats} activities={activities} loading={loading} onRefresh={fetchData} />;
      case 'vendors':
        return <VendorsView vendors={vendors} onAddVendor={handleAddVendor} onDeleteVendor={handleDeleteVendor} />;
      case 'contracts':
        return <ContractsView contracts={contracts} vendors={vendors} onAddContract={handleAddContract} onUpdateContract={handleUpdateContract} />;
      case 'performance':
        return <PerformanceView performanceData={performanceData} vendors={vendors} onAddReview={handleAddReview} />;
      case 'invoices':
        return <InvoicesView invoices={invoices} vendors={vendors} onAddInvoice={handleAddInvoice} onPayInvoice={handlePayInvoice} />;
      default:
        return <DashboardView stats={stats} activities={activities} loading={loading} onRefresh={fetchData} />;
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Background Interactive Effects */}
      <ClickSpark />
      <CustomCursor />
      <ScrollProgress />

      {/* Sleek Enterprise Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          paddingBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #ec4899 100%)',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
            }}
          >
            <Sparkles size={20} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', tracking: '0.05em', color: '#fff', letterSpacing: '0.05em' }}>
              VEND<span style={{ color: '#06b6d4' }}>.IO</span>
            </h1>
            <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700' }}>
              Enterprise Vendor Console
            </span>
          </div>
        </div>

        {/* Console status info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              padding: '6px 12px',
              borderRadius: '8px',
              color: '#34d399',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            API Connected
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="interactive"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '8px',
              borderRadius: '8px',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
          >
            <RefreshCw size={16} className={loading ? 'spin-anim' : ''} />
          </button>
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .spin-anim { animation: spin 1s linear infinite; }
          `}</style>
        </div>
      </header>

      {/* Main Console Work Area */}
      <main style={{ minHeight: '60vh' }}>
        {renderView()}
      </main>

      {/* Floating iOS Navigation Dock */}
      <IOSDock activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
