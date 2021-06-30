require('dotenv').config({ path: '.env' });
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
// const server = require('http').Server(app);
const { v4: uuidV4 } = require('uuid');
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const io = require('socket.io')(3001, {
    cors: {
        origin: 'http://localhost:3000',
    }
});

const mongoose = require('mongoose');
const Doc = require('./models/Doc');


mongoose.connect('mongodb+srv://smit:smit@cluster0.haxvy.mongodb.net/Docs?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})
.then(()=> console.log('connect'))
.catch((error) => console.error(error));



io.on('connection', (socket) =>  {
    socket.on('get-document', async (DocId) => {

        const doc = await findOrCreateDocument(DocId);

        socket.join(DocId);


        socket.emit('load-document', doc);


        socket.on('changes', delta => {
            socket.broadcast.to(DocId).emit("receive-changes", delta);
        });


        socket.on('save-document', async (data) => {
            Doc.findByIdAndUpdate({'_id': DocId}, { 'html': data.html, 'css': data.css, 'js': data.js, 'python': data.python, 'cpp': data.cpp, 'java': data.java}).then((d) => {
                console.log(d);
            })  
            .catch(err => { 
                console.error(err);
            })
        })
    });
    console.log("connected");
});



var findOrCreateDocument = async (id) => {
    if(id === null){
        return;
    }
    const document = await Doc.findById(id);
    if(document) return document;
    return await Doc.create({_id: id, html:"",css:"",js:"",python:"",java:"",cpp:""}); 
};

// app.listen(3001, () => {console.log('3001');})