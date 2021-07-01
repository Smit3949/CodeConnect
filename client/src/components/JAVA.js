import React,{ useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/clike/clike';
import { useParams } from 'react-router';

export default function JAVA() {
    const {id: DocId} = useParams();
    const [socket,setSocket] = useState(null);
    const [java, setjava] = useState('');  
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
            setjava(data.java);
        });

        socket.emit('get-document', DocId);

    }, [socket, DocId]);

    
    useEffect(() => {   

        if(socket === null) return;
        const updateContent = (delta) => {
            setjava(delta.java);
        };
        socket.on('receive-changes', updateContent);
        return () => {
            socket.off('receive-changes', updateContent);
        }

    }, [socket]);

    useEffect(() => {
        if(socket === null) return;
        var data = {
            'java': java,
        };
        socket.emit('save-document', data);
        socket.emit('changes', data);
    }, [socket,java]);
    return (
        <div id = "editor">
            <section className="playground">
              <div className="code-editor-java java-code">
                <div className="editor-header">java</div>
                <CodeMirror
                  value={java}
                  options={{
                    mode: "text/x-java",
                    theme: 'material',
                    lineNumbers: true,
                    scrollbarStyle: null,
                    lineWrapping: true,
                  }}
                  onBeforeChange={(editor, data, java) => {
                    setjava(java);
                  }}
                />
              </div>
              </section>
              <div id="video-grid"></div>
        </div>
    )
}
