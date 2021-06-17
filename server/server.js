const io = require('socket.io')(3001, {
    cors: {
        origin: 'http://localhost:3000',
    }
});
io.on('connection', (socket) =>  {
    socket.on('get-document', (DocId) => {
        const data = "";
        socket.join(DocId);
        socket.emit('load-document', data);
        socket.on('changes', delta => {
            socket.broadcast.to(DocId).emit("receive-changes", delta);
        });
    });

    console.log("connected");
});
