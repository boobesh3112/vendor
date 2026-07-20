import { useState } from 'react';
import { Plus, X, Search, DollarSign, Calendar, CreditCard, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import BlurReveal from '../components/BlurReveal';
import { soundEngine } from '../utils/audio';

export default function InvoicesView({ invoices, vendors, onAddInvoice, onPayInvoice }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Registration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shakeModal, setShakeModal] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    vendorId: '',
    amount: '',
    description: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const triggerErrorShake = () => {
    soundEngine.playError();
    setShakeModal(true);
    setTimeout(() => setShakeModal(false), 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const errors = {};
    if (!formData.vendorId) errors.vendorId = 'Please select a vendor';
    if (!formData.amount || Number(formData.amount) <= 0) errors.amount = 'Please enter a valid amount';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.issueDate) errors.issueDate = 'Issue date is required';
    if (!formData.dueDate) errors.dueDate = 'Due date is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      triggerErrorShake();
      return;
    }

    const res = await onAddInvoice(formData);
    if (res) {
      soundEngine.playSuccess();
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 }
      });
      setIsModalOpen(false);
      setFormData({
        vendorId: '',
        amount: '',
        description: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: ''
      });
    } else {
      triggerErrorShake();
    }
  };

  const handlePay = async (id) => {
    soundEngine.playClick();
    const res = await onPayInvoice(id);
    if (res) {
      soundEngine.playSuccess();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#8b5cf6']
      });
    } else {
      soundEngine.playError();
    }
  };

  const getVendorName = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name : 'Unknown Vendor';
  };

  const filteredInvoices = invoices.filter(i => {
    const vendorName = getVendorName(i.vendorId).toLowerCase();
    const matchesSearch = i.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          vendorName.includes(searchTerm.toLowerCase()) ||
                          i.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || i.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="tab-transition" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Filtering Header */}
      <BlurReveal delay={0}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', flex: 1, maxWidth: '600px' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search description, invoice #, vendor..."
                className="form-input interactive"
                style={{ paddingLeft: '40px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="form-select interactive"
              style={{ width: '160px' }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Invoices</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              setIsModalOpen(true);
            }}
            className="btn btn-primary interactive"
          >
            <Plus size={18} /> Create Invoice
          </button>
        </div>
      </BlurReveal>

      {/* Invoices List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredInvoices.map((invoice, idx) => {
          let statusBadge = <span className="badge badge-pending">Pending</span>;
          if (invoice.status === 'Paid') statusBadge = <span className="badge badge-active">Paid</span>;
          if (invoice.status === 'Overdue') statusBadge = <span className="badge badge-suspended">Overdue</span>;

          return (
            <BlurReveal key={invoice.id} delay={idx * 50}>
              <div
                className="glass-panel glass-panel-hover"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px',
                  flexWrap: 'wrap',
                  borderLeft: invoice.status === 'Paid' 
                    ? '4px solid #10b981' 
                    : invoice.status === 'Overdue' 
                      ? '4px solid #ef4444' 
                      : '4px solid #f59e0b'
                }}
              >
                {/* Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '250px' }}>
                  <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.08)', color: '#ec4899' }}>
                    <CreditCard size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>#{invoice.id.toUpperCase()}</span>
                      {statusBadge}
                    </div>
                    <h4 style={{ fontSize: '15.5px', fontWeight: '700', color: '#fff', marginTop: '6px' }}>{invoice.description}</h4>
                    <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                      Vendor: <strong style={{ color: '#e2e8f0' }}>{getVendorName(invoice.vendorId)}</strong>
                    </p>
                  </div>
                </div>

                {/* Amount & Due Date */}
                <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Amount Due</span>
                    <h5 style={{ fontSize: '17px', fontWeight: '700', color: '#fff', marginTop: '4px' }}>
                      ${invoice.amount.toLocaleString()}
                    </h5>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Due Date</span>
                    <p style={{ fontSize: '13.5px', color: '#e2e8f0', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="#8b5cf6" />
                      <span style={{ color: invoice.status === 'Overdue' ? '#ef4444' : '#e2e8f0' }}>{invoice.dueDate}</span>
                    </p>
                  </div>
                </div>

                {/* Pay Action button */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {invoice.status !== 'Paid' ? (
                    <button
                      onClick={() => handlePay(invoice.id)}
                      className="btn interactive"
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)',
                        padding: '8px 16px',
                        fontSize: '13px'
                      }}
                    >
                      <CheckCircle2 size={15} /> Pay Invoice
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '13.5px', fontWeight: '600', paddingRight: '12px' }}>
                      <CheckCircle2 size={16} /> Paid & Cleared
                    </div>
                  )}
                </div>
              </div>
            </BlurReveal>
          );
        })}
        {filteredInvoices.length === 0 && (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>No invoice records found.</div>
        )}
      </div>

      {/* Invoice Creation Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(5, 7, 12, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          <div
            className={`glass-panel ${shakeModal ? 'shake' : ''}`}
            style={{
              width: '100%',
              maxWidth: '460px',
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              position: 'relative'
            }}
          >
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsModalOpen(false);
                setFormErrors({});
              }}
              className="interactive"
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>Create Invoice Record</h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>File a payable expense for a registered vendor.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Vendor Select */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>Linked Vendor *</label>
                <select
                  name="vendorId"
                  className="form-select interactive"
                  value={formData.vendorId}
                  onChange={handleInputChange}
                >
                  <option value="">Select a vendor...</option>
                  {vendors.filter(v => v.status === 'Active').map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
                {formErrors.vendorId && <span style={{ fontSize: '11px', color: '#ef4444' }}>{formErrors.vendorId}</span>}
              </div>

              {/* Amount */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>Invoice Amount (USD) *</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                  <input
                    type="number"
                    name="amount"
                    placeholder="e.g. 12500"
                    className="form-input interactive"
                    style={{ paddingLeft: '32px' }}
                    value={formData.amount}
                    onChange={handleInputChange}
                  />
                </div>
                {formErrors.amount && <span style={{ fontSize: '11px', color: '#ef4444' }}>{formErrors.amount}</span>}
              </div>

              {/* Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>Description / Line Item *</label>
                <input
                  type="text"
                  name="description"
                  placeholder="e.g. Server Maintenance Retainer - July"
                  className="form-input interactive"
                  value={formData.description}
                  onChange={handleInputChange}
                />
                {formErrors.description && <span style={{ fontSize: '11px', color: '#ef4444' }}>{formErrors.description}</span>}
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>Issue Date *</label>
                  <input
                    type="date"
                    name="issueDate"
                    className="form-input interactive"
                    value={formData.issueDate}
                    onChange={handleInputChange}
                  />
                  {formErrors.issueDate && <span style={{ fontSize: '11px', color: '#ef4444' }}>{formErrors.issueDate}</span>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>Due Date *</label>
                  <input
                    type="date"
                    name="dueDate"
                    className="form-input interactive"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                  />
                  {formErrors.dueDate && <span style={{ fontSize: '11px', color: '#ef4444' }}>{formErrors.dueDate}</span>}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary interactive"
                style={{ marginTop: '10px' }}
              >
                File & Save Invoice
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
