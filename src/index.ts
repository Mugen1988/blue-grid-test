import express from 'express';
import betterSqlite3 from 'better-sqlite3';
import axios, { AxiosResponse } from 'axios';

const app = express();
const port = 3000;

const db = new betterSqlite3('files.db');

// Initialize the database with correct schema
db.exec('CREATE TABLE IF NOT EXISTS files (ip TEXT, data TEXT)');

// Fetch and store data periodically
async function fetchDataAndStore() {
  try {
    const apiResponse: AxiosResponse<any> = await axios.get('https://rest-test-eight.vercel.app/api/test');
    const data = apiResponse.data;

    // Transform and store data
    const transformedData = Object.entries(data).flatMap(([ip, items]) => {
      return items.map(item => ({ ip, item }));
    });

    // Clear existing data
    db.exec('DELETE FROM files');

    // Insert new data
    const stmt = db.prepare('INSERT INTO files (ip, data) VALUES (?, ?)');
    for (const { ip, item } of transformedData) {
      stmt.run(ip, JSON.stringify(item));
    }

  } catch (error: any) {
    console.error('Error fetching data:', error.message);
  }
}

// Periodically fetch and store data
setInterval(fetchDataAndStore, 24 * 60 * 60 * 1000); // Once a day

// Initial fetch and store
fetchDataAndStore();

app.get('/api/files', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  // Query to fetch paginated data
  const stmt = db.prepare('SELECT ip, data FROM files LIMIT ? OFFSET ?');
  const rows = stmt.all(limit, offset);
  const items = rows.map((row: any) => ({ ip: row.ip, item: JSON.parse(row.data) }));

  // Query to get total count
  const totalStmt = db.prepare('SELECT COUNT(*) as count FROM files');
  const totalRows = totalStmt.get().count;
  const totalPages = Math.ceil(totalRows / limit);

  res.json({
    items,
    totalPages,
    currentPage: page
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
