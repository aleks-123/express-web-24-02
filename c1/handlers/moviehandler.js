// req.body --- prakjame objekt so koj sakame da go zacuvame vo data baza ili da go hendalem na nekov nacin
// req.query --- parametri za preburavnje niz data baza
// req.params ---- url/parametar
// req.header --- samiot browser go kreira
// req.file --- objketot na samiot fajl -

const Movie = require('../pkg/movies/movieSchema');

//! npm install multer
//! npm install uuid

const multer = require('multer');
const uuid = require('uuid');

const imageId = uuid.v4();

const multerStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/img/movies');
  },
  filename: (req, file, callback) => {
    const ext = file.mimetype.split('/')[1];
    callback(null, `movie-${imageId}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(new Error('This file type is not supported'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadMoviePhoto = upload.single('picture'); // req.file
exports.uploadMultiplePhoto = upload.array('pictures', 3); // req.files

// exports.uploadCombinationPhotos = upload.fields([
//   { name: 'picture', maxCount: 1 },
//   { name: 'pictures', maxCount: 3 },
// ]);

exports.update = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.file);

    if (req.file) {
      req.body.slika = req.file.filename;
    }

    // if (req.files) {
    //   req.body.sliki = req.files.sliki.map((file) => file.filename);
    // }

    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        movie,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    // console.log(req.query);
    //prvo kje napravime kopija od objektot req.query
    const queryObj = { ...req.query };

    let queryString = JSON.stringify(queryObj);
    //gt, gte, lt, lte

    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    const query = JSON.parse(queryString);
    console.log(query);
    let movies = await Movie.find(query);

    res.status(200).json({
      status: 'success',
      total: movies.length,

      data: {
        movies,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getOne = async (req, res) => {
  try {
    console.log(req.semos);
    const movie = await Movie.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        movie,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.create = async (req, res) => {
  try {
    const newMovie = await Movie.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        movie: newMovie,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.delete = async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

exports.createByUser = async (req, res, next) => {
  try {
    const moviePost = await Movie.create({
      title: req.body.title,
      year: req.body.year,
      genre: req.body.genre,
      author: req.auth.id,
    });

    res.status(201).json(moviePost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByUser = async (req, res) => {
  try {
    const userId = req.auth.id;

    const mineMovies = await Movie.find({ author: userId });

    res.status(201).json(mineMovies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.replace = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      overwrite: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        movie,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.averageYear = async (req, res) => {
  try {
    const result = await Movie.aggregate([
      {
        $group: {
          _id: null,
          averageYear: { $avg: '$year' },
        },
      },
    ]);
    res.status(200).json({
      status: 'success',

      data: {
        result,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.totalYear = async (req, res) => {
  try {
    const result = await Movie.aggregate([
      {
        $group: {
          _id: null,
          totalYear: { $sum: '$year' },
        },
      },
    ]);
    res.status(200).json({
      status: 'success',

      data: {
        result,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.numberPerGenre = async (req, res) => {
  try {
    const result = await Movie.aggregate([
      {
        $group: {
          _id: '$genre',
          numberPerGenre: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json({
      status: 'success',

      data: {
        result,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

///
{
  /* <form action='/patchingMOvies' method='post' enctype='multipart/form-data'>
  <label>bla bla bla</label>
  <input type='file' accept='image/*' name='picture' />
  <button type='submit'>Upload picture</button>
</form>; */
}

//! Za domasna uploaduiranje na slika /slika
//! Uploadiranje cv na ruta /cv
