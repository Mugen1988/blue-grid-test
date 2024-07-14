"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const index_1 = require("./index"); // Adjust the import paths as necessary
const db = new better_sqlite3_1.default('data.db');
// Create table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL
  )
`);
// Function to fetch and store data
function fetchDataAndStore() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const apiResponse = yield axios_1.default.get('https://rest-test-eight.vercel.app/api/test');
            const data = apiResponse.data;
            const transformedData = (0, index_1.transformData)(data);
            // Clear existing data
            db.exec('DELETE FROM files');
            // Insert new data
            const stmt = db.prepare('INSERT INTO files (data) VALUES (?)');
            stmt.run(JSON.stringify(transformedData));
            console.log('Data fetched and stored successfully');
        }
        catch (error) {
            console.error('Error fetching data:', error.message);
        }
    });
}
// Initial fetch
fetchDataAndStore();
// Schedule the task to run every hour
setInterval(fetchDataAndStore, 3600000);
