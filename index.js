const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
const cors = require('cors')
require("dotenv").config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wl2z9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
    try {
      await client.connect();
      console.log('connected to database');
      const database = client.db("SMRJDMCARS");
      const carCollection = database.collection("carCollections");
      const confirmedCarCollection = database.collection("confirmedCarCollections");
      const usersCollection = database.collection("users");
      const reviewCollection = database.collection("review");
    

    //   get API

    app.get('/carCollections', async (req, res) => {
        const cursor= carCollection.find({});
        const cars = await cursor.toArray();
        res.send(cars);
        console.log(cars);
    });

    //   get review

    app.get('/review', async (req, res) => {
        const cursor= reviewCollection.find({});
        const result = await cursor.toArray();
        res.send(result);
        console.log(result);
    });

    // get individual car

    app.get("/carOrder/:id", async (req, res) => {
        const result = await carCollection.findOne({_id: ObjectId(req.params.id)}); 
        res.send(result);
    });

    // post confirmed cars

    app.post("/confirmedCar", async (req, res) => {
        const result = await confirmedCarCollection.insertOne(req.body)
        res.send(result);
        console.log("confirmed", result);
    })

    // get my orders

    app.get("/userOrders/:email", async (req, res) => {
        const result = await confirmedCarCollection.find({email: (req.params.email)}).toArray();
        res.send(result);
    })

    // remove from my orders

    app.delete("/removeOrder/:id", async (req, res)=>{
        const result = await confirmedCarCollection.deleteOne({_id: ObjectId(req.params.id)})
        res.send(result);
        
    })

// users database
app.post("/users", async (req, res) => {
  const result = await usersCollection.insertOne(req.body)
  res.send(result);
  console.log("user added", result);
})

// make admin
    app.put("/users/admin", async (req, res) => {
        const filter = { email: req.body.email };
        const updateDoc = {$set: { role: "admin" }}
        const result = await usersCollection.updateOne(filter, updateDoc);
          res.json(result);
          console.log("put", result);
        });

    // check admin 
  app.get("/users/:email", async (req, res) => {
    const user = await usersCollection.findOne({ email: req.params.email });
    let isAdmin = false;
    if(user?.role === "admin"){
       isAdmin= true;
    }
    res.json({admin: isAdmin});
  });

   // review
   app.post("/addSReview", async (req, res) => {
    const result = await reviewCollection.insertOne(req.body);
    res.send(result);
  });

    // add cars
    app.post("/addCars", async (req, res)=>{
        const result = await carCollection.insertOne(req.body)
        res.json(result);
            })
   
            console.log("all route is working");
    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.get("/", (req, res) =>{
   res.send("running SMR JDM CARS Server")
   console.log("running SMR JDM CARS Server");
});

app.listen(port, ()=>{
    console.log('running SMR JDM CARS Server on port', port);
});