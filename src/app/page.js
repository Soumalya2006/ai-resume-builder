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
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tier: 'elite' }),
      });
      const data = await res.json();
      if (data.summary) setFormData({ ...formData, summary: data.summary });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const downloadPDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = resumeRef.current;
    const opt = {
      margin: 0.2, filename: `${formData.name || 'CV'}_Resume.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  return (
    <main className="min-h-screen bg-[#080B11] text-slate-200 font-sans p-4 md:p-8 relative">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-2 text-white">Pro AI Resume Studio</h1>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="bg-[#0F1524] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          <h2 className="text-xl font-bold text-white">⚙️ Builder</h2>
          
          {/* Inputs */}
          <input type="text" className="w-full bg-[#080B11] border border-slate-700 rounded-xl p-3 text-white" placeholder="Full Name" onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <input type="text" className="w-full bg-[#080B11] border border-slate-700 rounded-xl p-3 text-white" placeholder="Profession" onChange={(e) => setFormData({...formData, profession: e.target.value})} />
          <input type="text" className="w-full bg-[#080B11] border border-slate-700 rounded-xl p-3 text-white" placeholder="Skills" onChange={(e) => setFormData({...formData, skills: e.target.value})} />
          
          <button onClick={generateAISummary} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-xl font-bold">
            {loading ? 'AI Writing...' : '✨ Generate AI Summary'}
          </button>
          
          <textarea rows="3" className="w-full bg-[#080B11] border border-slate-700 rounded-xl p-3 text-white" placeholder="Experience" onChange={(e) => setFormData({...formData, experience: e.target.value})}></textarea>

          {/* Custom Sections Editor */}
          {customSections.map(sec => (
            <div key={sec.id} className="bg-[#161F32] p-4 rounded-xl border border-slate-700 space-y-2">
              <input type="text" className="w-full bg-[#080B11] border border-slate-700 rounded-lg p-2 text-white" placeholder="Section Title" onChange={(e) => updateCustomSection(sec.id, 'title', e.target.value)} />
              <textarea className="w-full bg-[#080B11] border border-slate-700 rounded-lg p-2 text-white" placeholder="Content" onChange={(e) => updateCustomSection(sec.id, 'content', e.target.value)}></textarea>
              <button onClick={() => removeCustomSection(sec.id)} className="text-red-400 text-xs">Remove</button>
            </div>
          ))}

          <button onClick={addCustomSection} className="w-full py-3 text-sm font-bold text-slate-400 border border-dashed border-slate-700 rounded-xl hover:bg-slate-800">
            + Add Custom Section
          </button>
        </div>

        {/* PREVIEW */}
        <div className="flex flex-col">
          <button onClick={downloadPDF} className="mb-4 bg-emerald-500 text-black font-bold py-3 rounded-xl">📥 Download PDF</button>
          <div className="bg-white p-12 min-h-[900px] text-black shadow-2xl" ref={resumeRef}>
            <h1 className="text-3xl font-bold uppercase">{formData.name || 'YOUR NAME'}</h1>
            <p className="text-blue-600 font-bold mb-4">{formData.profession || 'PROFESSION'}</p>
            {formData.summary && <p className="mb-6">{formData.summary}</p>}
            
            <h3 className="font-bold border-b border-black mb-2">Experience</h3>
            <p className="whitespace-pre-line mb-6">{formData.experience}</p>

            {/* Custom Sections in Preview */}
            {customSections.map(sec => (
               <div key={sec.id} className="mt-4">
                 <h3 className="font-bold border-b border-black uppercase">{sec.title}</h3>
                 <p className="whitespace-pre-line">{sec.content}</p>
               </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}