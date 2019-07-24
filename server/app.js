"use strict";
const express = require('express');
const config = require('./config');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const multer = require('multer');
const { check, body, validationResult } = require('express-validator');


const app = express();
const router = express.Router();
const upload = multer({dest:__dirname+'/music/'});

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// CORS middleware
const allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  if ('OPTIONS' === req.method) {
    //respond with 200
    res.send(200);
  }
  else {
  //move on
    next();
  }
}

app.set('Model', new (require('./models'))(config.dbase));
app.use(allowCrossDomain);

router.get('/api/catalogs', async function(req, res) {
    const catalogs = await app.get('Model').getModel('catalog').getAll()
    res.status(200).json(catalogs);
});

router.get('/api/tracks/:catalog', async function(req, res) {
    const tracks = req.params.catalog&&!isNaN(req.params.catalog)?await app.get('Model').getModel('track').getForCatalog(req.params.catalog):[];
    res.status(200).json(tracks);
})

router.post('/api/register', [
    check('email').isEmail(),
    body('name').not().isEmpty().trim().escape(),
    check('password').isLength({ min: 5 }),
    ], async function(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        const {user,err} = await app.get('Model').getModel('user').addUser(req.body.email, req.body.name, req.body.password);
        if(err) err.name == 'SequelizeUniqueConstraintError' ? res.status(401).send('This email already used') : res.status(500).send('Registration failure');
        else { 
            let token = jwt.sign({ id: user.id }, config.secret, { expiresIn: 86400}); 
            res.status(200).send({ auth: true, token });
        }
});

router.post('/api/login', [
    check('email').isEmail(),
    check('password').isLength({ min: 5 }),
    ], async function(req, res) {
        console.log('login request');
        const user = await app.get('Model').getModel('user').findOne({email:req.body.email});
        if(!user) res.status(404).send('No user found.');
        else
        if(await user.validPassword(req.body.password))
        {
            let token = jwt.sign({ id: user.id }, config.secret, { expiresIn: 86400 });
            res.status(200).send({ auth: true, token });
        }
        else res.status(401).send({ auth: false, token: null });
});

router.all('*', function(req, res, next){
    let token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, config.secret, function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        req.user = decoded;
        next();
    });
});

router.get('/api/me', function(req, res) {
    res.status(200).send(req.user);
});

router.post('/api/catalog', [body('title').not().isEmpty().trim().escape()], async function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    } 
    else
    {
        const catalog = await app.get('Model').getModel('catalog').create({title:req.body.title});
        catalog ? res.status(200).send('ok') : res.status(500).send('No added');
    }
});

router.post('/api/track', upload.single('track'), [
        body('title').not().isEmpty().trim().escape(),
        check('duration').isNumeric(),
        check('catalog').isNumeric(),
    ], async function(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        } 
        else if(!req.file)
        {
            return res.status(500).send('File upload error');
        }
        else
        {
            const {track, err} = await app.get('Model').getModel('track').addTrack(req.body.title, req.body.duration, req.file, req.user.id, req.body.catalog);
            if(err) res.status(500).json(err);
            else if(track) res.status(200).send('ok');
        }
});

app.use(router);

let port = config.port || 3000;

let server = app.listen(port, function() {
 console.log('Express server listening on port ' + port);
});