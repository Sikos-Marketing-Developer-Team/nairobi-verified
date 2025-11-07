// backend/scripts/copyDatabase.js
const mongoose = require('mongoose');
require('dotenv').config();

// Source and target connection strings
const SOURCE_URI = 'mongodb+srv://judekimathii:Kamundis@nairobiverified.mvbwr.mongodb.net/';
const TARGET_URI = 'mongodb+srv://donellkioko2001_db_user:Apty1234@cluster0.mz66cyd.mongodb.net/';

// Create separate connections
const sourceConnection = mongoose.createConnection(SOURCE_URI);
const targetConnection = mongoose.createConnection(TARGET_URI);

const copyDatabase = async () => {
  try {
    console.log('🔄 Starting database copy process...\n');

    // Wait for both connections
    await Promise.all([
      new Promise((resolve, reject) => {
        sourceConnection.once('open', resolve);
        sourceConnection.once('error', reject);
      }),
      new Promise((resolve, reject) => {
        targetConnection.once('open', resolve);
        targetConnection.once('error', reject);
      })
    ]);

    console.log('✅ Connected to source database');
    console.log('✅ Connected to target database\n');

    // Get all collection names from source
    const collections = await sourceConnection.db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections to copy:\n`);
    
    collections.forEach(col => console.log(`  - ${col.name}`));
    console.log('');

    let totalDocsCopied = 0;
    const summary = [];

    // Copy each collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`\n${'─'.repeat(60)}`);
      console.log(`📁 Processing collection: ${collectionName}`);

      try {
        // Get source collection
        const sourceCollection = sourceConnection.db.collection(collectionName);
        
        // Count documents
        const count = await sourceCollection.countDocuments();
        console.log(`  📊 Documents found: ${count}`);

        if (count === 0) {
          console.log('  ⏭️  Skipping empty collection');
          summary.push({ collection: collectionName, count: 0, status: 'skipped' });
          continue;
        }

        // Get all documents
        const documents = await sourceCollection.find({}).toArray();
        
        // Get target collection
        const targetCollection = targetConnection.db.collection(collectionName);

        // Clear target collection first (optional - remove if you want to merge)
        await targetCollection.deleteMany({});
        console.log('  🗑️  Cleared target collection');

        // Insert documents into target
        if (documents.length > 0) {
          await targetCollection.insertMany(documents, { ordered: false });
          console.log(`  ✅ Copied ${documents.length} documents`);
          totalDocsCopied += documents.length;
          summary.push({ collection: collectionName, count: documents.length, status: 'success' });
        }

        // Copy indexes
        const indexes = await sourceCollection.indexes();
        console.log(`  🔍 Copying ${indexes.length} indexes...`);
        
        for (const index of indexes) {
          // Skip the default _id index
          if (index.name === '_id_') continue;
          
          try {
            const key = index.key;
            const options = { ...index };
            delete options.key;
            delete options.v;
            delete options.ns;
            
            await targetCollection.createIndex(key, options);
            console.log(`    ✅ Created index: ${index.name}`);
          } catch (err) {
            console.log(`    ⚠️  Index ${index.name} may already exist`);
          }
        }

      } catch (error) {
        console.error(`  ❌ Error copying ${collectionName}:`, error.message);
        summary.push({ collection: collectionName, count: 0, status: 'error', error: error.message });
      }
    }

    // Print summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 COPY SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total collections: ${collections.length}`);
    console.log(`Total documents copied: ${totalDocsCopied}\n`);
    
    console.log('Collection Details:');
    summary.forEach(item => {
      const status = item.status === 'success' ? '✅' : 
                     item.status === 'skipped' ? '⏭️' : '❌';
      console.log(`  ${status} ${item.collection}: ${item.count} docs ${item.status}`);
    });
    console.log('='.repeat(60));

    // Verify copy
    console.log('\n🔍 Verifying copy...');
    const sourceCount = await sourceConnection.db.stats();
    const targetCount = await targetConnection.db.stats();
    
    console.log(`\nSource database: ${sourceCount.collections} collections, ${sourceCount.objects} documents`);
    console.log(`Target database: ${targetCount.collections} collections, ${targetCount.objects} documents`);

    if (sourceCount.objects === targetCount.objects) {
      console.log('\n✅ Verification passed! All documents copied successfully.');
    } else {
      console.log('\n⚠️  Document counts differ. Please verify manually.');
    }

  } catch (error) {
    console.error('❌ Copy failed:', error);
    console.error(error.stack);
  } finally {
    await sourceConnection.close();
    await targetConnection.close();
    console.log('\n✅ Database connections closed');
  }
};

// Run copy
copyDatabase();