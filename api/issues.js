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

issuesRouter.post('/', (req, res, next) => {
  const seriesId = req.params.seriesId;
  const { name, issueNumber, publicationDate, artistId } = req.body.issue;

  if (!name || !issueNumber || !publicationDate || !artistId) {
    return res.status(400).send('Missing required fields');
  }

  const artistExists = db.get(
    'SELECT * FROM Artist WHERE id = $artistId',
    { $artistId: artistId }
  );

  if (!artistExists) {
    return res.status(400).send('Artist not found');
  }

  const sql = `
    INSERT INTO Issue (
      name,
      issue_number,
      publication_date,
      artist_id,
      series_id
    ) VALUES (
      $name,
      $issueNumber,
      $publicationDate,
      $artistId,
      $seriesId
    )
  `;

  const values = {
    $name: name,
    $issueNumber: issueNumber,
    $publicationDate: publicationDate,
    $artistId: artistId,
    $seriesId: seriesId
  };

  db.run(sql, values, function (error) {
    if (error) {
      return next(error);
    }

    db.get('SELECT * FROM Issue WHERE id = $id', { $id: this.lastID }, (error, issue) => {
      if (error) {
        return next(error);
      }

      res.status(201).json({ issue: issue });
    });
  });
});

module.exports = issuesRouter;