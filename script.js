const GEMINI_API_KEY = "AIzaSyB_qgiVD_6wXZiIIc6OYbTmOulhXMDT6xs"; // Replace with your API Key
const USE_MOCK_AI = true; // Set to false to use actual API

// Radar Chart Instance
let radarChart;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize with default values
    updateAllInputs();
});

// Update number input when range slider moves
function updateNumberInput(id) {
    const value = document.getElementById(id).value;
    document.getElementById(`${id}-value`).value = value;
}

// Update range slider when number input changes
function updateRangeInput(id) {
    const value = document.getElementById(`${id}-value`).value;
    document.getElementById(id).value = value;
}

// Update all inputs (used for presets)
function updateAllInputs() {
    const inputs = ['traffic', 'login', 'process', 'ip', 'files'];
    inputs.forEach(id => updateNumberInput(id));
}

// Load preset configurations
function loadPreset(presetName) {
    let presets = {
        normal: {
            traffic: 0.05,
            login: 0.02,
            process: 0.03,
            ip: 0.01,
            files: 0.02
        },
        bruteforce: {
            traffic: 0.3,
            login: 0.9,
            process: 0.15,
            ip: 0.65,
            files: 0.05
        },
        malware: {
            traffic: 0.45,
            login: 0.2,
            process: 0.85,
            ip: 0.7,
            files: 0.8
        },
        ddos: {
            traffic: 0.95,
            login: 0.1,
            process: 0.25,
            ip: 0.8,
            files: 0.1
        }
    };
    
    const preset = presets[presetName];
    if (preset) {
        Object.keys(preset).forEach(key => {
            document.getElementById(key).value = preset[key];
            document.getElementById(`${key}-value`).value = preset[key];
        });
    }
}

// Calculate the threat score
function calculateThreat() {
    // Show loading indicator
    document.getElementById("loading").style.display = "block";
    document.getElementById("results-section").style.display = "none";
    
    // Get values from form
    let traffic = parseFloat(document.getElementById("traffic").value) || 0;
    let login = parseFloat(document.getElementById("login").value) || 0;
    let process = parseFloat(document.getElementById("process").value) || 0;
    let ip = parseFloat(document.getElementById("ip").value) || 0;
    let files = parseFloat(document.getElementById("files").value) || 0;
    
    // Weights for parameters (configurable)
    let weights = {
        traffic: 0.25,
        login: 0.2,
        process: 0.2,
        ip: 0.2,
        files: 0.15
    };
    
    // Cybersecurity Threat Score (CTS) Calculation
    let CTS = (weights.traffic * traffic) + 
              (weights.login * login) + 
              (weights.process * process) + 
              (weights.ip * ip) + 
              (weights.files * files);
    
    CTS = Math.round(CTS * 100) / 100; // Round to 2 decimal places
    
    // Determine risk level
    let riskLevel;
    if (CTS > 0.7) {
        riskLevel = "High";
    } else if (CTS > 0.4) {
        riskLevel = "Moderate";
    } else {
        riskLevel = "Low";
    }
    
    // Update the result display
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `Threat Score: ${CTS} (${riskLevel} Risk)`;
    resultDiv.className = `threat-score ${riskLevel.toLowerCase()}`;
    
    // Create or update the radar chart
    createRadarChart(traffic, login, process, ip, files);
    
    // Send to AI for analysis
    analyzeWithAI(CTS, traffic, login, process, ip, files, riskLevel)
        .then(() => {
            // Hide loading indicator, show results
            document.getElementById("loading").style.display = "none";
            document.getElementById("results-section").style.display = "block";
        })
        .catch(error => {
            console.error("Error during AI analysis:", error);
            document.getElementById("loading").style.display = "none";
            document.getElementById("results-section").style.display = "block";
            document.getElementById("aiAnalysis").innerHTML = 
                `<h3>AI Analysis Error</h3>
                <p>Could not complete the AI analysis. Please try again or check your API key.</p>`;
        });
}

// Generate radar chart visualization
function createRadarChart(traffic, login, process, ip, files) {
    const ctx = document.getElementById('radarChart').getContext('2d');
    
    // Destroy previous chart instance if it exists
    if (radarChart) {
        radarChart.destroy();
    }
    
    // Create new chart
    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: [
                'Traffic Volume Anomaly',
                'Failed Login Attempts',
                'Unusual Process Execution',
                'IP Reputation Score',
                'File System Changes'
            ],
            datasets: [{
                label: 'Threat Parameters',
                data: [traffic, login, process, ip, files],
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                borderColor: 'rgba(37, 99, 235, 1)',
                pointBackgroundColor: 'rgba(37, 99, 235, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(37, 99, 235, 1)'
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 1
                }
            }
        }
    });
}

