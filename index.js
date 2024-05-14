const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.h0zb1dz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const foodsCollection = client.db('trioEats').collection("foods");
    const purchaseCollection = client.db('trioEats').collection("purchase");
    const galleryCollection = client.db('trioEats').collection("gallery");

    app.get('/items', async(req, res)=>{
      const result = await foodsCollection.find().toArray();
      res.send(result);
    })

    app.get('/topfoods', async(req, res)=>{
      const cursor = foodsCollection.find().sort({"purchaseCount":-1});
      const result = await cursor.toArray();
      console.log(result);
      res.send(result);
    })

    app.get('/purchase', async(req, res)=>{
      const result = await purchaseCollection.find().toArray();
      res.send(result);
    })

    app.get('/gallery', async(req, res)=>{
      const result = await galleryCollection.find().toArray();
      res.send(result);
    })

    app.get('/items/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await foodsCollection.findOne(query);
      res.send(result);
    })

    app.get('/foods/:email', async(req, res)=>{
      const result = await foodsCollection.find({email:req.params.email}).toArray();
      res.send(result);
    })

    app.get('/purchases/:email', async(req, res)=>{
      const result = await purchaseCollection.find({email:req.params.email}).toArray();
      res.send(result);
    })

    app.get('/search/:search', async(req, res)=>{
      let query = {
        foodname: { $regex: req.params.search, $options: 'i' },
      };
      const result = await foodsCollection.find(query).toArray();
      res.send(result);
    })
  
    app.post('/items', async(req, res)=>{
      const item = req.body;
      const result = await foodsCollection.insertOne(item);
      res.send(result);
    })

    app.post('/gallery', async(req, res)=>{
      const item = req.body;
      const result = await galleryCollection.insertOne(item);
      res.send(result);
    })

    app.post('/purchase', async(req, res)=>{
      const item = req.body;
      const result = await purchaseCollection.insertOne(item);
      const updateDoc = {
        $inc: { purchaseCount: 1 },
      }
      const foodQuery = { _id: new ObjectId(item.foodId) }
      const updatefoodCount = await foodsCollection.updateOne(foodQuery, updateDoc);
      console.log(updatefoodCount)
      res.send(result);
    })

    app.put('/update/:id', async(req, res)=>{
      const id = req.params.id;
      const updatedFood = req.body;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const spot = {
        $set: {
          price: updatedFood.price,
          name: updatedFood.name,
          email: updatedFood.email,
          origin: updatedFood.origin,
          description: updatedFood.description,
          image: updatedFood.image,
          quantity: updatedFood.quantity,
          category: updatedFood.category,
          foodname: updatedFood.foodname
        }
      }
      const result = await foodsCollection.updateOne(filter,spot,options);
      res.send(result);
    })

    app.delete('/purchases/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await purchaseCollection.deleteOne(query);
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send('Server is running successfully');
})

app.listen(port, ()=>{
    console.log(`server is running on port ${port}`)
})