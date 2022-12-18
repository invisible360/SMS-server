const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');


const app = express();

//using middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.bmwcolr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const studentCollection = client.db('spring2023').collection('student-list');

        app.post('/student-list', async (req, res) => {
            const studentList = req.body;
            const result = await studentCollection.insertOne(studentList);
            res.send(result);
        });

        app.get('/student-list', async (req, res) => {
            const query = {};
            const allStudents = await studentCollection.find(query).toArray();
            res.send(allStudents);
        })

    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('BU SMS server is running');
})

app.listen(port, () => console.log(`SMS Server is running on ${port}`))