// Function to analyze threat data with AI
async function analyzeWithAI(CTS, traffic, login, process, ip, files, riskLevel) {
    // If mock mode is enabled, return predefined responses instead of calling API
    if (USE_MOCK_AI) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let analysisText;
                
                if (riskLevel === "Low") {
                    analysisText = `
                        <h3>AI Analysis: Low Risk</h3>
                        <p>The system is currently experiencing normal activity patterns. The detected metrics are within expected baseline ranges.</p>
                        <h4>Observations:</h4>
                        <ul>
                            <li>Network traffic shows minimal anomalies</li>
                            <li>Login attempt failures are within normal threshold</li>
                            <li>Process execution follows expected patterns</li>
                            <li>IP sources have good reputation scores</li>
                            <li>File system modifications are routine</li>
                        </ul>
                        <h4>Recommended Actions:</h4>
                        <ul>
                            <li>Continue regular monitoring</li>
                            <li>No immediate action required</li>
                            <li>Consider this a baseline for future comparisons</li>
                        </ul>
                    `;
                } else if (riskLevel === "Moderate") {
                    analysisText = `
                        <h3>AI Analysis: Moderate Risk</h3>
                        <p>The system is showing some concerning patterns that warrant investigation. Several metrics are elevated above baseline.</p>
                        <h4>Potential Threats:</h4>
                        <ul>
                            <li>${traffic > 0.6 ? '<strong>High traffic anomaly</strong> suggests possible DoS activity or data exfiltration' : ''}</li>
                            <li>${login > 0.6 ? '<strong>Elevated failed logins</strong> may indicate password guessing or credential stuffing' : ''}</li>
                            <li>${process > 0.6 ? '<strong>Unusual processes</strong> could signal malware activity or unauthorized access' : ''}</li>
                            <li>${ip > 0.6 ? '<strong>Suspicious IP addresses</strong> with known malicious history detected' : ''}</li>
                            <li>${files > 0.6 ? '<strong>Abnormal file system activity</strong> suggests possible data manipulation' : ''}</li>
                        </ul>
                        <h4>Recommended Actions:</h4>
                        <ul>
                            <li>Investigate the elevated parameters highlighted above</li>
                            <li>Enable enhanced logging for affected systems</li>
                            <li>Consider implementing additional authentication factors</li>
                            <li>Review recent system changes and updates</li>
                            <li>Prepare incident response plan as precaution</li>
                        </ul>
                    `;
                } else {
                    analysisText = `
                        <h3>AI Analysis: High Risk - Immediate Action Required</h3>
                        <p>The system is exhibiting patterns consistent with an active security incident. Multiple high-severity indicators have been detected.</p>
                        <h4>Detected Threats:</h4>
                        <ul>
                            <li>${traffic > 0.7 ? '<strong>Critical traffic anomaly</strong> indicating probable data exfiltration or DDoS attack in progress' : ''}</li>
                            <li>${login > 0.7 ? '<strong>Massive authentication failures</strong> show brute force or credential stuffing attack' : ''}</li>
                            <li>${process > 0.7 ? '<strong>Highly suspicious process execution</strong> consistent with malware, ransomware, or rootkit activity' : ''}</li>
                            <li>${ip > 0.7 ? '<strong>Known malicious IP addresses</strong> actively communicating with internal systems' : ''}</li>
                            <li>${files > 0.7 ? '<strong>Critical file system modifications</strong> suggesting possible data encryption, corruption, or theft' : ''}</li>
                        </ul>
                        <h4>Required Immediate Actions:</h4>
                        <ul>
                            <li>Activate incident response protocol</li>
                            <li>Isolate affected systems from the network</li>
                            <li>Block suspicious IP addresses at the firewall</li>
                            <li>Perform memory dumps for forensic analysis</li>
                            <li>Initiate business continuity procedures</li>
                            <li>Notify security team leadership and prepare breach communication plan</li>
                        </ul>
                    `;
                }
                
                document.getElementById("aiAnalysis").innerHTML = analysisText;
                resolve();
            }, 1500); // Simulate API delay
        });
    }
    
    // Prepare the prompt for AI
    const prompt = `The system detected a cybersecurity threat score of ${CTS} (${riskLevel} risk).
    
Metrics:
- Traffic Volume Anomaly: ${traffic}
- Failed Login Attempts: ${login}
- Unusual Process Execution: ${process}
- IP Reputation Score: ${ip}
- File System Changes: ${files}

Based on these values, provide a detailed analysis of:
1. What specific threat vectors are most likely based on the pattern
2. What targeted vulnerabilities could be exploited
3. Prioritized immediate actions for the security team
4. Long-term security improvements recommended`;

    // Call Gemini API
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: { text: prompt }
            }),
        });
        
        const data = await response.json();
        const analysisText = data?.candidates?.[0]?.text || "No response from AI";
        
        // Format the response with HTML
        document.getElementById("aiAnalysis").innerHTML = `
            <h3>AI Analysis: ${riskLevel} Risk</h3>
            <div>${analysisText.replace(/\n/g, '<br>')}</div>
        `;
        
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}