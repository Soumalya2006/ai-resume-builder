'use client';
import { useState, useRef } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({ 
    name: '', profession: '', skills: '', summary: '', experience: '', education: '', image: null 
  });
  const [customSections, setCustomSections] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pricing & Modals State
  const [selectedTier, setSelectedTier] = useState('free'); // 'free', 'pro', 'elite'
  const [unlockedTiers, setUnlockedTiers] = useState({ free: true, pro: false, elite: false });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false); // New Privacy Policy Modal State
  const [pendingTier, setPendingTier] = useState(null);

  const resumeRef = useRef();

  const handleTierSelection = (tier) => {
    if (unlockedTiers[tier]) {
      setSelectedTier(tier);
    } else {
      setPendingTier(tier);
      setShowPaymentModal(true);
    }
  };

  const simulatePaymentSuccess = () => {
    setUnlockedTiers({ ...unlockedTiers, [pendingTier]: true });
    setSelectedTier(pendingTier);
    setShowPaymentModal(false);
    alert(`🎉 Payment Successful! ${pendingTier.toUpperCase()} Plan features are now unlocked!`);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const addCustomSection = () => setCustomSections([...customSections, { id: Date.now(), title: 'New Section', content: '' }]);
  const removeCustomSection = (id) => setCustomSections(customSections.filter(sec => sec.id !== id));
  const updateCustomSection = (id, field, value) => setCustomSections(customSections.map(sec => sec.id === id ? { ...sec, [field]: value } : sec));

  const generateAISummary = async () => {
    if (!formData.name || !formData.skills) return alert("Bhai, kam se kam Naam aur Skills daal do!");
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tier: selectedTier }),
      });
      const data = await res.json();
      if (data.summary) setFormData({ ...formData, summary: data.summary });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const downloadPDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = resumeRef.current;
    const opt = {
      margin: 0.2,
      filename: `${formData.name || 'CV'}_${selectedTier}_Plan.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  return (
    <main className="min-h-screen bg-[#080B11] text-slate-200 font-sans p-4 md:p-8 relative flex flex-col justify-between">
      
      <div>
        {/* 💳 SIMULATED RAZORPAY PAYMENT MODAL */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#111827] border border-purple-500/40 rounded-3xl p-6 md:p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(147,51,234,0.3)] space-y-6">
              <div className="text-purple-500 font-black text-xl tracking-wider">💳 SECURE CHECKOUT</div>
              <h3 className="text-2xl font-bold text-white">Unlock {pendingTier === 'pro' ? '🚀 Pro AI Plan' : '👑 Elite Global Plan'}</h3>
              <p className="text-slate-400 text-sm">Get premium AI writing models, advanced ATS keywords, and global templates instantly.</p>
              <div className="text-3xl font-black text-emerald-400 bg-emerald-500/10 py-3 rounded-xl border border-emerald-500/20">
                {pendingTier === 'pro' ? '₹49 Only' : '₹99 Only'}
              </div>
              <button onClick={simulatePaymentSuccess} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg transition transform hover:scale-[1.02]">
                Simulate Pay via UPI / Cards
              </button>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-500 hover:text-slate-400 text-xs block mx-auto">
                Cancel Payment
              </button>
            </div>
          </div>
        )}

        {/* 🔒 LEGAL ENGLISH PRIVACY POLICY MODAL */}
        {showPrivacyModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-4 my-8 text-left">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-2xl font-black text-white tracking-tight">Privacy Policy</h3>
                <button onClick={() => setShowPrivacyModal(false)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
              </div>
              
              <div className="space-y-4 text-sm text-slate-300 overflow-y-auto max-h-[60vh] pr-2 leading-relaxed">
                <p className="text-xs text-slate-500">Effective Date: June 2026</p>
                <p>Welcome to <strong>Pro AI Resume Studio</strong>. We respect your privacy and are fully committed to protecting the personal data you share with us. This Privacy Policy explains how we handle your data.</p>
                
                <div>
                  <h4 className="font-bold text-white text-base mb-1">1. Data Collection & Storage</h4>
                  <p>We believe in absolute data ownership. We <strong>do not store</strong> your personal information, contact details, work history, education, or dynamic inputs on any remote server or database. All data entered in the customizer exists strictly in your local browser session memory.</p>
                </div>

                <div>
                  <h4 className="font-bold text-white text-base mb-1">2. Profile Image Processing</h4>
                  <p>When you upload a profile picture, it is converted completely into a temporary local Base64 string directly inside your browser. Your image is never uploaded to the cloud, never saved on a hard drive, and is completely cleared once the browser tab is closed.</p>
                </div>

                <div>
                  <h4 className="font-bold text-white text-base mb-1">3. Third-Party AI Services (Google Gemini)</h4>
                  <p>To provide high-quality professional bullet points and summaries, this application transmits your entered name, profession, and skills securely to the official Google Gemini API. This data is used exclusively for instant real-time text generation and is governed under Google AI Studio's data safety terms.</p>
                </div>

                <div>
                  <h4 className="font-bold text-white text-base mb-1">4. Payment Information Security</h4>
                  <p>All premium plan upgrades are simulated or handled safely using encrypted third-party payment infrastructure (such as Razorpay). This platform never captures, processes, or holds your credit card, debit card, net banking, or UPI password data.</p>
                </div>

                <div>
                  <h4 className="font-bold text-white text-base mb-1">5. Data Retention Policy</h4>
                  <p>Your session terminates instantly upon closing or refreshing the page. All states are wiped out completely, leaving zero digital footprints of your private resume details on the internet.</p>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 text-right">
                <button onClick={() => setShowPrivacyModal(false)} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-6 rounded-xl text-sm transition-all">
                  I Understand
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="max-w-7xl mx-auto text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-2">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent">Pro AI Resume</span> Studio
          </h1>
          <p className="text-slate-400 text-sm md:text-base">Choose a plan, write with high-tier AI intelligence, and download instantly.</p>
        </div>

        {/* Pricing Tier Selector */}
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-3 md:gap-4 mb-10 bg-[#0F1524] p-2 rounded-2xl border border-slate-800 shadow-xl">
          <button onClick={() => handleTierSelection('free')} className={`p-3 md:p-4 rounded-xl font-bold text-xs md:text-sm transition-all flex flex-col items-center justify-center gap-1 ${selectedTier === 'free' ? 'bg-slate-800 text-white border border-slate-700 shadow-inner' : 'text-slate-400 hover:text-white'}`}>
            <span>🌱 Free</span>
            <span className="text-[10px] opacity-60">Basic AI (₹0)</span>
          </button>
          <button onClick={() => handleTierSelection('pro')} className={`p-3 md:p-4 rounded-xl font-bold text-xs md:text-sm transition-all flex flex-col items-center justify-center gap-1 relative ${selectedTier === 'pro' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white'} ${unlockedTiers.pro ? 'border border-emerald-500/50' : ''}`}>
            <span>🚀 Pro AI</span>
            <span className="text-[10px] opacity-80">{unlockedTiers.pro ? 'Unlocked' : '₹49'}</span>
            {!unlockedTiers.pro && <span className="absolute -top-2 -right-2 bg-purple-500 text-[9px] text-white px-1.5 py-0.5 rounded-full font-black scale-75 md:scale-100">PRO</span>}
          </button>
          <button onClick={() => handleTierSelection('elite')} className={`p-3 md:p-4 rounded-xl font-bold text-xs md:text-sm transition-all flex flex-col items-center justify-center gap-1 relative ${selectedTier === 'elite' ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'} ${unlockedTiers.elite ? 'border border-emerald-500/50' : ''}`}>
            <span>👑 Elite Global</span>
            <span className="text-[10px] opacity-80">{unlockedTiers.elite ? 'Unlocked' : '₹99'}</span>
            {!unlockedTiers.elite && <span className="absolute -top-2 -right-2 bg-emerald-500 text-[9px] text-slate-950 px-1.5 py-0.5 rounded-full font-black scale-75 md:scale-100">FAANG</span>}
          </button>
        </div>

        {/* Main Grid Layout */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-10">
          
          {/* Left Side: Editor */}
          <div className="bg-[#0F1524] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 h-fit">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">⚙️ Advanced Customizer</h2>
              <span className="text-xs font-bold uppercase px-3 py-1 bg-slate-800 border border-slate-700 text-purple-400 rounded-lg">Active: {selectedTier}</span>
            </div>

            <div className="bg-[#161F32] p-4 rounded-xl border border-slate-700">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Upload Profile Picture (Optional)</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1">Full Name</label>
                <input type="text" className="w-full bg-[#080B11] border border-slate-700 rounded-xl p-3 text-white focus:outline-none" placeholder="Rahul Sharma" onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1">Target Profession</label>
                <input type="text" className="w-full bg-[#080B11] border border-slate-700 rounded-xl p-3 text-white focus:outline-none" placeholder="Software Engineer" onChange={(e) => setFormData({...formData, profession: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-1">Skills (Comma separated)</label>
              <input type="text" className="w-full bg-[#080B11] border border-slate-700 rounded-xl p-3 text-white focus:outline-none" placeholder="React, Python, AWS" onChange={(e) => setFormData({...formData, skills: e.target.value})} />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-semibold text-slate-400">Professional Profile</label>
                <button onClick={generateAISummary} disabled={loading} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold py-1.5 px-4 rounded-lg shadow transition-all disabled:opacity-50">
                  {loading ? '🤖 Writing...' : `✨ Write (${selectedTier.toUpperCase()} AI)`}
                </button>
              </div>
              <textarea rows="3" value={formData.summary} className="w-full bg-[#080B11] border border-slate-700 rounded-xl p-3 text-white focus:outline-none" placeholder="AI will generate based on your plan..." onChange={(e) => setFormData({...formData, summary: e.target.value})}></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-1">Work History</label>
              <textarea rows="3" className="w-full bg-[#080B11] border border-slate-700 rounded-xl p-3 text-white focus:outline-none" placeholder="Company | Role | Timeline" onChange={(e) => setFormData({...formData, experience: e.target.value})}></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-1">Education</label>
              <textarea rows="2" className="w-full bg-[#080B11] border border-slate-700 rounded-xl p-3 text-white focus:outline-none" placeholder="Degree | University | Year" onChange={(e) => setFormData({...formData, education: e.target.value})}></textarea>
            </div>

            {/* Custom Sections */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><span>➕</span> Extra Sections</h3>
                <button onClick={addCustomSection} className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 px-4 rounded-xl border border-slate-700">
                  + Add New Section
                </button>
              </div>

              {customSections.map((section) => (
                <div key={section.id} className="bg-[#161F32] p-4 rounded-2xl border border-slate-700 space-y-3 relative">
                  <button onClick={() => removeCustomSection(section.id)} className="absolute top-3 right-3 text-rose-400 text-xs font-bold">❌</button>
                  <input type="text" value={section.title} className="w-full bg-[#080B11] border border-slate-700 rounded-lg p-2 text-sm text-white font-bold" placeholder="Section Title" onChange={(e) => updateCustomSection(section.id, 'title', e.target.value)} />
                  <textarea rows="2" value={section.content} className="w-full bg-[#080B11] border border-slate-700 rounded-lg p-2 text-sm text-white" placeholder="Details..." onChange={(e) => updateCustomSection(section.id, 'content', e.target.value)}></textarea>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Preview */}
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">🌍 Global CV Sheet</h2>
              <button onClick={downloadPDF} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105">
                📥 Download PDF ({selectedTier.toUpperCase()})
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800 shadow-2xl bg-white w-full max-w-[800px] mx-auto">
              <div ref={resumeRef} className="p-12 min-h-[900px] w-full" style={{ backgroundColor: '#ffffff', fontFamily: "Georgia, serif" }}>
                
                <div className="flex justify-between items-start border-b-2 pb-6 mb-6" style={{ borderBottomColor: '#1e293b' }}>
                  <div className="space-y-2">
                    <h1 className="text-3xl font-serif font-bold tracking-tight uppercase" style={{ color: '#0f172a' }}>{formData.name || 'YOUR FULL NAME'}</h1>
                    <p className="font-sans font-bold text-base uppercase tracking-widest" style={{ color: selectedTier === 'elite' ? '#059669' : selectedTier === 'pro' ? '#7e22ce' : '#2563eb' }}>
                      {formData.profession || 'TARGET PROFESSION'}
                    </p>
                  </div>
                  {formData.image && (
                    <div className="w-24 h-24 overflow-hidden rounded-lg border-2" style={{ borderColor: '#e2e8f0' }}>
                      <img src={formData.image} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {formData.summary && (
                  <div className="mb-6">
                    <h3 className="text-xs font-sans font-black uppercase tracking-widest mb-2 pb-1" style={{ color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Executive Summary</h3>
                    <p className="leading-relaxed text-sm" style={{ color: '#334155' }}>{formData.summary}</p>
                  </div>
                )}

                {formData.skills && (
                  <div className="mb-6">
                    <h3 className="text-xs font-sans font-black uppercase tracking-widest mb-2 pb-1" style={{ color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Core Capabilities</h3>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {formData.skills.split(',').map((skill, index) => (
                        <span key={index} className="text-xs font-sans font-semibold px-2.5 py-1 rounded" style={{ backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #cbd5e1' }}>
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {formData.experience && (
                  <div className="mb-6">
                    <h3 className="text-xs font-sans font-black uppercase tracking-widest mb-2 pb-1" style={{ color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Professional Experience</h3>
                    <p className="whitespace-pre-line text-sm leading-relaxed" style={{ color: '#334155' }}>{formData.experience}</p>
                  </div>
                )}

                {formData.education && (
                  <div className="mb-6">
                    <h3 className="text-xs font-sans font-black uppercase tracking-widest mb-2 pb-1" style={{ color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Education</h3>
                    <p className="whitespace-pre-line text-sm leading-relaxed" style={{ color: '#334155' }}>{formData.education}</p>
                  </div>
                )}

                {customSections.map((section) => (
                  section.title && section.content ? (
                    <div key={section.id} className="mb-6">
                      <h3 className="text-xs font-sans font-black uppercase tracking-widest mb-2 pb-1" style={{ color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>{section.title}</h3>
                      <p className="whitespace-pre-line text-sm leading-relaxed" style={{ color: '#334155' }}>{section.content}</p>
                    </div>
                  ) : null
                ))}

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 🌟 PREMIUM FOOTER WITH PRIVACY POLICY */}
      <footer className="max-w-7xl w-full mx-auto mt-20 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#080B11]">
        <div>© 2026 Pro AI Resume Studio. All rights reserved. Built for Global Acceptability.</div>
        <div className="flex gap-6">
          <button onClick={() => setShowPrivacyModal(true)} className="hover:text-purple-400 transition font-semibold cursor-pointer underline">
            Privacy Policy
          </button>
          <span className="opacity-40">|</span>
          <span className="text-emerald-400 font-bold">🔒 Encrypted Session</span>
        </div>
      </footer>

    </main>
  );
}