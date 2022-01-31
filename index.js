const axios = require('axios');
const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');
const accessTokenSecret = "sumnsumn";

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const app = express();
app.use(express.json());

const StoreItem = require('./store');
const Cart= require('./cart');
const User = require('./user');

const url = 'mongodb+srv://dbUser:dbUserPassword@cluster0.ycymy.mongodb.net/namazon?retryWrites=true&w=majority';

//const dbName = 'dbExample';

const storeData = require('./sampleStore.json');
const cartData = require('./sampleCarts.json');
const { x } = require('joi');


let database;
const router = express.Router();

//axios header config
const config = {
  headers: {
    'x-Api-key': 'b7c7d3810cef489dbf050e6329b84c72'
  }
}

//-----JWT HWTNESS---(JWTNESS if you will)-------//

const authenticate = (async (req, res, next) => {
  try {
      const authHeader = req.headers.authorization;
    if (authHeader) {
      const jwtToken = authHeader.split(' ')[1];

      const user = jwt.verify(jwtToken, accessTokenSecret);
      req.user = user;
    }
  }
  catch(err) {
    res.send(403);
  }
  next();
})

router.post('/user/login', async (req, res) => {
  const {login, password} = req.body;
  const foundUser = await User.findOne({login, password});

  if (foundUser){
    const accessToken = jwt.sign({user:foundUser}, accessTokenSecret);
    res.send(accessToken);
  } else {
    res.send(403);
  }

})
//---------------------------------------------------------
 

const initDataBase = async () => {
  database = await mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
   if (database) {
      app.use(session({
          secret: 'whatever',
          store: new MongoStore({mongooseConnection: mongoose.connection})
       }));
      app.use(router);
     console.log('Successfully connected to my DB');
  } else {
    console.log("Error connecting to my DB");
  }
}

// const initUsers = async() => {
//   const users = [];
//   const firstNamePromise = axios.get('https://randommer.io/api/Name?nameType=firstName&quantity=50', config);
//   const lastNamePromise = axios.get('https://randommer.io/api/Name?nameType=surName&quantity=50', config);

//   const results = await Promise.all([firstNamePromise, lastNamePromise]);
//   results[0].data.forEach((name, index) => {
//     const firstName = name;
//     const lastName = results[1].data[index];
//     const email = firstName + '.' + lastName + '@gmail.com';
//     users.push({firstName, lastName, email, login: `${firstName}.${lastName}`, password: 'password123', cart: []});
//   });

//   await User.create(users);
// }

//  const initStoreAndCarts = async () => {
//   console.log('Initializing store data...');
//   await StoreItem.create(storeData);
//   console.log('Done');
//   console.log('Initializing cart data...');
//   await Cart.create(cartData);
//   console.log('Done');
//   }

const initializeAllData= async() => {
  await initDataBase();
  // await User.deleteMany({});
  // await Cart.deleteMany({});
  // await StoreItem.deleteMany({});
  // await initUsers();
  // await initStoreAndCarts();
  
};

initializeAllData();

//-----------------------------------------------
router.get('/', async (req, res) => {
  console.log(`req.session: ${JSON.stringify(req.session)}`);
  req.session.numCalls++;
  res.send(200);
})

// --------------user stuff ---------------------
//if jwt -> router.get('/users', authenticate, async (req, res) => {
router.get('/users', authenticate, async (req, res) => {
  //try {
  const foundUsers = await User.find().populate('cart'); 
  res.send(foundUsers);
  // }
  // catch(err){
  //   console.log(err);
  // }

});

router.get('/users/:id', authenticate, async (req, res) => {
  const foundUser = await User.findById(req.params.id);
  if (!req.session.lastUsersViewed) { 
    req.session.lastUsersViewed = [foundUser];
  }
  else {
    req.session.lastUsersViewed.push(foundUser);
  }
    res.send(foundUser ? foundUser: 404);
});


//did not include authenticate here, so you could see a username/pass to put in
router.post('/users', async (req, res) => {
  const result = await User.create(req.body);
  res.send(result);
});

router.put('/users:id', authenticate, async (req, res) => {
  if (!req.body.firstName || !req.body.lastName) {
    res.send(422)
    return;
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {returnOriginal: false});
  res.send(updatedUser ? updatedUser : 404);
})

// //------------------end user stuff -------------------

// //------------------start cart stuff------------------//

router.get('/users/:id/cart', async (req, res) => {
  const foundCart = await User.findById(req.params.id).populate('cart');
  // if (!user) return res.status(404).send('The user with the given ID was not found.');
  res.send(foundCart.cart);
});

//-------empty cart---erm------
router.delete('users/:id/cart', async (req, res) => {
  const foundUser= await User.findById(req.params.id);

  foundUser.cart = [];
  await foundUser.save();
  res.send(foundUser.cart);
})

// put an item in the cart
 router.post('/users/:id/cart', async (req, res) => {
  const result = await Cart.create(req.body);
  res.send(result);
});


//  ///////////////////////////////////////////////
//  //-----------------------
//  //////////////////////////////////////////////////
// router.get('/api/users/:id/cart/:iid', (req, res) => {
//   const user = users.find(c => c.id === parseInt(req.params.item.id));
//   if (!user) return res.status(404).send('The user with the given ID was not found.');
//   res.send(user.cart.id);/////idk why this doesnt work^
// });/////////////////////////////////////////

// //delete one item from cart
// router.delete('/api/users/:id/cart/:iid', (req, res) => {
//   const user = users.find(c => c.id === parseInt(req.params.id));
//   if (!user) return res.status(404).send('The user with the given ID was not found.');
  
//   const index = user.cart.indexOf(user.cart);
//   user.cart.splice(index, 1)
//   res.send(user.cart);
// });
// /////////////////////////////////////////////////////
// //----------start store item stuff-----------------//

router.get('/storeItems', async (req, res) => {
  //try {
  const foundItems = await StoreItem.find(); 
  res.send(foundItems);
  // }
  // catch(err){
  //   console.log(err);
  // }

});

router.get('/storeitems/:id', async (req, res) => {
  const foundItem = await StoreItem.findById(req.params.id);
  if (!req.session.lastItemsViewed) { 
    req.session.lastItemsViewed = [foundItem];
  }
  else {
    req.session.lastItemsViewed.push(foundItem);
  }
    res.send(foundItem ? foundItem: 404);
});

router.post('/storeitems', async (req, res) => {
  const result = await StoreItem.create(req.body);
  res.send(result);
});


//-------server stuff--------//
const port = process.env.PORT || 3000; //start on port 3000 unless there is an environment port set
app.listen(port, () => console.log(`Listening on port ${port}...`));