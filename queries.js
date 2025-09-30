// queries.js - Run required MongoDB queries for Week 1 assignment
// Usage:
//   1) Install deps:  npm init -y && npm install mongodb dotenv
//   2) Set MONGODB_URI in .env file
//   3) Run: node queries.js

// Load environment variables
require('dotenv').config();

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'plp_bookstore';
const collectionName = 'books';

async function withClient(fn) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection(collectionName);
    return await fn({ client, db, col });
  } finally {
    await client.close();
  }
}

function header(title) {
  console.log('\n============================================================');
  console.log(title);
  console.log('============================================================');
}

async function basicCrud() {
  return withClient(async ({ col }) => {
    header('Task 2: Basic CRUD Operations');

    // Find all books in a specific genre
    header('Find all books in genre: "Fiction"');
    const fiction = await col.find({ genre: 'Fiction' }).toArray();
    console.log(fiction.map(b => `${b.title} (${b.genre})`).join('\n') || 'No results');

    // Find books published after a certain year
    header('Find books published after year: 1950');
    const after1950 = await col.find({ published_year: { $gt: 1950 } }).toArray();
    console.log(after1950.map(b => `${b.title} (${b.published_year})`).join('\n') || 'No results');

    // Find books by a specific author
    header('Find books by author: "George Orwell"');
    const orwell = await col.find({ author: 'George Orwell' }).toArray();
    console.log(orwell.map(b => `${b.title} by ${b.author}`).join('\n') || 'No results');

    // Update the price of a specific book
    header('Update price: set price=15.99 for title "1984"');
    const upd = await col.updateOne({ title: '1984' }, { $set: { price: 15.99 } });
    console.log(`Matched: ${upd.matchedCount}, Modified: ${upd.modifiedCount}`);
    const updated1984 = await col.findOne({ title: '1984' });
    console.log(updated1984 ? `New price for 1984: ${updated1984.price}` : '1984 not found');

    // Delete a book by its title
    header('Delete book by title: "Moby Dick"');
    const del = await col.deleteOne({ title: 'Moby Dick' });
    console.log(`Deleted: ${del.deletedCount}`);
  });
}

