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
    <main className="min-h-screen bg-[#080B11] text-slate-200 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-10">
        
        {/* BUILDER SECTION */}
        <div className="bg-[#0F1524] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <h2 className="text-xl font-bold text-white">⚙️ Resume Builder</h2>
          <input type="text" className="w-full bg-[#080B11] border border-slate-700 rounded-xl p-3 text-white" placeholder="Full Name" onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <input type="text" className="w-full bg-[#080B11] border border-slate-700 rounded-xl p-3 text-white" placeholder="Profession" onChange={(e) => setFormData({...formData, profession: e.target.value})} />
          <textarea rows="3" className="w-full bg-[#080B11] border border-slate-700 rounded-xl p-3 text-white" placeholder="Experience" onChange={(e) => setFormData({...formData, experience: e.target.value})}></textarea>
          
          {/* Custom Sections Inputs */}
          {customSections.map(sec => (
            <div key={sec.id} className="p-3 border border-slate-700 rounded-xl space-y-2">
              <input type="text" className="w-full bg-[#080B11] border border-slate-700 rounded-lg p-2 text-white" placeholder="Section Title" onChange={(e) => updateCustomSection(sec.id, 'title', e.target.value)} />
              <textarea className="w-full bg-[#080B11] border border-slate-700 rounded-lg p-2 text-white" placeholder="Section Content" onChange={(e) => updateCustomSection(sec.id, 'content', e.target.value)}></textarea>
              <button onClick={() => removeCustomSection(sec.id)} className="text-red-400 text-xs">Remove</button>
            </div>
          ))}

          <button onClick={addCustomSection} className="w-full py-3 text-sm font-bold text-slate-400 border border-dashed border-slate-700 rounded-xl hover:bg-slate-800">
            + Add Custom Section
          </button>
        </div>

        {/* PREVIEW SECTION */}
        <div className="bg-white p-12 w-full max-w-[800px] mx-auto text-black" ref={resumeRef}>
          <h1 className="text-3xl font-bold uppercase">{formData.name || 'YOUR NAME'}</h1>
          <p className="text-blue-600 font-bold">{formData.profession || 'PROFESSION'}</p>
          <div className="mt-6"><h3 className="font-bold border-b border-black">Experience</h3><p>{formData.experience}</p></div>
          
          {/* Rendering Custom Sections */}
          {customSections.map(sec => (
             <div key={sec.id} className="mt-6">
               <h3 className="font-bold border-b border-black">{sec.title}</h3>
               <p>{sec.content}</p>
             </div>
          ))}
        </div>
      </div>
    </main>
  );
}