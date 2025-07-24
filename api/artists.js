const express = require('express');
const sqlite = require('sqlite3').verbose();

const db = new sqlite.Database(process.env.TEST_DATABASE || '../database.sqlite')
const artistsRouter = express.Router();

artistsRouter.get('/', (req, res, next) => {
  db.all(
    'SELECT * FROM Artist WHERE Artist.is_currently_employed = 1',
    (err, artists) => {
      if (err) {
        return next(err);
      }

      res.status(200).json({ artists: artists });
    }
  );
});

module.exports = artistsRouter;
