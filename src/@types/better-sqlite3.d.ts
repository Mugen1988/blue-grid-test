declare module 'better-sqlite3' {
    class Database {
      constructor(filePath: string);
      exec(sql: string): void;
      prepare(sql: string): { run(params?: any): void };
    }
    export default Database;
  }