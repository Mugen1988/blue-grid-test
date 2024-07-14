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
exports.transformData = transformData;
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const app = (0, express_1.default)();
const port = 3000;
const db = new better_sqlite3_1.default('data.db');
// Serve static files from the 'public' directory
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use((0, cors_1.default)());
// Recursive function to build the directory structure
function buildStructure(currentLevel, pathParts) {
    const part = pathParts.shift(); // Get the current part
    if (!part)
        return;
    // Check if we are at the last part
    if (pathParts.length === 0) {
        if (!currentLevel.includes(part)) {
            currentLevel.push(part);
        }
    }
    else {
        let nextLevel = currentLevel.find((entry) => typeof entry === 'object' && entry.hasOwnProperty(part));
        if (!nextLevel) {
            nextLevel = { [part]: [] };
            currentLevel.push(nextLevel);
        }
        buildStructure(nextLevel[part], pathParts);
    }
}
// Function to transform the data
function transformData(response) {
    const transformed = {};
    // Filter out URLs not ending with an extension
    const files = response.items.filter(({ fileUrl }) => {
        return fileUrl.match(/\.[^/.]+$/);
    });
    files.forEach((item) => {
        const url = new URL(item.fileUrl);
        const hostname = url.hostname;
        const pathname = decodeURI(url.pathname);
        // Split the path into parts
        const pathParts = pathname.split('/').filter(part => part);
        // Initialize the IP address entry if it doesn't exist
        if (!transformed[hostname]) {
            transformed[hostname] = [];
        }
        // Build the structure correctly
        buildStructure(transformed[hostname], pathParts);
    });
    return transformed;
}
// API endpoint to fetch and transform data
app.get('/api/files', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const apiResponse = yield axios_1.default.get('https://rest-test-eight.vercel.app/api/test');
        const data = apiResponse.data;
        const transformedData = transformData(data);
        res.json(transformedData);
    }
    catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: error.message });
    }
}));
// New API endpoint to fetch data from the database
app.get('/api/files', (req, res) => {
    try {
        const stmt = db.prepare('SELECT data FROM files'); // Use type assertion to bypass the error
        const start = Date.now();
        const rows = stmt.all(); // This should now work without TypeScript errors
        const duration = Date.now() - start;
        console.log(`Query executed in ${duration} ms`);
        // Parse the data and respond
        const data = rows.map((row) => JSON.parse(row.data));
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching database data:', error);
        res.status(500).json({ error: error.message });
    }
});
// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
