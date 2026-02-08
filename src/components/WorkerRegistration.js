import React, { useState } from 'react';
import './WorkerRegistration.css';

const WorkerRegistration = () => {
  // Dynamic data for dropdowns and checklists
  const barangays = ["Nazareth", "Macasandig", "Carmen", "Kauswagan", "Lapasan"];
  const skillsList = ["Electrician", "Plumber", "Carpenter", "Welder", "Beautician", "Mechanic"];

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    barangay: '',
    experience: '',
    availability: '',
    selectedSkills: []
  });

  const handleSkillChange = (skill) => {
    setFormData(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter(s => s !== skill)
        : [...prev.selectedSkills, skill]
    }));
  };

  return (
    <main className="registration-container">
      <header className="form-header">
        <h1>SKILL-LINK CDO</h1>
        <p>Worker Registration / Pagparehistro ng Manggagawa</p>
      </header>

      <form className="registration-form">
        <section className="form-group">
          <label>Full Name / Buong Pangalan</label> 
          <input type="text" placeholder="Enter your name" required />
        </section>

        <section className="form-group">
          <label>Contact Number / Numero ng Telepono</label> 
          <input type="tel" placeholder="09XXXXXXXXX" required />
        </section>

        <section className="form-group">
          <label>Barangay</label> 
          <select required>
            <option value="">Select your Barangay</option>
            {barangays.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </section>

        <section className="form-group">
          <label>Skills / Mga Kasanayan</label> 
          <div className="skills-grid">
            {skillsList.map(skill => (
              <label key={skill} className="checkbox-label">
                <input 
                  type="checkbox" 
                  onChange={() => handleSkillChange(skill)} 
                /> {skill}
              </label>
            ))}
          </div>
        </section>

        <section className="form-group">
          <label>Years of Experience / Taon ng Karanasan</label> 
          <input type="number" min="0" placeholder="e.g. 5" />
        </section>

        <section className="form-group">
          <label>Availability / Oras ng Pagtatrabaho</label> 
          <input type="text" placeholder="e.g. Mon-Fri, 8am-5pm" />
        </section>

        <section className="form-group">
          <label>Upload Profile Picture / Mag-upload ng Larawan</label> 
          <input type="file" accept="image/*" />
        </section>

        <button type="submit" className="submit-btn">
          Submit / I-save ang Profile
        </button> 
      </form>
    </main>
  );
};

export default WorkerRegistration;