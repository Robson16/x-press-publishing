const sqlite = require('sqlite3').verbose();

const db = new sqlite.Database('./database.sqlite');

db.run(`
  CREATE TABLE IF NOT EXISTS Artist (
    id INTEGER NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    biography TEXT NOT NULL,
    is_currently_employed INTEGER NOT NULL DEFAULT 1
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS Series (  
    id INTEGER NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS Issue (
    id INTEGER NOT NULL PRIMARY KEY,
    artist_id INTEGER NOT NULL,
    series_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    issue_number INTEGER NOT NULL,
    publication_date TEXT NOT NULL,
    FOREIGN KEY (artist_id) REFERENCES Artist (id),
    FOREIGN KEY (series_id) REFERENCES Series (id)
  );
`);