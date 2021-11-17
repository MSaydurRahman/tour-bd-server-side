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
        //GET API
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({})
            const services = await cursor.toArray();
            res.send(services)
        })
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            console.log(query)
            const cursor = orderCollection.find(query)
            const orders = await cursor.toArray();
            res.send(orders)
        })

        //POST API
        app.post('/services', async (req, res) => {
            const service = req.body;
            console.log('hit the service post api', service)
            const result = await servicesCollection.insertOne(service);
            console.log(result)
            res.json(result)
        })
        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log('hit the order post api', order)
            const result = await orderCollection.insertOne(order);
            console.log(result)
            res.json(result)
        })
        //DELETE API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
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