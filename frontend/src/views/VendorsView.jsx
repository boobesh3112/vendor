import { useState } from 'react';
import { Search, Plus, Trash2, Mail, Phone, MapPin, CheckCircle, ShieldAlert, AlertTriangle, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import BlurReveal from '../components/BlurReveal';
import { soundEngine } from '../utils/audio';

export default function VendorsView({ vendors, onAddVendor, onDeleteVendor }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Onboarding Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [shakeModal, setShakeModal] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    category: 'IT',
    status: 'Pending',
    address: ''
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

  const handleNextStep = () => {
    soundEngine.playClick();
    if (onboardingStep === 1) {
      // Validate Step 1
      if (!formData.name.trim()) {
        setFormErrors(prev => ({ ...prev, name: 'Company Name is required' }));
        triggerErrorShake();
        return;
      }
      setOnboardingStep(2);
    } else if (onboardingStep === 2) {
      // Validate Step 2
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const errors = {};
      if (!formData.contactPerson.trim()) errors.contactPerson = 'Contact Person is required';
      if (!formData.email.trim()) {
        errors.email = 'Email address is required';
      } else if (!emailRegex.test(formData.email)) {
        errors.email = 'Invalid email format';
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(prev => ({ ...prev, ...errors }));
        triggerErrorShake();
        return;
      }
      setOnboardingStep(3);
    } else if (onboardingStep === 3) {
      // Validate Step 3
      if (!formData.address.trim()) {
        setFormErrors(prev => ({ ...prev, address: 'Address is required' }));
        triggerErrorShake();
        return;
      }
      setOnboardingStep(4);
    }
  };

  const handlePrevStep = () => {
    soundEngine.playClick();
    setOnboardingStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Final Submit
    const res = await onAddVendor({
      ...formData,
      onboardingStep: 4
    });

    if (res) {
      // Explode Confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#ec4899', '#8b5cf6', '#10b981']
      });

      // Play success audio
      soundEngine.playSuccess();

      // Reset
      setIsModalOpen(false);
      setOnboardingStep(1);
      setFormData({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        category: 'IT',
        status: 'Pending',
        address: ''
      });
      setFormErrors({});
    } else {
      triggerErrorShake();
    }
  };

  // Filter vendors
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || v.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || v.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="tab-transition" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Filtering Header */}
      <BlurReveal delay={0}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', flex: 1, maxWidth: '800px' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search vendor directory..."
                className="form-input interactive"
                style={{ paddingLeft: '40px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Category Select */}
            <select
              className="form-select interactive"
              style={{ width: '150px' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="IT">IT</option>
              <option value="Logistics">Logistics</option>
              <option value="Consulting">Consulting</option>
              <option value="Facilities">Facilities</option>
              <option value="Marketing">Marketing</option>
            </select>

            {/* Status Select */}
            <select
              className="form-select interactive"
              style={{ width: '150px' }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              setIsModalOpen(true);
            }}
            className="btn btn-primary interactive"
          >
            <Plus size={18} /> Onboard Vendor
          </button>
        </div>
      </BlurReveal>

      {/* Vendors Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredVendors.map((vendor, idx) => {
          let statusBadge = <span className="badge badge-pending">Pending</span>;
          if (vendor.status === 'Active') statusBadge = <span className="badge badge-active">Active</span>;
          if (vendor.status === 'Suspended') statusBadge = <span className="badge badge-suspended">Suspended</span>;

          return (
            <BlurReveal key={vendor.id} delay={idx * 60}>
              <div
                className="glass-panel glass-panel-hover"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  position: 'relative'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '4px', color: '#94a3b8', fontWeight: '600' }}>
                      {vendor.category}
                    </span>
                    <h4 style={{ fontSize: '18px', fontWeight: '700', marginTop: '8px', color: '#fff' }}>{vendor.name}</h4>
                  </div>
                  {statusBadge}
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} color="#06b6d4" />
                    <span>{vendor.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} color="#06b6d4" />
                    <span>{vendor.phone || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} color="#06b6d4" />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {vendor.address || 'No address details'}
                    </span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '14px', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Rating:</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: vendor.rating > 0 ? '#fbbf24' : '#64748b' }}>
                      {vendor.rating > 0 ? `${vendor.rating} / 5.0` : 'Not Rated'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onDeleteVendor(vendor.id);
                    }}
                    className="interactive"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(239, 68, 68, 0.6)',
                      padding: '6px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(239, 68, 68, 0.6)';
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </BlurReveal>
          );
        })}
      </div>

      {/* Multi-step Onboarding Modal Overlay */}
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
          {/* Modal Container */}
          <div
            className={`glass-panel ${shakeModal ? 'shake' : ''}`}
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              position: 'relative',
              boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
              border: '1px solid rgba(6, 182, 212, 0.15)'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsModalOpen(false);
                setOnboardingStep(1);
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

            {/* Title & Progress Tracker */}
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>Vendor Onboarding</h3>
              {/* Stepper indicator */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                {[1, 2, 3, 4].map(step => (
                  <div
                    key={step}
                    style={{
                      flex: 1,
                      height: '4px',
                      borderRadius: '2px',
                      backgroundColor: onboardingStep >= step ? '#06b6d4' : 'rgba(255,255,255,0.1)',
                      boxShadow: onboardingStep >= step ? '0 0 6px #06b6d4' : 'none',
                      transition: 'all 0.3s'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Step Content */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* STEP 1: Company Profile */}
              {onboardingStep === 1 && (
                <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '15px', color: '#94a3b8', fontWeight: '600' }}>Company Details</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>Company Name *</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Apex Tech Solutions"
                      className="form-input interactive"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                    {formErrors.name && <span style={{ fontSize: '11px', color: '#ef4444' }}>{formErrors.name}</span>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>Industry Category</label>
                    <select
                      name="category"
                      className="form-select interactive"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="IT">IT</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Facilities">Facilities</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 2: Contact Info */}
              {onboardingStep === 2 && (
                <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '15px', color: '#94a3b8', fontWeight: '600' }}>Point of Contact</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>Contact Name *</label>
                    <input
                      type="text"
                      name="contactPerson"
                      placeholder="e.g. Alex Rivera"
                      className="form-input interactive"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                    />
                    {formErrors.contactPerson && <span style={{ fontSize: '11px', color: '#ef4444' }}>{formErrors.contactPerson}</span>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. contact@apextech.com"
                      className="form-input interactive"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    {formErrors.email && <span style={{ fontSize: '11px', color: '#ef4444' }}>{formErrors.email}</span>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="e.g. +1 (555) 019-2834"
                      className="form-input interactive"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Address / Location */}
              {onboardingStep === 3 && (
                <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '15px', color: '#94a3b8', fontWeight: '600' }}>Operational HQ</h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>Corporate Address *</label>
                    <textarea
                      name="address"
                      rows="3"
                      placeholder="e.g. 100 Innovation Way, Suite 400, San Jose, CA"
                      className="form-textarea interactive"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                    {formErrors.address && <span style={{ fontSize: '11px', color: '#ef4444' }}>{formErrors.address}</span>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>Initial Status</label>
                    <select
                      name="status"
                      className="form-select interactive"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="Pending">Pending Audit</option>
                      <option value="Active">Pre-Approved (Active)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 4: Review & Compliance verification */}
              {onboardingStep === 4 && (
                <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '15px', color: '#94a3b8', fontWeight: '600' }}>Review & Final Verification</h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }}>
                    <p><strong style={{ color: '#06b6d4' }}>Company:</strong> {formData.name}</p>
                    <p><strong style={{ color: '#06b6d4' }}>Category:</strong> {formData.category}</p>
                    <p><strong style={{ color: '#06b6d4' }}>Contact:</strong> {formData.contactPerson} ({formData.email})</p>
                    <p><strong style={{ color: '#06b6d4' }}>Phone:</strong> {formData.phone || 'N/A'}</p>
                    <p><strong style={{ color: '#06b6d4' }}>Location:</strong> {formData.address}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '8px', color: '#34d399', fontSize: '12px' }}>
                    <CheckCircle size={20} style={{ flexShrink: 0 }} />
                    <span>Company validation documents successfully pre-scanned. Select Submit to finalize vendor registration.</span>
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                {onboardingStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="btn btn-secondary interactive"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {onboardingStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="btn btn-primary interactive"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-primary interactive"
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}
                  >
                    Submit & Onboard
                  </button>
                )}
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
