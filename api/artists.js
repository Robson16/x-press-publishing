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

artistsRouter.get('/:artistId', (req, res) => {
  res.status(200).json({ artist: req.artist });
});

artistsRouter.post('/', (req, res, next) => {
  const { name, dateOfBirth, biography } = req.body.artist;

  if (!name || !dateOfBirth || !biography) {
    return res.status(400).send('Missing required fields');
  }

  const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;

  const sql = `
    INSERT INTO Artist (
      name,
      date_of_birth,
      biography,
      is_currently_employed
    ) VALUES (
      $name,
      $dateOfBirth,
      $biography,
      $isCurrentlyEmployed
    )
  `;

  const values = {
    $name: name,
    $dateOfBirth: dateOfBirth,
    $biography: biography,
    $isCurrentlyEmployed: isCurrentlyEmployed
  };

  db.run(sql, values, function (error) {
    if (error) {
      return next(error);
    }

    db.get('SELECT * FROM Artist WHERE id = $id', { $id: this.lastID }, (error, artist) => {
      if (error) {
        return next(error);
      }

      res.status(201).json({ artist: artist });
    });
  });
});

artistsRouter.put('/:artistId', (req, res, next) => {
  const { name, dateOfBirth, biography } = req.body.artist;

  if (!name || !dateOfBirth || !biography) {
    return res.status(400).send('Missing required fields');
  }

  const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;

  const sql = `
    UPDATE Artist
    SET
      name = $name,
      date_of_birth = $dateOfBirth,
      biography = $biography,
      is_currently_employed = $isCurrentlyEmployed
    WHERE id = $artistId
  `;

  const values = {
    $name: name,
    $dateOfBirth: dateOfBirth,
    $biography: biography,
    $isCurrentlyEmployed: isCurrentlyEmployed,
    $artistId: req.params.artistId
  };

  db.run(sql, values, function (error) {
    if (error) {
      return next(error);
    }

    db.get('SELECT * FROM Artist WHERE id = $id', { $id: req.params.artistId }, (error, artist) => {
      if (error) {
        return next(error);
      }

      res.status(200).json({ artist: artist });
    });
  });
});

module.exports = artistsRouter;
