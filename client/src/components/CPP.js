import React,{ useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/clike/clike';
import { useParams } from 'react-router';

export default function CPP({}) {
    const {id: DocId} = useParams();
    const [socket,setSocket] = useState(null);
    const [cpp, setcpp] = useState('');  
    const outputRef = useRef(null);
    

    useEffect(() => {
        var TempSocket = io('http://localhost:3001');
        setSocket(TempSocket);

        return () => {
            TempSocket.disconnect();
        };
    }, []);


    useEffect(() => {
        if(socket == null) return;
        

        socket.once('load-document', (data) => {
            console.log(data);
            setcpp(data.cpp);
        });

        socket.emit('get-document', DocId);

    }, [socket, DocId]);

    
    useEffect(() => {   

        if(socket === null) return;
        const updateContent = (delta) => {
            setcpp(delta.cpp);
        };
        socket.on('receive-changes', updateContent);
        return () => {
            socket.off('receive-changes', updateContent);
        }

    }, [socket]);

    useEffect(() => {
        if(socket === null) return;
        var data = {
            'cpp': cpp,
        };
        socket.emit('save-document', data);
        socket.emit('changes', data);
    }, [socket,cpp]);

    return (
        <div id = "editor">
            <section className="playground">
              <div className="code-editor-cpp cpp-code">
                <div className="editor-header">CPP</div>
                <CodeMirror
                  value={cpp}
                  options={{
                    mode: "text/x-csrc",
                    theme: 'material',
                    lineNumbers: true,
                    scrollbarStyle: null,
                    lineWrapping: true,
                  }}
                  onBeforeChange={(editor, data, cpp) => {
                    setcpp(cpp);
                  }}
                />
              </div>
              </section>
              <div id="video-grid"></div>
        </div>
    )
}
