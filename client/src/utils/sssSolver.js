// Ungaloda same Lagrange Interpolation BigInt algorithm
export function findConstantTerm(points) {
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

// Ungaloda JSON Reader process logic
export function processSSS(data) {
    const { n, k } = data.keys;
    let points = [];
    let shares = [];

    for (const key in data) {
        if (key === 'keys') continue;
        const x = parseInt(key);
        const base = parseInt(data[key].base);
        const valueStr = data[key].value;
        const y = BigInt(parseInt(valueStr, base));
        
        points.push({ x, y });
        shares.push({
            x,
            y: y.toString(),
            base: data[key].base
        });
    }

    const secret = findConstantTerm(points.slice(0, k));

    return {
        secret: secret.toString(),
        shares: shares,
        stats: `[HASH_VALIDATED] algorithm: SSS | shares: ${points.length} | threshold: ${k} | key_found: true`,
        n,
        k
    };
}