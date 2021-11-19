const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors')
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
//
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ma2ou.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect()
        const database = client.db('tourBd');
        const servicesCollection = database.collection('services');
        const orderCollection = database.collection('orders');
        const usersCollection = database.collection('users')
        const reviewsCollection = database.collection('reviews')
        //GET API
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({})
            const services = await cursor.toArray();
            res.send(services)
        })
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({})
            const reviews = await cursor.toArray()
            res.send(reviews)
        })

        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            // console.log(query)
            const cursor = orderCollection.find(query)
            const orders = await cursor.toArray();
            res.send(orders)
        })

        app.get('/allOrders', async (req, res) => {

            // console.log(query)
            const cursor = orderCollection.find({})
            const orders = await cursor.toArray();
            res.send(orders)
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
        //POST API
        app.post('/services', async (req, res) => {
            const service = req.body;
            console.log('hit the service post api', service)
            const result = await servicesCollection.insertOne(service);
            // console.log(result)
            res.json(result)
        })
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            console.log('hit the review post api', review)
            const result = await reviewsCollection.insertOne(review)
            res.json(result)
        })
        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log('hit the order post api', order)
            const result = await orderCollection.insertOne(order);
            // console.log(result)
            res.json(result)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result)
            res.json(result);
        })

        //PUT
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        //DELETE API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        })
        //
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.deleteOne(query);
            res.json(result)
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('running tour bd server');
})

app.listen(port, () => {
    console.log('running tour bd on port', port);
})