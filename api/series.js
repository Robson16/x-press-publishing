const express = require('express');
const sqlite = require('sqlite3');
const path = require('path');

const db = new sqlite.Database(process.env.TEST_DATABASE || path.resolve(__dirname, '../database.sqlite'));
const seriesRouter = express.Router();

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

module.exports = seriesRouter;