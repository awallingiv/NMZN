const express = require('express');
const router = express.Router();

let users = [
    { id: 1, name: 'Jon' },
    { id: 2, name: 'Jacob' },
    { id: 3, name: 'Jingleheimer' },
    { id: 4, name: 'smith' }
];

// router.get('/', (req, res) => {
//     res.send('Hello, welcome to Namazon!');
//  });

router.get('/', (req, res) => {
    res.send(users);
});

router.post('/', (req, res) => {
    const { error } = validateUser(req.body); //result.error

    //400 Bad request
    if (error) return res.status(400).send(error.details[0].message);

    const user = {
        id: user.length + 1,
        name: req.body.name
    };
    users.push(user);
    res.send(user);
})

router.put('/:id', (req, res) => {
   const user = users.find(g=> g.id === parseInt(req.params.id));
   if (!user) return res.status(404).send("The user with the given ID was not found");

   const {error} = validateUser(req, body); //result.error

    if (error) return res.status(400).send(error.details[0].message);

    user.name = req.body.name;
    res.send(user);
});

router.delete('/:id', (req, res) => {
    //look up the course
    //if not exist, return 404
    const user = users.find(g => g.id === parseInt(req.params.id));
    if (!user) return res.status(404).send('The user with the given ID was not found');

    //delete
    const index = users.indexOf(user);
    users.splice(index, 1);

    //return the same course
    res.send(user);

});

// /api.courses/1
router.get('/:id', (req, res) => {
    const user = users.find(g => g.id === parseInt(req.params.id));
    if (!user) return res.status(404).send('The user was not found');
    res.send(user);
});

function validateUser(user) {
    //validate
    //if invalid, return 400
    const schema = {
        name: Joi.string().min(3).required()
    };

    return Joi.validate(user, schema);
};

module.exports = router;