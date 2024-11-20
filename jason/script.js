function gamer() {
    const file = document.getElementById('input').files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = JSON.parse(e.target.result);
        const f = convert(data);
        download(f, 'output.csv');
    };
    reader.readAsText(file);
}

function convert(data) {
    const g = Array.isArray(data) ? data : [data];
    const r = g.map(item => Object.keys(g[0]).map(header => JSON.stringify(item[header] || '')).join(','));
    return [Object.keys(g[0]).join(','), ...r].join('\n');
}

function download(csvData, filename) {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
