// scripts/clean_isbn.js
// Usage: ensure .env contains MONGODB_URI, then run: node scripts/clean_isbn.js

require('dotenv').config();
const mongoose = require('mongoose');

async function main(){
  const uri = process.env.MONGODB_URI;
  if(!uri){
    console.error('MONGODB_URI not set in .env or environment');
    process.exit(1);
  }

  console.log('Connecting to', uri);
  await mongoose.connect(uri, { dbName: 'booklib' });
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const books = db.collection('books');

  console.log('1) Unsetting empty or null isbn fields...');
  const r1 = await books.updateMany({ isbn: '' }, { $unset: { isbn: '' } });
  const r2 = await books.updateMany({ isbn: null }, { $unset: { isbn: '' } });
  console.log('Updated counts:', { emptyString: r1.modifiedCount, nulls: r2.modifiedCount });

  console.log('2) Checking duplicate non-empty isbns...');
  const dup = await books.aggregate([
    { $match: { isbn: { $exists: true, $ne: null, $ne: '' } } },
    { $group: { _id: '$isbn', count: { $sum: 1 }, docs: { $push: '$_id' } } },
    { $match: { count: { $gt: 1 } } }
  ]).toArray();

  if(dup.length === 0){
    console.log('No duplicate non-empty ISBNs found');
  } else {
    console.warn('Found duplicate ISBN entries (non-empty):');
    console.warn(JSON.stringify(dup, null, 2));
    console.warn('Please resolve duplicates manually before creating unique index.');
  }

  console.log('3) Attempting to drop existing isbn index (if exists)...');
  try{
    const idxs = await books.indexes();
    const isbnIndex = idxs.find(i => i.key && i.key.isbn === 1);
    if(isbnIndex){
      console.log('Existing index found:', isbnIndex.name, ' - dropping it now');
      await books.dropIndex(isbnIndex.name);
      console.log('Dropped index', isbnIndex.name);
    } else {
      console.log('No existing isbn index found');
    }
  } catch(e){
    console.warn('Error dropping index (continuing):', e.message);
  }

  console.log('4) Creating sparse unique index on isbn...');
  try{
    await books.createIndex({ isbn: 1 }, { unique: true, sparse: true });
    console.log('Created sparse unique index on isbn');
  } catch(e){
    console.error('Failed to create index:', e.message);
  }

  await mongoose.disconnect();
  console.log('Done. Disconnected.');
}

main().catch(err => {
  console.error('Error in clean_isbn script:', err);
  process.exit(1);
});
