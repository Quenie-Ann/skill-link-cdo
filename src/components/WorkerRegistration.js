import React, { useState } from 'react';
import './WorkerRegistration.css';
import logo from './assets/logo-skill.png';

const WorkerRegistration = () => {
  // Sample data for dropdowns and skills
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
        <img src={logo} alt="Skill-Link CDO Logo" className="logo" />
        <h1>Worker Registration</h1>
        <p>Pagparehistro ng Manggagawa</p>
      </header>

      <form className="registration-form">

        {/* Personal Info */}
        <section className="form-section">
          <h2>Personal Information</h2>

          <label>
            Full Name
            <input
              type="text"
              name="name"
              placeholder="Buong Pangalan"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Contact Number
            <input
              type="tel"
              name="contact"
              placeholder="09XXXXXXXXX"
              value={formData.contact}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Barangay
            <select
              name="barangay"
              value={formData.barangay}
              onChange={handleChange}
              required
            >
              <option value="">Pumili ng Barangay</option>
              {barangays.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </label>
        </section>

        {/* Skills */}
        <section className="form-section">
          <h2>Skills / Mga Kasanayan</h2>
          <p className="helper-text">
            Piliin ang iyong kasanayan ({formData.selectedSkills.length} selected)
          </p>

          <div className="skills-grid">
            {skillsList.map(skill => (
              <button
                type="button"
                key={skill}
                className={`skill-chip ${
                  formData.selectedSkills.includes(skill) ? 'selected' : ''
                }`}
                onClick={() => handleSkillChange(skill)}
              >
                {skill}
              </button>
            ))}
          </div>
        </section>

        {/* Work Details */}
        <section className="form-section">
          <h2>Work Details</h2>

          <label>
            Years of Experience
            <input
              type="number"
              name="experience"
              min="0"
              placeholder="Example 5"
              value={formData.experience}
              onChange={handleChange}
            />
          </label>

          <label>
            Availability
            <select
              name="availability"
              value={formData.availability}
              onChange={handleChange}
            >
              <option value="">Piliin ang Oras</option>
              <option>9 - 10 AM</option>
              <option>10 - 11 AM</option>
              <option>11 - 12 PM</option>
              <option>1 - 2 PM</option>
              <option>2 - 3 PM</option>
              <option>3 - 4 PM</option>
            </select>
          </label>

          <label>
            Profile Picture
            <input type="file" accept="image/*" />
          </label>
        </section>

        <button type="submit" className="submit-btn">
          Submit / I-save ang Profile
        </button>
      </form>
    </main>
  );
};

export default WorkerRegistration;
