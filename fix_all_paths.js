const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Convert absolute paths to relative paths based on depth
    // Instead of doing it manually, we can just replace absolute paths to root-relative paths for github pages? No, we need relative.
    
    const depth = filePath.split(path.sep).length - __dirname.split(path.sep).length - 1;
    let prefix = './';
    if (depth > 0) {
        prefix = '../'.repeat(depth);
    }
    
    // Wait, the deepest file is `SmartEstate/client/pages/about.html`
    // depth is 3. 
    // Actually, a simpler way is just to replace `href="/` with `href="../..` based on depth from the logical root.
    // Let's assume the "logical root" is wherever `index.html` is.
    // In `SmartEstate/client/index.html`, depth from client is 0. So `./`.
    // In `SmartEstate/client/pages/about.html`, depth from client is 1. So `../`.
    
    // We will find out if the file is an index.html or in a pages dir.
    const isRoot = path.basename(path.dirname(filePath)) !== 'pages';
    
    if (isRoot) {
        content = content.replace(/href="\//g, 'href="./');
        content = content.replace(/src="\//g, 'src="./');
        content = content.replace(/href="\.\/"/g, 'href="./index.html"');
    } else {
        content = content.replace(/href="\/assets\//g, 'href="../assets/');
        content = content.replace(/src="\/assets\//g, 'src="../assets/');
        
        content = content.replace(/href="\/pages\//g, 'href="./');
        content = content.replace(/src="\/pages\//g, 'src="./');
        
        content = content.replace(/href="\/"/g, 'href="../index.html"');
        content = content.replace(/src="\/"/g, 'src="../index.html"');
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
}

function walkSync(dir, filelist) {
    const files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                filelist = walkSync(path.join(dir, file), filelist);
            }
        } else {
            if (file.endsWith('.html')) {
                filelist.push(path.join(dir, file));
            }
        }
    });
    return filelist;
}

const htmlFiles = walkSync(__dirname);
htmlFiles.forEach(f => replaceInFile(f));
