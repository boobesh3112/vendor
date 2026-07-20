import { useState } from 'react';
import { Plus, X, Search, FileText, Calendar, DollarSign, User } from 'lucide-react';
import confetti from 'canvas-confetti';
import BlurReveal from '../components/BlurReveal';
import { soundEngine } from '../utils/audio';

export default function ContractsView({ contracts, vendors, onAddContract, onUpdateContract }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Registration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shakeModal, setShakeModal] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    vendorId: '',
    title: '',
    value: '',
    startDate: '',
    endDate: '',
    status: 'Active'
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
    if (!formData.title.trim()) errors.title = 'Contract title is required';
    if (!formData.value || Number(formData.value) <= 0) errors.value = 'Please enter a valid contract value';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.endDate) errors.endDate = 'End date is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      triggerErrorShake();
      return;
    }

    const res = await onAddContract(formData);
    if (res) {
      soundEngine.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
      setIsModalOpen(false);
      setFormData({
        vendorId: '',
        title: '',
        value: '',
        startDate: '',
        endDate: '',
        status: 'Active'
      });
    } else {
      triggerErrorShake();
    }
  };

  const getVendorName = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name : 'Unknown Vendor';
  };

  const filteredContracts = contracts.filter(c => {
    const vendorName = getVendorName(c.vendorId).toLowerCase();
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || vendorName.includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
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
                placeholder="Search contracts or vendors..."
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
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Under Review">Under Review</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              setIsModalOpen(true);
            }}
            className="btn btn-primary interactive"
          >
            <Plus size={18} /> Register Contract
          </button>
        </div>
      </BlurReveal>

      {/* Contracts Table/List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredContracts.map((contract, idx) => {
          let badge = <span className="badge badge-pending">Under Review</span>;
          if (contract.status === 'Active') badge = <span className="badge badge-active">Active</span>;
          if (contract.status === 'Expired') badge = <span className="badge badge-expired">Expired</span>;

          return (
            <BlurReveal key={contract.id} delay={idx * 50}>
              <div
                className="glass-panel glass-panel-hover"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px',
                  flexWrap: 'wrap'
                }}
              >
                {/* Contract Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '250px' }}>
                  <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
                    <FileText size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>{contract.title}</h4>
                    <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={13} style={{ marginTop: '-2px' }} /> {getVendorName(contract.vendorId)}
                    </p>
                  </div>
                </div>

                {/* Values & Timeline */}
                <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Contract Value</span>
                    <h5 style={{ fontSize: '16px', fontWeight: '700', color: '#10b981', marginTop: '4px' }}>
                      ${contract.value.toLocaleString()}
                    </h5>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Duration</span>
                    <p style={{ fontSize: '13.5px', color: '#e2e8f0', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="#8b5cf6" />
                      <span>{contract.startDate} to {contract.endDate}</span>
                    </p>
                  </div>
                </div>

                {/* Status Badge & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {badge}
                  {contract.status === 'Under Review' && (
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        onUpdateContract(contract.id, { status: 'Active' });
                      }}
                      className="btn btn-secondary interactive"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Approve
                    </button>
                  )}
                </div>
              </div>
            </BlurReveal>
          );
        })}
      </div>

      {/* Contract Registration Modal */}
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
              maxWidth: '480px',
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
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>Register New Contract</h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Draft and link agreements to verified vendors.</p>
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

              {/* Title */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>Contract Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. SLA Support Package"
                  className="form-input interactive"
                  value={formData.title}
                  onChange={handleInputChange}
                />
                {formErrors.title && <span style={{ fontSize: '11px', color: '#ef4444' }}>{formErrors.title}</span>}
              </div>

              {/* Value */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>Contract Value (USD) *</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                  <input
                    type="number"
                    name="value"
                    placeholder="e.g. 50000"
                    className="form-input interactive"
                    style={{ paddingLeft: '32px' }}
                    value={formData.value}
                    onChange={handleInputChange}
                  />
                </div>
                {formErrors.value && <span style={{ fontSize: '11px', color: '#ef4444' }}>{formErrors.value}</span>}
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    className="form-input interactive"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                  {formErrors.startDate && <span style={{ fontSize: '11px', color: '#ef4444' }}>{formErrors.startDate}</span>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>End Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    className="form-input interactive"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                  {formErrors.endDate && <span style={{ fontSize: '11px', color: '#ef4444' }}>{formErrors.endDate}</span>}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary interactive"
                style={{ marginTop: '10px' }}
              >
                Register & Save
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
