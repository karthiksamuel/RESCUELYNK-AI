const fs = require('fs');
const path = require('path');

function processDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('backdrop-blur-3xl')) {
                content = content.replace(/backdrop-blur-3xl/g, 'backdrop-blur-xl');
                content = content.replace(/blur-\[120px\]/g, 'blur-3xl');
                fs.writeFileSync(fullPath, content);
                console.log('Fixed', fullPath);
            }
        }
    });
}

processDir(path.join(__dirname, 'src'));
