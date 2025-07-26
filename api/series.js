const express = require('express');
const sqlite = require('sqlite3');
const path = require('path');

const db = new sqlite.Database(process.env.TEST_DATABASE || path.resolve(__dirname, '../database.sqlite'));
const seriesRouter = express.Router();

seriesRouter.get('/', (req, res, next) => {
  db.all(
    'SELECT * FROM Series',
    (error, series) => {
      if (error) {
        return next(error);
      }

      res.status(200).json({ series: series });
    }
  );
});

module.exports = seriesRouter;