async function advancedQueries() {
  return withClient(async ({ col }) => {
    header('Task 3: Advanced Queries');

    // Books both in stock and published after 2010
    header('Books in stock and published after 2010');
    const stockAfter2010 = await col.find({ in_stock: true, published_year: { $gt: 2010 } }).toArray();
    console.log(stockAfter2010.map(b => `${b.title} (${b.published_year})`).join('\n') || 'No results');

    // Projection: return only title, author, price
    header('Projection: title, author, price (genre = Fiction)');
    const proj = await col.find({ genre: 'Fiction' }, { projection: { _id: 0, title: 1, author: 1, price: 1 } }).toArray();
    console.table(proj);

    // Sorting by price ascending
    header('Sort by price ASC');
    const asc = await col.find({}, { projection: { _id: 0, title: 1, price: 1 } }).sort({ price: 1 }).toArray();
    console.table(asc);

    // Sorting by price descending
    header('Sort by price DESC');
    const desc = await col.find({}, { projection: { _id: 0, title: 1, price: 1 } }).sort({ price: -1 }).toArray();
    console.table(desc);

    // Pagination: 5 books per page
    const pageSize = 5;
    for (let page = 1; page <= 2; page++) { // show first 2 pages
      header(`Pagination: page ${page} (size ${pageSize}) sorted by title`);
      const docs = await col.find({}, { projection: { _id: 0, title: 1 } })
        .sort({ title: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray();
      console.table(docs);
    }
  });
}

async function aggregationPipelines() {
  return withClient(async ({ col }) => {
    header('Task 4: Aggregation Pipelines');

    // Average price by genre
    header('Average price by genre');
    const avgByGenre = await col.aggregate([
      { $group: { _id: '$genre', avgPrice: { $avg: '$price' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    console.table(avgByGenre.map(x => ({ genre: x._id, avgPrice: Number(x.avgPrice.toFixed(2)), count: x.count })));

    // Author with the most books
    header('Author with the most books');
    const topAuthor = await col.aggregate([
      { $group: { _id: '$author', books: { $sum: 1 } } },
      { $sort: { books: -1, _id: 1 } },
      { $limit: 1 }
    ]).toArray();
    console.table(topAuthor.map(x => ({ author: x._id, books: x.books })));

    // Group by publication decade and count
    header('Books by publication decade');
    const byDecade = await col.aggregate([
      { $project: { decade: { $multiply: [{ $floor: { $divide: ['$published_year', 10] } }, 10] }, title: 1 } },
      { $group: { _id: '$decade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    console.table(byDecade.map(x => ({ decade: x._id, count: x.count })));
  });
}

async function indexingAndExplain() {
  return withClient(async ({ db, col }) => {
    header('Task 5: Indexing and explain()');

    // Reset indexes for demonstration
    header('Resetting indexes to demonstrate explain() before/after');
    try {
      await col.dropIndexes();
      console.log('Dropped existing indexes (if any)');
    } catch (e) {
      if (e.codeName === 'IndexNotFound') {
        console.log('No existing indexes to drop');
      } else {
        console.warn('dropIndexes warning:', e.message);
      }
    }

    // Title equality query explain BEFORE index
    header('Explain BEFORE index on title for query { title: "1984" }');
    let expNoIdx = await col.find({ title: '1984' }).explain('executionStats');
    console.log(JSON.stringify({
      winningPlan: expNoIdx.queryPlanner.winningPlan.stage || expNoIdx.queryPlanner.winningPlan.inputStage?.stage,
      totalDocsExamined: expNoIdx.executionStats.totalDocsExamined,
      totalKeysExamined: expNoIdx.executionStats.totalKeysExamined
    }, null, 2));

    // Create index on title
    header('Create index on title');
    const titleIdx = await col.createIndex({ title: 1 }, { name: 'idx_title' });
    console.log('Created index:', titleIdx);

    // Title equality query explain AFTER index
    header('Explain AFTER index on title for query { title: "1984" }');
    let expWithIdx = await col.find({ title: '1984' }).explain('executionStats');
    console.log(JSON.stringify({
      winningPlan: expWithIdx.queryPlanner.winningPlan.stage || expWithIdx.queryPlanner.winningPlan.inputStage?.stage,
      totalDocsExamined: expWithIdx.executionStats.totalDocsExamined,
      totalKeysExamined: expWithIdx.executionStats.totalKeysExamined
    }, null, 2));

    // Compound index author + published_year
    header('Create compound index on { author: 1, published_year: -1 }');
    const compoundIdx = await col.createIndex({ author: 1, published_year: -1 }, { name: 'idx_author_year' });
    console.log('Created index:', compoundIdx);

    // Explain a query that can use the compound index
    header('Explain for query { author: "J.R.R. Tolkien", published_year: { $gte: 1900 } }');
    let expCompound = await col.find({ author: 'J.R.R. Tolkien', published_year: { $gte: 1900 } }).sort({ published_year: -1 }).explain('executionStats');
    console.log(JSON.stringify({
      winningPlan: expCompound.queryPlanner.winningPlan.stage || expCompound.queryPlanner.winningPlan.inputStage?.stage,
      totalDocsExamined: expCompound.executionStats.totalDocsExamined,
      totalKeysExamined: expCompound.executionStats.totalKeysExamined
    }, null, 2));
  });
}

async function main() {
  header('Connecting to MongoDB');
  console.log(`URI: ${uri.replace(/:\/\/.*@/, '://***:***@')}`);

  // Run sections sequentially so the output is readable
  await basicCrud();
  await advancedQueries();
  await aggregationPipelines();
  await indexingAndExplain();

  header('All tasks completed');
}

main().catch(err => {
  console.error('Error in queries.js:', err);
  process.exitCode = 1;
});
