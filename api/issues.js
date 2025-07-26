const express = require('express');
const sqlite = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite.Database(process.env.TEST_DATABASE || path.resolve(__dirname, '../database.sqlite'));
const issuesRouter = express.Router({ mergeParams: true });

issuesRouter.get('/', (req, res, next) => {
  const seriesId = req.params.seriesId;

  console.log(`Fetching issues for series with ID: ${seriesId}`);

  db.all(
    'SELECT * FROM Issue WHERE series_id = $seriesId',
    { $seriesId: seriesId },
    (error, issues) => {
      if (error) {
        return next(error);
      }

      res.status(200).json({ issues: issues });
    }
  );
});

module.exports = issuesRouter;