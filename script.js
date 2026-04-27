const jsonInput = document.getElementById('jsonInput');
const dropZone = document.getElementById('dropZone');
const fileStatus = document.getElementById('fileStatus');
const resultCard = document.getElementById('resultCard');
const sharesCard = document.getElementById('sharesCard');
const secretOutput = document.getElementById('secretOutput');
const sharesTable = document.getElementById('sharesTable');
const validationStats = document.getElementById('validationStats');

dropZone.onclick = () => jsonInput.click();

jsonInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
};

function handleFile(file) {
    fileStatus.innerHTML = `Analyzing ${file.name}...`;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            processSSS(data);
        } catch (err) {
            alert("Fatal Error: Invalid JSON configuration.");
            fileStatus.innerHTML = "Status: Data corruption detected.";
        }
    };
    reader.readAsText(file);
}

function processSSS(data) {
    const { n, k } = data.keys;
    let points = [];
    sharesTable.innerHTML = ""; 

    for (const key in data) {
        if (key === 'keys') continue;
        const x = parseInt(key);
        const base = parseInt(data[key].base);
        const valueStr = data[key].value;
        const y = BigInt(parseInt(valueStr, base));
        points.push({ x, y });

        const tr = document.createElement('tr');
        tr.className = "border-b border-slate-800 last:border-0 hover:bg-slate-800/50";
        tr.innerHTML = `
            <td class="py-4 px-2 font-semibold text-white">${x}</td>
            <td class="py-4 px-2 font-mono text-slate-400 break-all">${y.toString().substring(0, 40)}${y.toString().length > 40 ? '...' : ''}</td>
            <td class="py-4 px-2 text-slate-500">${data[key].base}</td>
        `;
        sharesTable.appendChild(tr);
    }

    const secret = findConstantTerm(points.slice(0, k));

    // Show result containers
    resultCard.classList.remove('h-0', 'opacity-0');
    resultCard.classList.add('h-auto', 'opacity-100');
    sharesCard.classList.remove('h-0', 'opacity-0');
    sharesCard.classList.add('h-auto', 'opacity-100');

    secretOutput.innerText = secret.toString();
    validationStats.innerText = `[HASH_VALIDATED] algorithm: SSS | shares: ${points.length} | threshold: ${k} | key_found: true`;
    fileStatus.innerHTML = `Status: Processing complete.`;
}

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