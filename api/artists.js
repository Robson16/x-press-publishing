const express = require('express');
const sqlite = require('sqlite3').verbose();

const db = new sqlite.Database(process.env.TEST_DATABASE || '../database.sqlite')
const artistsRouter = express.Router();

artistsRouter.param('artistId', (req, res, next, artistId) => {
  const sql = 'SELECT * FROM Artist WHERE id = $artistId';
  const values = { $artistId: artistId };

  db.get(sql, values, (error, artist) => {
    if (error) {
      return next(error);
    }

    if (!artist) {
      return res.status(404).send('Artist not found');
    }

    req.artist = artist;

    next();
  });
});

artistsRouter.get('/', (req, res, next) => {
  db.all(
    'SELECT * FROM Artist WHERE Artist.is_currently_employed = 1',
    (error, artists) => {
      if (error) {
        return next(error);
      }

      res.status(200).json({ artists: artists });
    }
  );
});

module.exports = artistsRouter;
