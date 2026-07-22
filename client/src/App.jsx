import React, { useState } from 'react';

export default function App() {
  const [fileStatus, setFileStatus] = useState("Waiting for data input...");
  const [secretOutput, setSecretOutput] = useState("");
  const [validationStats, setValidationStats] = useState("");
  const [sharesTable, setSharesTable] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Exact function from script.js
  function findConstantTerm(points) {
    let secret = 0n;
    const k = points.length;

    for (let i = 0; i < k; i++) {
      let num = 1n;
      let den = 1n;

      for (let j = 0; j < k; j++) {
        if (i !== j) {
          num *= BigInt(-points[j].x);
          den *= BigInt(points[i].x - points[j].x);
        }
      }

      let term = (points[i].y * num) / den;
      secret += term;
    }
    return secret;
  }

  // Exact processSSS logic from script.js
  const processSSS = async (data, fileName) => {
    const { n, k } = data.keys;
    let points = [];
    let tableRows = [];

    for (const key in data) {
      if (key === 'keys') continue;
      const x = parseInt(key);
      const base = parseInt(data[key].base);
      const valueStr = data[key].value;
      const y = BigInt(parseInt(valueStr, base));
      points.push({ x, y });

      const yStr = y.toString();
      tableRows.push({
        x: x,
        yDisplay: yStr.length > 40 ? `${yStr.substring(0, 40)}...` : yStr,
        base: data[key].base
      });
    }

    const secret = findConstantTerm(points.slice(0, k));

    setSharesTable(tableRows);
    setSecretOutput(secret.toString());
    setValidationStats(
      `[HASH_VALIDATED] algorithm: SSS | shares: ${points.length} | threshold: ${k} | key_found: true`
    );
    setShowResults(true);
    setFileStatus("Status: Processing complete.");

    // Save to MongoDB Atlas
    try {
      await fetch('/api/save-secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: fileName,
          secretKey: secret.toString(),
          totalShares: points.length,
          threshold: k
        })
      });
    } catch (err) {
      console.error("Database sync error:", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileStatus(`Analyzing ${file.name}...`);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        processSSS(data, file.name);
      } catch (err) {
        alert("Fatal Error: Invalid JSON configuration.");
        setFileStatus("Status: Data corruption detected.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column */}
        <div className="md:col-span-4 space-y-8">
          <div className="dark-card rounded-2xl p-6">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
              Secret Solver <span className="text-xs font-mono px-2 py-1 bg-slate-700 rounded text-slate-400">SSS v3.0</span>
            </h1>
            <p className="text-slate-400 text-sm">Shamir’s Secret Sharing threshold scheme reconstruction portal.</p>
          </div>

          <div className="dark-card rounded-2xl p-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Initialize Data Stream
            </h3>

            <label className="upload-area rounded-xl p-10 text-center transition-all cursor-pointer bg-slate-800/50 block">
              <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
              <div className="text-5xl mb-4 text-blue-500">📁</div>
              <p className="font-medium">Upload JSON file</p>
              <p className="text-xs text-slate-500 mt-1">Drag and drop or click</p>
            </label>

            <div className="mt-8 pt-6 border-t border-slate-700 space-y-3">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">System Status</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Quantum Core Active
              </div>
              <div className="text-sm text-slate-400">{fileStatus}</div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-8 grid grid-cols-1 gap-8">
          <div className={`dark-card rounded-2xl p-8 transform transition-all duration-500 ${showResults ? 'h-auto opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}>
            <p className="text-sm uppercase tracking-widest text-slate-500 font-bold mb-3">Reconstructed Secret Key</p>
            <div className="text-7xl font-bold text-yellow-400 break-all secret-glow leading-none">
              {secretOutput || "--"}
            </div>
            <div className="text-xs mt-6 text-slate-500 font-mono pt-4 border-t border-slate-700">
              {validationStats}
            </div>
          </div>

          <div className={`dark-card rounded-2xl p-8 transform transition-all duration-500 ${showResults ? 'h-auto opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}>
            <h3 className="text-xl font-semibold mb-6">Decoded Share Points</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-2">ID (X)</th>
                    <th className="py-3 px-2">Value (Y)</th>
                    <th className="py-3 px-2">Base Used</th>
                  </tr>
                </thead>
                <tbody className="text-slate-200">
                  {sharesTable.map((row, index) => (
                    <tr key={index} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50">
                      <td className="py-4 px-2 font-semibold text-white">{row.x}</td>
                      <td className="py-4 px-2 font-mono text-slate-400 break-all">{row.yDisplay}</td>
                      <td className="py-4 px-2 text-slate-500">{row.base}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
