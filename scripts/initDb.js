// scripts/initDb.js
import { runMigration } from '../lib/db-utils'; // Adjust path
import { SCHEMA } from '../migrations/schema';

(async () => {
  await runMigration(SCHEME); // Typo in plan, should be SCHEMA
  console.log('Schema applied');
})(); 