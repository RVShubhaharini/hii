'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Chart from 'chart.js/auto';

let scoreChartInstance = null;
let lineChartInstance = null;

export default function ResultsPage() {
  const [resumes, setResumes] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const data = sessionStorage.getItem("shortlistData");
    if (data) {
      const parsed = JSON.parse(data);
      setResumes(parsed);
      setTimeout(() => {
        drawScoreChart(parsed);
        drawLineChart(parsed);
      }, 100); // Give time for canvas to be in DOM
    }
  }, []);

  const handleDownload = async () => {
    const response = await fetch("http://localhost:5000/download_top_n", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumes }),
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "shortlisted_resumes.zip";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const drawScoreChart = (resumes) => {
    const ctx = document.getElementById('scoreChart')?.getContext('2d');
    if (!ctx) return;

    const labels = resumes.map(r => r.filename);
    const scores = resumes.map(r => r.final_score);

    if (scoreChartInstance) scoreChartInstance.destroy();

    scoreChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Final Score',
          data: scores,
          backgroundColor: '#4a90e2',
          borderRadius: 8,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, max: 100 }
        }
      }
    });
  };

  const drawLineChart = (resumes) => {
    const ctx = document.getElementById('lineChart')?.getContext('2d');
    if (!ctx) return;

    const labels = resumes.map(r => r.filename);
    const analyst = resumes.map(r => r.scores.analyst);
    const skills = resumes.map(r => r.scores.skills);
    const education = resumes.map(r => r.scores.education);
    const hr = resumes.map(r => r.scores.hr);
    const final = resumes.map(r => r.final_score);

    if (lineChartInstance) lineChartInstance.destroy();

    lineChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Analyst',
            data: analyst,
            borderColor: '#00bfff',
            backgroundColor: 'rgba(0,191,255,0.1)',
            tension: 0.3,
            fill: false
          },
          {
            label: 'Skills',
            data: skills,
            borderColor: '#ff6384',
            backgroundColor: 'rgba(255,99,132,0.1)',
            tension: 0.3,
            fill: false
          },
          {
            label: 'Education',
            data: education,
            borderColor: '#36a2eb',
            backgroundColor: 'rgba(54,162,235,0.1)',
            tension: 0.3,
            fill: false
          },
          {
            label: 'HR',
            data: hr,
            borderColor: '#ffce56',
            backgroundColor: 'rgba(255,206,86,0.1)',
            tension: 0.3,
            fill: false
          },
          {
            label: 'Final Score',
            data: final,
            borderColor: '#2ecc71',
            backgroundColor: 'rgba(46,204,113,0.1)',
            borderDash: [5, 5],
            tension: 0.3,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: 'Agent Scores and Final Score Comparison' }
        },
        scales: {
          y: { beginAtZero: true, max: 100 }
        }
      }
    });
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Segoe UI, sans-serif", backgroundColor: "#fff", color: "#222" }}>
      <button
        onClick={() => router.push("/analyze")}
        style={{
          marginBottom: "20px",
          padding: "10px 20px",
          backgroundColor: "#333",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        ← Back
      </button>

      <h1 style={{ fontSize: "32px", marginBottom: "20px", color: "#0070f3" }}>
        AI Resume Shortlister - Results
      </h1>

      {resumes.length > 0 ? (
        <>
          <p>
            Showing top <strong>{resumes.length}</strong> resumes.
          </p>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "20px",
              backgroundColor: "#f2f2f2",
              color: "#000"
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#0070f3", color: "#fff" }}>
                <th style={cellStyle}>Filename</th>
                <th style={cellStyle}>Final Score</th>
                <th style={cellStyle}>Analyst</th>
                <th style={cellStyle}>Skills</th>
                <th style={cellStyle}>Education</th>
                <th style={cellStyle}>HR</th>
                <th style={cellStyle}>Feedback Summary</th>
              </tr>
            </thead>
            <tbody>
              {resumes.map((res, idx) => (
                <tr key={idx}>
                  <td style={cellStyle}>{res.filename}</td>
                  <td style={cellStyle}>{res.final_score}</td>
                  <td style={cellStyle}>{res.scores.analyst}</td>
                  <td style={cellStyle}>{res.scores.skills}</td>
                  <td style={cellStyle}>{res.scores.education}</td>
                  <td style={cellStyle}>{res.scores.hr}</td>
                  <td style={{ ...cellStyle, whiteSpace: "pre-wrap", color: "#111" }}>
                    {res.feedback ? res.feedback.split("- LLM feedback summary:")[1]?.trim() || res.feedback : "No feedback"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={handleDownload}
            style={{
              marginTop: "30px",
              padding: "12px 24px",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold"
            }}
          >
            Download Top {resumes.length}
          </button>

          <div style={{ marginTop: "40px" }}>
            <h2 style={{ color: "#0070f3" }}>Final Score Comparison</h2>
            <canvas id="scoreChart" height="100"></canvas>
          </div>

          <div style={{ marginTop: "40px" }}>
            <h2 style={{ color: "#0070f3" }}>Agent-wise Score Analysis</h2>
            <canvas id="lineChart" height="100"></canvas>
          </div>
        </>
      ) : (
        <p>No resumes were shortlisted.</p>
      )}
    </div>
  );
}

const cellStyle = {
  padding: "12px",
  border: "1px solid #ccc",
  textAlign: "left",
  verticalAlign: "top",
  backgroundColor: "#fff",
  color: "#111"
};
