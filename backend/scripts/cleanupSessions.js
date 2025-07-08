const mongoose = require('mongoose');
require('dotenv').config();

const cleanupSessions = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Connected! Cleaning up sessions collection...');
    
    // Drop the sessions collection to clear any corrupt data
    const db = mongoose.connection.db;
    
    try {
      await db.collection('sessions').drop();
      console.log('✅ Sessions collection dropped successfully');
    } catch (error) {
      if (error.codeName === 'NamespaceNotFound') {
        console.log('ℹ️ Sessions collection does not exist (this is fine)');
      } else {
        console.log('❌ Error dropping sessions:', error.message);
      }
    }
    
    console.log('✅ Session cleanup completed');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    mongoose.connection.close();
  }
};

cleanupSessions();
