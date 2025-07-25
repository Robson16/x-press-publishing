const express = require('express');
const sqlite = require('sqlite3');
const path = require('path');

const issuesRouter = require('./issues');

const db = new sqlite.Database(process.env.TEST_DATABASE || path.resolve(__dirname, '../database.sqlite'));
const seriesRouter = express.Router();

// Middleware to handle seriesId parameter
seriesRouter.param('seriesId', (req, res, next, seriesId) => {
  const sql = 'SELECT * FROM Series WHERE id = $seriesId';
  const values = { $seriesId: seriesId };

  db.get(sql, values, (error, series) => {
    if (error) {
      return next(error);
    }

    if (!series) {
      return res.status(404).send();
    }

    req.series = series;

    next();
  });
});

// Mount issues router to handle issues for a specific series
seriesRouter.use('/:seriesId/issues', issuesRouter);

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

seriesRouter.get('/:seriesId', (req, res) => {
  res.status(200).json({ series: req.series });
});

seriesRouter.post('/', (req, res, next) => {
  const { name, description } = req.body.series;

  if (!name || !description) {
    return res.status(400).send('Missing required fields');
  }

  const sql = `
    INSERT INTO Series (
      name,
      description
    ) VALUES (
      $name,
      $description
    )
  `;

  const values = {
    $name: name,
    $description: description
  };

  db.run(sql, values, function (error) {
    if (error) {
      return next(error);
    }

    db.get('SELECT * FROM Series WHERE id = $id', { $id: this.lastID }, (error, series) => {
      if (error) {
        return next(error);
      }

      res.status(201).json({ series: series });
    });
  })
});

seriesRouter.put('/:seriesId', (req, res, next) => {
  const { name, description } = req.body.series;

  if (!name || !description) {
    return res.status(400).send('Missing required fields');
  }

  const sql = `
    UPDATE Series
    SET
      name = $name,
      description = $description
    WHERE id = $seriesId
  `;

  const values = {
    $name: name,
    $description: description,
    $seriesId: req.params.seriesId
  };

  db.run(sql, values, function (error) {
    if (error) {
      return next(error);
    }

    if (this.changes === 0) {
      return res.status(404).send('Series not found');
    }

    db.get('SELECT * FROM Series WHERE id = $id', { $id: req.params.seriesId }, (error, series) => {
      if (error) {
        return next(error);
      }

      res.status(200).json({ series: series });
    });
  });
});

seriesRouter.delete('/:seriesId', (req, res, next) => {
  const seriesId = req.params.seriesId;

  const hasIssuesSql = `
    SELECT * FROM Issue
    WHERE series_id = $seriesId
  `;

  const deleteSql = `
    DELETE FROM Series 
    WHERE id = $seriesId
  `;

  const values = { $seriesId: seriesId };

  db.all(hasIssuesSql, values, (error, issues) => {
    if (error) {
      return next(error);
    }

    if (issues.length > 0) {
      return res.status(400).send('Cannot delete series with associated issues');
    }

    db.run(deleteSql, values, function (error) {
      if (error) {
        return next(error);
      }

      if (this.changes === 0) {
        return res.status(404).send('Series not found');
      }

      res.status(204).send();
    });
  });
});

module.exports = seriesRouter;