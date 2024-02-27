const Movie = require('../pkg/movies/movieSchema');

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

exports.update = async (req, res) => {
  try {
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
