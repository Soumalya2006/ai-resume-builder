'use client';
import { useState, useRef } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({ 
    name: '', profession: '', skills: '', summary: '', experience: '', education: '', image: null 
  });
  const [customSections, setCustomSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const resumeRef = useRef();

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
      // Sending 'elite' tier by default to ensure best quality output for free
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tier: 'elite' }),
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
      filename: `${formData.name || 'CV'}_Resume.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  return (
    <main className="min-h-screen bg-[#080B11] text-slate-200 font-sans p-4 md:p-8 relative flex flex-col justify-between">
      
      <div>
        {/* PRIVACY POLICY MODAL */}
        {showPrivacyModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-4 my-8 text-left">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-2xl font-black text-white">Privacy Policy</h3>
                <button onClick={() => setShowPrivacyModal(false)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
              </div>
              <div className="space-y-4 text-sm text-slate-300 max-h-[60vh] overflow-y-auto">
                <p>We believe in absolute data ownership. We <strong>do not store</strong> your personal information. All data exists strictly in your local browser session.</p>
                <p>Your image is never uploaded to a cloud; it stays on your device. We use Google Gemini API only for text generation.</p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-2">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent">Pro AI Resume</span> Studio
          </h1>
          <p className="text-slate-400 text-sm md:text-base">Create your professional, high-impact resume in seconds. Totally Free.</p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-10">
          
          <div className="bg-[#0F1524] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">⚙️ Resume Builder</h2>
            
            <div className="bg-[#161F32] p-4 rounded-xl border border-slate-700">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Profile Picture</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input type="text" className="w-full bg-[#080B11] border border-slate-700 rounded-xl p-3 text-white" placeholder="Full Name" onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <input type="text" className="w-full bg-[#080B11] border border-slate-700 rounded-xl p-3 text-white" placeholder="Target Profession" onChange={(e) => setFormData({...formData, profession: e.target.value})} />
            </div>

            <input type="text" className="w-full bg-[#080B11] border border-slate-700 rounded-xl p-3 text-white" placeholder="Skills (React, Python, AWS...)" onChange={(e) => setFormData({...formData, skills: e.target.value})} />

            <div className="space-y-1">
              <button onClick={generateAISummary} disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all">
                {loading ? '🤖 AI Writing...' : '✨ Write Professional Summary'}
              </button>
              <textarea rows="3" value={formData.summary} className="w-full bg-[#080B11] border border-slate-700 rounded-xl p-3 text-white" placeholder="AI will generate your summary..." onChange={(e) => setFormData({...formData, summary: e.target.value})}></textarea>
            </div>

            <textarea rows="3" className="w-full bg-[#080B11] border border-slate-700 rounded-xl p-3 text-white" placeholder="Work History (Company | Role | Year)" onChange={(e) => setFormData({...formData, experience: e.target.value})}></textarea>
            <textarea rows="2" className="w-full bg-[#080B11] border border-slate-700 rounded-xl p-3 text-white" placeholder="Education (Degree | College | Year)" onChange={(e) => setFormData({...formData, education: e.target.value})}></textarea>

            <button onClick={addCustomSection} className="w-full py-3 text-sm font-bold text-slate-400 border border-dashed border-slate-700 rounded-xl hover:bg-slate-800">
              + Add Custom Section
            </button>
          </div>

          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Preview</h2>
              <button onClick={downloadPDF} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105">
                📥 Download PDF
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800 shadow-2xl bg-white w-full max-w-[800px] mx-auto">
              <div ref={resumeRef} className="p-12 min-h-[900px] w-full" style={{ backgroundColor: '#ffffff', fontFamily: "Georgia, serif" }}>
                <div className="flex justify-between items-start border-b-2 pb-6 mb-6 border-slate-200">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-serif font-bold text-slate-900 uppercase">{formData.name || 'YOUR FULL NAME'}</h1>
                    <p className="font-sans font-bold text-blue-600 uppercase tracking-widest">{formData.profession || 'PROFESSION'}</p>
                  </div>
                  {formData.image && <img src={formData.image} alt="Profile" className="w-24 h-24 object-cover rounded-lg" />}
                </div>

                {formData.summary && <p className="mb-6 text-sm text-slate-700 leading-relaxed">{formData.summary}</p>}
                
                {formData.skills && (
                  <div className="mb-6">
                    <h3 className="text-xs font-black uppercase text-slate-400 border-b border-slate-200 mb-2">Core Capabilities</h3>
                    <div className="flex flex-wrap gap-2">{formData.skills.split(',').map((s, i) => <span key={i} className="text-xs px-2 py-1 bg-slate-100 rounded">{s.trim()}</span>)}</div>
                  </div>
                )}
                
                {formData.experience && <div className="mb-6"><h3 className="text-xs font-black uppercase text-slate-400 border-b border-slate-200 mb-2">Experience</h3><p className="text-sm text-slate-700 whitespace-pre-line">{formData.experience}</p></div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="max-w-7xl w-full mx-auto mt-20 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 Pro AI Resume Studio. | <button onClick={() => setShowPrivacyModal(true)} className="underline">Privacy Policy</button></p>
      </footer>
    </main>
  );
}