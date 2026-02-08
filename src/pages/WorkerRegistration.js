import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { barangays } from '../data/barangays';
import { skills } from '../data/skills';
import '../styles/WorkerRegistration.css';

const WorkerRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    barangay: '',
    experience: '',
    availability: '',
    selectedSkills: []
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'Full name is required';
        }
        break;
      case 'contact':
        if (!/^09\d{9}$/.test(value)) {
          error = 'Enter a valid PH contact number (09XXXXXXXXX)';
        }
        break;
      case 'barangay':
        if (!value) {
          error = 'Please select your barangay';
        }
        break;
      case 'experience':
        if (value === '' || value < 0) {
          error = 'Enter valid years of experience';
        }
        break;
      case 'availability':
        if (!value.trim()) {
          error = 'Availability is required';
        }
        break;
      case 'selectedSkills':
        if (value.length === 0) {
          error = 'Select at least one skill';
        }
        break;
      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSkillChange = (skill) => {
    const newSkills = formData.selectedSkills.includes(skill)
      ? formData.selectedSkills.filter((s) => s !== skill)
      : [...formData.selectedSkills, skill];

    setFormData((prev) => ({ ...prev, selectedSkills: newSkills }));

    setTouched((prev) => ({ ...prev, selectedSkills: true }));
    const error = validateField('selectedSkills', newSkills);
    setErrors((prev) => ({ ...prev, selectedSkills: error }));
  };

  const validateForm = () => {
    const newErrors = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    if (validateForm()) {
      alert('Registration successful!');
      console.log(formData);
    }
  };

  return (
    <div className="page-wrapper">
      <Header />
      <h1 className='page-header'>Worker Registration</h1>
      <main className="registration-container">
        <form className="registration-form" onSubmit={handleSubmit}>

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
                onBlur={handleBlur}
                className={errors.name ? 'error-input' : ''}
                required
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </label>

            <label>
              Contact Number
              <input
                type="tel"
                name="contact"
                placeholder="09XXXXXXXXX"
                value={formData.contact}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.contact ? 'error-input' : ''}
                required
              />
              {errors.contact && <span className="error-message">{errors.contact}</span>}
            </label>

            <label>
              Barangay
              <select
                name="barangay"
                value={formData.barangay}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.barangay ? 'error-input' : ''}
                required
              >
                <option value="">Pumili ng Barangay</option>
                {barangays.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              {errors.barangay && <span className="error-message">{errors.barangay}</span>}
            </label>
          </section>

          {/* Skills */}
          <section className="form-section">
            <h2>Skills / Mga Kasanayan</h2>
            <p className="helper-text">
              Piliin ang iyong kasanayan ({formData.selectedSkills.length} selected)
            </p>

            <div className="skills-grid">
              {skills.map(skill => (
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
            {errors.selectedSkills && <span className="error-message">{errors.selectedSkills}</span>}
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
                placeholder="Example: 5"
                value={formData.experience}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.experience ? 'error-input' : ''}
              />
              {errors.experience && <span className="error-message">{errors.experience}</span>}
            </label>

            <label>
              Availability
              <select
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.availability ? 'error-input' : ''}
              >
                <option value="">Piliin ang Oras</option>
                <option>9 - 10 AM</option>
                <option>10 - 11 AM</option>
                <option>11 - 12 PM</option>
                <option>1 - 2 PM</option>
                <option>2 - 3 PM</option>
                <option>3 - 4 PM</option>
              </select>
              {errors.availability && <span className="error-message">{errors.availability}</span>}
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
      <Footer />
    </div>
  );
};

export default WorkerRegistration;