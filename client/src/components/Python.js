import React,{ useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/python/python';
import { useParams } from 'react-router';

export default function Python({}) {
    const {id: DocId} = useParams();
    const [socket,setSocket] = useState(null);
    const [python, setpython] = useState('');  
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
            setpython(data.python);
        });

        socket.emit('get-document', DocId);

    }, [socket, DocId]);

    
    useEffect(() => {   

        if(socket === null) return;
        const updateContent = (delta) => {
            setpython(delta.python);
        };
        socket.on('receive-changes', updateContent);
        return () => {
            socket.off('receive-changes', updateContent);
        }

    }, [socket]);

    useEffect(() => {
        if(socket === null) return;
        var data = {
            'python': python,
        };
        socket.emit('save-document', data);
        socket.emit('changes', data);
    }, [socket,python]);

    return (
        <div id = "editor">
            <section className="playground">
              <div className="code-editor-python python-code">
                <div className="editor-header">python</div>
                <CodeMirror
                  value={python}
                  options={{
                    mode: "python",
                    smartIndent: true, // smart indent
                    indentUnit: 4,
                    theme: 'material',
                    lineNumbers: true,
                    scrollbarStyle: null,
                    lineWrapping: true,
                  }}
                  onBeforeChange={(editor, data, python) => {
                    setpython(python);
                  }}
                />
              </div>
              </section>
              <div id="video-grid"></div>
        </div>
    )
}
