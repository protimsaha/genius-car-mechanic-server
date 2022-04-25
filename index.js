const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
const app = express()
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

async function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorize User' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        console.log('decoded', decoded)
        req.decoded = decoded;
        next()
    })
}


// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e3npc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// var MongoClient = require('mongodb').MongoClient;

var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.e3npc.mongodb.net:27017,cluster0-shard-00-01.e3npc.mongodb.net:27017,cluster0-shard-00-02.e3npc.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-rgtnsu-shard-0&authSource=admin&retryWrites=true&w=majority`;
MongoClient.connect(uri, function (err, client) {

    async function run() {
        try {
            await client.connect()
            const serviceCollection = client.db('geniusCar').collection('service')
            const orderCollection = client.db('geniusCar').collection('order')

            // GET
            app.get('/service', async (req, res) => {
                const query = {}
                const cursor = serviceCollection.find(query)
                const services = await cursor.toArray()
                res.send(services)
            })

            // POST
            app.post('/service', async (req, res) => {
                const newService = req.body;
                const result = await serviceCollection.insertOne(newService)
                res.send(result)
            })

            // AUTH BY JWT TOKEN
            app.post('/login', async (req, res) => {
                const user = req?.body;
                const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: '1d'
                });
                res.send({ accessToken })
            })



            // ADD ORDER
            app.post('/order', async (req, res) => {
                const order = req.body;
                const result = await orderCollection.insertOne(order)
                res.send(result)
            })

            app.get('/order', verifyJWT, async (req, res) => {
                const decodedEmail = req.decoded.email
                const email = req.query.email
                if (email === decodedEmail) {
                    const query = { email: email }
                    const cursor = orderCollection.find(query)
                    const orders = await cursor.toArray()
                    res.send(orders)
                } else {
                    return res.status(403).send({ message: 'Forbidden access' })
                }
            })





            app.get('/service/:id', async (req, res) => {
                const id = req.params.id
                const query = { _id: ObjectId(id) }
                const service = await serviceCollection.findOne(query)
                res.send(service)
            })

            // delete
            app.delete('/service/:id', async (req, res) => {
                const id = req.params.id;
                const query = { _id: ObjectId(id) }
                const result = await serviceCollection.deleteOne(query)
                res.send(result)
            })
        }
        finally {

        }
    }
    run().catch(console.dir);
    // const collection = client.db("test").collection("devices");
    // perform actions on the collection object
    // client.close();
});




// (put,patch),get,delete,post


app.get('/', (req, res) => {
    res.send('Genius Server is running')
})

app.get('/hero', (req, res) => {
    res.send('Hero meets Hero Ku')
})

app.listen(port, () => {
    console.log('Listening to port ', port)
})

// hello I am changing something