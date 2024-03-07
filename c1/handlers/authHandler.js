//npm install jsonwebtoken
const jwt = require('jsonwebtoken');
const User = require('../pkg/users/userSchema');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const crypto = require('crypto');
const sendEmail = require('./emailHandler');
const sendMailGun = require('./mailgun');

exports.signup = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    //! Kreiranje na token
    const token = jwt.sign(
      {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES,
      }
    );

    res.cookie('jwt', token, {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
      ),
      secure: false,
      httpOnly: true,
    });

    await sendMailGun({
      email: newUser.email,
      subject: 'Vi blagodarime na registracijata',
      message: 'testtestetes',
    });

    //!Isprakajnje na token zaedno so se korisnicki informacii
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    //1. Proveruvame dali ima vneseno passvord i email
    if (!email || !password) {
      return res.status(400).send('Please provide email and password!');
    }
    //2. Proveruvame dali korisnikot postoi
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send('Invalid email or password');
    }
    //3. Sporeduvame pasvord
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send('Invalid email or password!');
    }
    //4. Se generira i isprakja token
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES,
      }
    );

    //5. Se isprakja cookies so tokenot
    res.cookie('jwt', token, {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
      ),
      secure: false,
      httpOnly: true,
    });

    //6. Se isprakja finalen odgovor so status i token
    res.status(201).json({
      status: 'success',
      token,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send('Internal server error');
  }
};

exports.protect = async (req, res, next) => {
  try {
    // 1) Go zemame tokenot i proveruvame dali e tamu

    let token;

    if (req.headers.authorization) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(500).send('You are not logged in! please log in');
    }

    // function verifyToken(token) {
    //   return new Promise((resolve, reject) => {
    //     jwt.verify(token, process.env.JWT_SECRET, (err, decodedtoken) => {
    //       if (err) {
    //         reject(new Error('Token verification failed'));
    //       } else {
    //         resolve(decodedToken);
    //       }
    //     });
    //   });
    // }

    //!
    // const verifyAsync = promisify(jwt.verify);
    // const decoded = await verifyAsync(token, process.env.JWT_SECRET);
    //!

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Proveruvame dali koisnikot posti
    const userTrue = await User.findById(decoded.id);
    if (!userTrue) {
      return res.status(401).send('User doesnt longer exist');
    }

    req.auth = userTrue;
    next();
  } catch (err) {
    return res.status(500).send('Internal server error');
  }
};

exports.restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.auth.role)) {
      return res.status(500).send('You dont have access');
    }
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  try {
    // 1) Da go pronajdime korisnikot so pomosh na negoviot meail
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send('This user doesnt exist');
    }
    // 2) Generiranje na resetriacki token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 3) Zapishuvanje na resetirackiot token vo korisickiot dokument vo data baza
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetExpires = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    // 4) da ispratime link do korisnkickot email
    // http://127.0.0.1:10000/resetPassword/65cfc9e8451e7d0aeb44c01e
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/resetPassword/${resetToken}`;

    const message = `Ja zaboravivte vashata lozinka, ve molime iskorestete Patch request so vashata nova lozinka na ova ur ${resetUrl}`;

    const htmlMessage = `
      <div  style="text-align: center;">
        <h2 style="color: blue">Dali go imate zaboraveno vashiot email</h2>
        <p style="color: #005;">Ako pobaravte resetiracki link, ve molam klikente linkot shto sleduva</p>
        <a style="background-color: #0056b3;  color: #fff; padding: 10px 30px; text-decoration:none; display: inline-block; border-radius: 5px" href="${resetUrl}">Reset Password</a>
        <p>URGENTNOOOO!!! IMATE SAMO 30 MINUTI POBRZAJTE</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: 'URGENT!!! Restirajte lozinka za vreme od 30 min',
      message: message,
      html: htmlMessage,
    });

    await sendMailGun({
      email: user.email,
      subject: 'URGENT!!! Restirajte lozinka za vreme od 30 min',
      message: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    return res.status(500).send('Failed to send email to your adress');
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // 1) Da go dobieme korisnikot dokument ili korisnikot sto go ima toj token
    const token = req.params.token;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    // 2) I sega proveruvame vo slucaj da ne go pronajde korisnikot
    if (!user) {
      // return res.status(400).send('Tokenot e istencen');
      throw new Error('Tokenot e istencen');
    }

    // 3) Promena na korisnickiot lozinka
    user.password = req.body.password;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save();
    // 4) opcionalno odkako se premnila lozinkata, generirame nov token i mu go isprakjame na korisnikot
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });

    res.cookie('jwt', jwtToken, {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
      ),
      secure: false,
      httpOnly: true,
    });

    res.status(201).json({
      status: 'success',
      token: jwtToken,
    });
  } catch (err) {
    return res.status(500).send('Failed to send email to your adress');
  }
};

//? pri sekoe registrianje (kreiranje na nov korisnik), nashiot servis da isprakja mail so vi blagodaram za registracijata na nashata platforma, Iskoristete kodot 8mart za da dobiete popust na nashite proizvodi

//? Da skreira forgotPassword na tviter aplikacijata
//? Pri sekoja registracija da se isprakja Vi blagodaram za kreiranot profil
//? Pri patch metoda na nekoj post ama samo ako ima i slika vo patchot - da se isprati mail so nekakva sodrzina test test test.
