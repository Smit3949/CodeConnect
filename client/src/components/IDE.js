import React,{ useEffect, useState } from 'react';
import Quill from 'quill';
import "quill/dist/quill.snow.css";
import { io } from 'socket.io-client';
import { useParams } from 'react-router';
export default function IDE({}) {
    const {id: DocId} = useParams();
    const [socket,setSocket] = useState(null);
    const [quill, setQuill] = useState(null);
    console.log(DocId);
    useEffect(() => {
        var TempSocket = io('http://localhost:3001');
        setSocket(TempSocket);

        var TempQ = new Quill('#editor', {
            theme: 'snow',
            modules: {
                toolbar: false,
            }
        }); 
        TempQ.enable(false);
        TempQ.setText('Loading...');
        setQuill(TempQ);

        return () => {
            TempSocket.disconnect();
        }
    }, [])

    useEffect(() => {
        if(socket === null || quill === null) return;
        socket.once("load-document", (document) => {
            quill.setContents(document);
            quill.enable();
        });
        socket.emit('get-document', DocId);
    }, [socket, quill, DocId]);

    useEffect(() => {
        if(socket === null || quill === null) return;
        const updateContent = (delta) => {
            quill.updateContents(delta);
        };
        socket.on('receive-changes', updateContent);
        return () => {
            socket.off('receive-changes', updateContent);
        }
    }, [socket, quill]);


    useEffect(() => {
        if(socket === null || quill === null) return;
        quill.on('text-change', function(delta, oldDelta, source) {
            if (source === 'api') {
              return;
            } else if (source === 'user') {
              socket.emit("changes", delta);
            }
        });

        return () => {
            quill.off('text-change', function(delta, oldDelta, source) {
                if (source === 'api') {
                  return;
                } else if (source === 'user') {
                  socket.emit("changes", delta);
                }
            });
        }
    }, [socket, quill]);


    return (
        <div id = "editor"></div>
    )
}
