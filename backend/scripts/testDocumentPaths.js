const path = require('path');
const fs = require('fs');
require('dotenv').config();

const testPaths = () => {
  console.log('📂 Testing document file paths...\n');
  
  const documentPath = 'documents/sample-business-registration.pdf';
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  
  const possiblePaths = [
    path.join(uploadsDir, documentPath),
    path.join(__dirname, '..', documentPath),
    path.join(__dirname, '..', 'uploads', documentPath),
    documentPath
  ];

  console.log('Stored path:', documentPath);
  console.log('\nChecking possible locations:\n');

  possiblePaths.forEach((testPath, index) => {
    const exists = fs.existsSync(testPath);
    console.log(`${index + 1}. ${exists ? '✅' : '❌'} ${testPath}`);
    
    if (exists) {
      const stats = fs.statSync(testPath);
      console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
    }
  });

  // Check uploads directory structure
  console.log('\n📁 Uploads directory structure:');
  console.log('Base dir:', uploadsDir);
  
  if (fs.existsSync(uploadsDir)) {
    console.log('✅ Uploads directory exists');
    
    const documentsDir = path.join(uploadsDir, 'documents');
    if (fs.existsSync(documentsDir)) {
      console.log('✅ Documents subdirectory exists');
      
      const files = fs.readdirSync(documentsDir);
      console.log(`\nFiles in documents/ (${files.length}):`);
      files.slice(0, 10).forEach(file => {
        console.log(`  - ${file}`);
      });
    } else {
      console.log('❌ Documents subdirectory does NOT exist');
    }
  } else {
    console.log('❌ Uploads directory does NOT exist');
  }
};

testPaths();