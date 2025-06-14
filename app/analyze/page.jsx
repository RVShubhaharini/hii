'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AnalyzePage() {
  const [jobDescription, setJobDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [topN, setTopN] = useState(3);
  const router = useRouter();

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobDescription || files.length === 0 || !topN) {
      alert("Please fill all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("job_description", jobDescription);
    formData.append("top_n", topN);
    for (let i = 0; i < files.length; i++) {
      formData.append("resumes", files[i]);
    }

    try {
      const res = await axios.post("http://localhost:5000/shortlist", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      sessionStorage.setItem("shortlistData", JSON.stringify(res.data.resumes));
      router.push("/results");
    } catch (error) {
      console.error("Error during shortlisting:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>AI RESUME SHORTLISTER</h1>
      <button
  onClick={() => router.push('/')}
  style={{
    alignSelf: 'flex-start',
    marginBottom: '20px',
    padding: '10px 20px',
    backgroundColor: '#555',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  }}
>
  ← Back to Home
</button>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>Job Description:</label>
        <textarea
          style={styles.textarea}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Enter job description here..."
          rows={6}
        />

        <label style={styles.label}>Upload Resumes:</label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          style={styles.fileInput}
        />
        <p style={styles.fileCount}>
          {files.length > 0 ? `${files.length} file(s) selected` : 'No files selected'}
        </p>

        <label style={styles.label}>Shortlist Top N:</label>
        <input
          type="number"
          value={topN}
          onChange={(e) => setTopN(e.target.value)}
          min="1"
          max="10"
          style={styles.numberInput}
        />

        <button type="submit" style={styles.button}>Shortlist</button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  title: {
    textTransform: "uppercase",
    textAlign: "center",
    fontSize: "32px",
    fontWeight: "900",
    marginBottom: "30px",
    color: "#111111",
    letterSpacing: "1px",
  },
  form: {
    backgroundColor: "#fefefe",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "600px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  label: {
    fontWeight: "600",
    fontSize: "16px",
    color: "#222",
  },
  textarea: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    color: "#111",
    backgroundColor: "#fff",
    outlineColor: "#0070f3",
    width: "100%",
    boxSizing: "border-box",
  },
  fileInput: {
    padding: "8px",
    fontSize: "14px",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "6px",
    color: "#111",
    outlineColor: "#0070f3",
  },
  fileCount: {
    fontSize: "14px",
    color: "#333",
    marginTop: "-10px",
  },
  numberInput: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    color: "#111",
    outlineColor: "#0070f3",
    boxSizing: "border-box",
    width: "100%",
  },
  button: {
    marginTop: "10px",
    padding: "14px",
    fontSize: "16px",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  }
};
