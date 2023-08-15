const model = require('../Model/user_model');
const generateJWT = require('../utils/authorization').generateJWT;
const hashPassword = require('../utils/authorization').hashPassword;

async function signup(req, res) {
    if (!req.body.email || !req.body.password || !req.body.name) {
        return res.status(400).send('Missing value');
    }

    if (!req.body.email.match(/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/)) {
        return res.status(400).send('Invalid email format');
    }

    const user = await model.getUser('email', req.body.email);

    if (user) {
        return res.status(400).send('Email already exists');
    }

    const user_id = await model.createUser(req.body.email, hashPassword(req.body.password), req.body.name);

    if (!user_id) {
        return res.status(500).send('Internal server error');
    }

    const result = await generateJWT(user_id);

    return res.status(200).send({ token: result });
}

function signin(req, res) {
    if (!req.body.email || !req.body.password) {
        return res.status(400).send('Missing value');
    }

    if (!req.body.email.match(/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/)) {
        return res.status(400).send('Invalid email format');
    }

    model.getUser('email', req.body.email).then((user) => {
        if (!user) {
            return res.status(400).send('Email does not exist');
        }

        if (hashPassword(user.password) !== req.body.password) {
            return res.status(400).send('Password does not match');
        }

        generateJWT(user.user_id).then((result) => {
            return res.status(200).send({ token: result });
        }).catch((err) => {
            console.log(err);
            return res.status(500).send('Internal server error');
        });
    }).catch((err) => {
        console.log(err);
        return res.status(500).send('Internal server error');
    });
}

function updateProfile(req, res) {

    if (!req.body.name || !req.body.self_intro) {
        return res.status(400).send('Missing value');
    }

    let user_id = req.authorization_id;

    model.updateUser(user_id, req.body.name, req.body.self_intro).then((result) => {
        return res.status(200).send({ user_id: user_id });
    }).catch((err) => {
        console.log(err);
        return res.status(500).send('Internal server error');
    });

}

function updateProfilePicture(req, res) {
    if (!req.file) {
        return res.status(400).send('Missing value');
    }

    let user_id = req.authorization_id;

    const imageUrl = `https://${process.env.PUBLIC_IP}/static/` + req.fileName;

    model.updateUserPicture(user_id, imageUrl).then((result) => {
        return res.status(200).send({ imageUrl: imageUrl });
    }
    ).catch((err) => {
        console.log(err);
        return res.status(500).send('Internal server error');
    }
    );
}

function getProfile(req, res) {
    if (!req.query.user_id) {
        return res.status(400).send('Missing value');
    }

    model.getUser('user_id', req.query.user_id).then((user) => {
        if (!user) {
            return res.status(400).send('User does not exist');
        }

        return res.status(200).send({
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            picture: user.picture,
            self_intro: user.self_intro
        });
    }).catch((err) => {
        console.log(err);
        return res.status(500).send('Internal server error');
    });
}

module.exports = {
    signup,
    signin,
    updateProfile,
    updateProfilePicture,
    getProfile
}
