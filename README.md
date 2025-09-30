# MongoDB Fundamentals - Week 1

## Setup Instructions

Before you begin this assignment, please make sure you have the following installed:

1. **MongoDB Community Edition** - [Installation Guide](https://www.mongodb.com/docs/manual/administration/install-community/)
2. **MongoDB Shell (mongosh)** - This is included with MongoDB Community Edition
3. **Node.js** - [Download here](https://nodejs.org/)

### Node.js Package Setup

Once you have Node.js installed, run the following commands in your assignment directory:

```bash
# Initialize a package.json file
npm init -y

# Install the MongoDB Node.js driver
npm install mongodb
```

## Assignment Overview

This week focuses on MongoDB fundamentals including:
- CRUD operations (Create, Read, Update, Delete)
- MongoDB queries and filters
- Aggregation pipelines
- Indexing for performance

## How to Run the Scripts

Both scripts default to a local MongoDB instance at `mongodb://localhost:27017`. To run against MongoDB Atlas, set the `MONGODB_URI` environment variable.

### 1) Populate data: `insert_books.js`

# Local MongoDB
node insert_books.js

# MongoDB Atlas
set MONGODB_URI="your_atlas_connection_string" && node insert_books.js   # Windows PowerShell/CMD
```

This script creates the `plp_bookstore` database and the `books` collection, then inserts sample documents. If the collection already exists, it will be dropped and recreated to ensure consistent results.

### 2) Run required queries: `queries.js`

```bash
# Local MongoDB
node queries.js

# MongoDB Atlas
set MONGODB_URI="your_atlas_connection_string" && node queries.js   # Windows PowerShell/CMD
```

What it covers:
- Basic CRUD (find by genre/author/year, update price, delete by title)
- Advanced queries (filter + projection + sorting + pagination)
- Aggregation pipelines (avg price by genre, top author, group by decade)
- Indexing with `explain()` before/after (title index and compound index)

Tip: You can also run queries manually in `mongosh` or MongoDB Compass against the same `plp_bookstore.books` collection.

## Submission

Complete all the exercises in this assignment and push your code to GitHub using the provided GitHub Classroom link.

## Getting Started

1. Accept the GitHub Classroom assignment invitation
2. Clone your personal repository that was created by GitHub Classroom
3. Install MongoDB locally or set up a MongoDB Atlas account
4. Run the provided `insert_books.js` script to populate your database
5. Complete the tasks in the assignment document

## Files Included

- `Week1-Assignment.md`: Detailed assignment instructions
- `insert_books.js`: Script to populate your MongoDB database with sample book data
- `queries.js`: Script that runs all required queries, aggregations, and indexing

## Requirements

- Node.js (v18 or higher)
- MongoDB (local installation or Atlas account)
- MongoDB Shell (mongosh) or MongoDB Compass

## Troubleshooting

If you see `Error: Cannot find module 'mongodb'`, follow `SETUP_INSTRUCTIONS.md` or run:

```bash
npm init -y
npm install mongodb
```

Ensure your MongoDB server is running and the connection string is correct.

## Submission Checklist

- `insert_books.js` present and runnable
- `queries.js` present and runnable
- `README.md` explains how to run scripts (local and Atlas)
- Screenshot of MongoDB Compass or Atlas showing `plp_bookstore.books` with sample data
- Commit and push all files to your GitHub Classroom repository

## Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB University](https://university.mongodb.com/)
- [MongoDB Node.js Driver](https://mongodb.github.io/node-mongodb-native/)