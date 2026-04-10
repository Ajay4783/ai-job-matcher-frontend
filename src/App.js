import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState(""); 
  const [source, setSource] = useState("all");

  // 👇 PUTHU FILTER STATES
  const [jobTitle, setJobTitle] = useState("Python Developer");
  const [location, setLocation] = useState("India");
  const [experience, setExperience] = useState("under_3_years_experience");
  const [jobType, setJobType] = useState("FULLTIME");

  const getPortalName = (url) => {
    if (!url) return 'Web';
    if (url.includes('python.org')) return 'Python.org';
    if (url.includes('naukri.com')) return 'Naukri';
    if (url.includes('linkedin.com')) return 'LinkedIn';
    if (url.includes('indeed.com')) return 'Indeed';
    return 'Web';
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setFileName(file.name); 
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      alert("Upload failed! Backend-a check pannunga.");
      setFileName(""); 
    }
    setUploading(false);
  };

  const scanJobs = async () => {
    setLoading(true);
    try {
      // 👇 Filters-a URL vazhiya Backend-kku anuppurom
      const response = await axios.get(`http://127.0.0.1:8000/api/scan-jobs?source=${source}&job_title=${jobTitle}&location=${location}&experience=${experience}&job_type=${jobType}`);
      setJobs(response.data.jobs);
    } catch (error) {
      alert("Scan failed! Backend odutha nu paarunga.");
    }
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/jobs/${id}`, { status: newStatus });
      scanJobs(); 
    } catch (error) {
      console.error("Status update error", error);
    }
  };

  const portals = [
    { id: 'all', name: 'All Portals', icon: '🌐' },
    { id: 'python', name: 'Python.org', icon: '🐍' },
    { id: 'naukri', name: 'Naukri.com', icon: '💼' },
    { id: 'linkedin', name: 'LinkedIn', icon: '🔗' },
    { id: 'indeed', name: 'Indeed', icon: '🔍' }
  ];

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 AI Job Matcher Dashboard</h1>

        {/* --- Resume Upload --- */}
        <div className="upload-container">
          <label className="custom-file-upload scan-btn" style={{background: '#444', marginBottom: '10px'}}>
            <input type="file" onChange={handleFileUpload} accept=".pdf" />
            {uploading ? "Processing PDF... ⏳" : "📁 Step 1: Upload Resume (Optional)"}
          </label>
          {fileName && <div className="file-name-display">✅ Uploaded: <strong>{fileName}</strong></div>}
        </div>

        {/* 👇 PUTHU UI: SEARCH FILTERS BOX */}
        <div className="filter-box">
          <h3>Step 2: Customize Your Search</h3>
          <div className="filter-grid">
            <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Job Title (e.g. React Developer)" />
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (e.g. Chennai, Remote)" />
            
            <select value={experience} onChange={(e) => setExperience(e.target.value)}>
              <option value="">Any Experience</option>
              <option value="under_3_years_experience">Fresher / &lt; 3 Yrs</option>
              <option value="more_than_3_years_experience">Experienced (3+ Yrs)</option>
              <option value="no_degree">No Degree Required</option>
            </select>

            <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
              <option value="">Any Job Type</option>
              <option value="FULLTIME">Full-Time</option>
              <option value="CONTRACTOR">Contract</option>
              <option value="PARTTIME">Part-Time</option>
              <option value="INTERN">Internship</option>
            </select>
          </div>
        </div>

        {/* --- Portal Selection --- */}
        <div className="source-selector">
          <div className="portal-buttons">
            {portals.map(p => (
              <button 
                key={p.id} 
                className={`portal-btn ${source === p.id ? 'active' : ''}`}
                onClick={() => setSource(p.id)}
              >
                <span className="portal-icon">{p.icon}</span> {p.name}
              </button>
            ))}
          </div>
        </div>

        <button onClick={scanJobs} disabled={loading} className="scan-btn main-scan">
          {loading ? "AI is Analyzing 30+ Jobs... 🤖" : `Scan ${source === 'all' ? 'All Portals' : portals.find(p=>p.id === source).name}`}
        </button>

        {/* --- Job List Display --- */}
        <div className="job-list">
          {jobs.map((job) => (
            <div key={job.id} className="job-card">
              <h3>{job.title}</h3>
              <p className="company">🏢 {job.company} <span className="source-tag">({getPortalName(job.link)})</span></p>
              
              <div className="score-container">
                <span className="score-label">Match Score:</span>
                <span className={`score-value ${job.score > 70 ? 'high' : 'low'}`}>{job.score}%</span>
              </div>

              <div className="status-container">
                <span className="status-label">Status: </span>
                <span className={`status-badge ${job.status.toLowerCase()}`}>{job.status}</span>
                {job.status === "Pending" && (
                  <button className="status-btn" onClick={() => updateStatus(job.id, "Applied")}>Mark Applied ✅</button>
                )}
              </div>

              <div className="skills">
                <strong>Missing Skills:</strong>
                <ul>{job.missing_skills && job.missing_skills.map((skill, i) => (<li key={i}>{skill}</li>))}</ul>
              </div>

              <p className="rec"><strong>AI Advice:</strong> {job.recommendation}</p>
              <a href={job.link} target="_blank" rel="noreferrer" className="apply-link">View Job</a>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;