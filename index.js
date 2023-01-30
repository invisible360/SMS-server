const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();

//using middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.bmwcolr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const studentCollection = client.db('BUdb').collection('student-list');
        const attendanceCollection = client.db('BUdb').collection('attendance-log');
        const marksCollection = client.db('BUdb').collection('marks-log');

        app.post('/student-list', async (req, res) => {
            const studentList = req.body;
            const result = await studentCollection.insertOne(studentList);
            res.send(result);
        });

        app.get('/student-list', async (req, res) => {
            const allStudents = await studentCollection.find({}).toArray();
            res.send(allStudents);
        })

        app.post('/student-list-fetch', async (req, res) => {
            const studentFetchInfo = req.body;
            const studentSelection = await studentCollection.find(studentFetchInfo).sort({ id: 1 }).toArray();
            res.send(studentSelection);
        })

        app.post('/assigned-students', async (req, res) => {
            const assignedStd_ids = req.body;

            var oids = [];
            assignedStd_ids.forEach(function (item) {
                oids.push(new ObjectId(item));
            });

            const assignList = await studentCollection.find({ _id: { $in: oids } }).sort({ id: 1 }).toArray();
            res.send(assignList);
        })

        app.put('/spring-2023-std-list', async (req, res) => {
            const assignStd = req.body;
            // console.log(assignStd);

            if (assignStd.length > 0) {
                const matched_id = assignStd[0].map(e => e._id);

                const urlDataBulk = await studentCollection.initializeUnorderedBulkOp();
                // const emptyMark = await marksCollection;
                for (const stdId of matched_id) {
                    urlDataBulk.find({ _id: ObjectId(stdId) }).upsert().update({
                        $push: {
                            course: assignStd[1],
                        }
                    });
                    await marksCollection.insertOne({ studentList_id: stdId, course: assignStd[1] });

                }
                const result = urlDataBulk.execute();
                res.send(result);
            }
        });

        app.get('/get-attendance-log', async (req, res) => {
            const allAttendance = await attendanceCollection.find({}).toArray();
            res.send(allAttendance);
        })

        app.post('/attendance-record', async (req, res) => {
            const attendanceList = req.body;
            const result = await attendanceCollection.insertMany(attendanceList);
            res.send(result);

        })

        app.get('/semester-courses/:getSemester', async (req, res) => {
            const semestr = req.params.getSemester;
            const query = { semester: semestr };
            const courses = await studentCollection.find(query).sort({ id: 1 }).toArray();
            res.send(courses);

        })

        app.post('/coursewise-attendance-list', async (req, res) => {
            const searchInfo = req.body;
            const students = await studentCollection.find(searchInfo).sort({ id: 1 }).toArray();
            res.send(students);
        })

        app.get('/get-marks-log', async (req, res) => {
            const allMarks = await marksCollection.find({}).toArray();
            res.send(allMarks);
        })

        app.put('/marks-record', async (req, res) => {
            const marks = req.body;

            // const attendMark = marks.find(e => 'attendanceMark' in e);
            const ct1 = marks.find(e => 'classTest1' in e);
            const ct2 = marks.find(e => 'classTest2' in e);
            const mid = marks.find(e => 'midTerm' in e);
            const final = marks.find(e => 'finalTerm' in e);

            const urlDataBulk = await marksCollection.initializeUnorderedBulkOp();


            if (ct1) {
                const messag = marks.map(e => e.classTest1);
                const fil = messag.filter(item => typeof item === 'number');

                if (fil.length > 0) {
                    const filteringNullandZero = marks.filter(e => typeof e.classTest1 === 'number')

                    filteringNullandZero.forEach(e => urlDataBulk.find({ studentList_id: e.studentList_id, course: e.course }).upsert().update({
                        $set: {
                            classTest1: e.classTest1
                        }
                    }))
                    const result = urlDataBulk.execute();
                    res.send(result)

                }

                else {
                    res.send({ message: "No Update Made" })
                }
            }

            else if (ct2) {
                const messag = marks.map(e => e.classTest2);
                const fil = messag.filter(item => typeof item === 'number');

                if (fil.length > 0) {
                    const filteringNullandZero = marks.filter(e => typeof e.classTest2 === 'number')

                    filteringNullandZero.forEach(e => urlDataBulk.find({ studentList_id: e.studentList_id, course: e.course }).upsert().update({
                        $set: {
                            classTest2: e.classTest2
                        }
                    }))
                    const result = urlDataBulk.execute();
                    res.send(result)

                }

                else {
                    res.send({ message: "No Update Made" })
                }
            }

            else if (mid) {
                const messag = marks.map(e => e.midTerm);
                const fil = messag.filter(item => typeof item === 'number');

                if (fil.length > 0) {
                    const filteringNullandZero = marks.filter(e => typeof e.midTerm === 'number')

                    filteringNullandZero.forEach(e => urlDataBulk.find({ studentList_id: e.studentList_id, course: e.course }).upsert().update({
                        $set: {
                            midTerm: e.midTerm
                        }
                    }))
                    const result = urlDataBulk.execute();
                    res.send(result)

                }

                else {
                    res.send({ message: "No Update Made" })
                }
            }

            else if (final) {
                const messag = marks.map(e => e.finalTerm);
                const fil = messag.filter(item => typeof item === 'number');

                if (fil.length > 0) {
                    const filteringNullandZero = marks.filter(e => typeof e.finalTerm === 'number')

                    filteringNullandZero.forEach(e => urlDataBulk.find({ studentList_id: e.studentList_id, course: e.course }).upsert().update({
                        $set: {
                            finalTerm: e.finalTerm
                        }
                    }))
                    const result = urlDataBulk.execute();
                    res.send(result)
                }

                else {
                    res.send({ message: "No Update Made" })
                }
            }

            else {
                const messag = marks.map(e => e.attendanceMark);
                const fil = messag.filter(item => typeof item === 'number');

                if (fil.length > 0) {
                    const filteringNullandZero = marks.filter(e => typeof e.attendanceMark === 'number')

                    filteringNullandZero.forEach(e => urlDataBulk.find({ studentList_id: e.studentList_id, course: e.course }).upsert().update({
                        $set: {
                            attendanceMark: e.attendanceMark
                        }
                    }))
                    const result = urlDataBulk.execute();
                    res.send(result)
                }

                else {
                    res.send({ message: "No Update Made" })
                }

            }
        })

        app.get('/summery-attendance', async (req, res) => {
            const result = await studentCollection.aggregate([
                { $addFields: { "matched_id": { "$toString": "$_id" } } },
                {
                    $lookup: {
                        from: "attendance-log",
                        localField: "matched_id",
                        foreignField: "studentList_id",
                        as: "attendance"
                    }
                }
            ]).sort({ id: 1 }).toArray()
            //   console.log(result);
            res.send(result)
        })

        app.post('/summery-attendance/v2', async (req, res) => {
            const students = req.body[0];
            const inputCourse = req.body[1];
            const ids = students.map(e => e._id);

            const attendanceCourse = await attendanceCollection.find({ studentList_id: { $in: ids }, attendCourse: inputCourse }).sort({ date: 1 }).toArray();
            const marks = await marksCollection.find({ studentList_id: { $in: ids }, course: inputCourse }).toArray();

            res.send([attendanceCourse, marks])

        })

    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('SMS server is running');
})

app.listen(port, () => console.log(`SMS Server is running on ${port}`))

