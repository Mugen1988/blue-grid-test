import axios, { AxiosResponse } from 'axios';
import betterSqlite3 from 'better-sqlite3';

const db = new betterSqlite3('files.db');

// Initialize the database with correct schema
db.exec('CREATE TABLE IF NOT EXISTS files (ip TEXT, data TEXT)');

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

// Initial fetch and store
fetchDataAndStore();
