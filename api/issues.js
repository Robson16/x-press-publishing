const express = require('express');
const sqlite = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite.Database(process.env.TEST_DATABASE || path.resolve(__dirname, '../database.sqlite'));
const issuesRouter = express.Router({ mergeParams: true });

// Middleware to handle issueId parameter
issuesRouter.param('issueId', (req, res, next, issueId) => {
  db.get(
    'SELECT * FROM Issue WHERE id = $issueId',
    { $issueId: issueId },
    (error, issue) => {
      if (error) {
        return next(error);
      }

      if (!issue) {
        return res.status(404).send();
      }

      req.issue = issue;

      next();
    });
});

issuesRouter.get('/', (req, res, next) => {
  const seriesId = req.params.seriesId;

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

issuesRouter.put('/:issueId', (req, res, next) => {
  const issueId = req.params.issueId;
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
    UPDATE Issue
    SET name = $name,
        issue_number = $issueNumber,
        publication_date = $publicationDate,
        artist_id = $artistId
    WHERE id = $issueId
  `;

  const values = {
    $name: name,
    $issueNumber: issueNumber,
    $publicationDate: publicationDate,
    $artistId: artistId,
    $issueId: issueId
  };

  db.run(sql, values, function (error) {
    if (error) {
      return next(error);
    }

    db.get('SELECT * FROM Issue WHERE id = $id', { $id: issueId }, (error, issue) => {
      if (error) {
        return next(error);
      }

      res.status(200).json({ issue: issue });
    });
  });
});

issuesRouter.delete('/:issueId', (req, res, next) => {
  const issueId = req.params.issueId;

  db.run(
    'DELETE FROM Issue WHERE id = $issueId',
    { $issueId: issueId },
    function (error) {
      if (error) {
        return next(error);
      }

      if (this.changes === 0) {
        return res.status(404).send('Issue not found');
      }

      res.status(204).send();
    }
  );
});

module.exports = issuesRouter;