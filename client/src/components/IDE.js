import React,{ useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/css/css';
import 'codemirror/mode/javascript/javascript';
import { useParams } from 'react-router';

export default function IDE({}) {
    const {id: DocId} = useParams();
    const [socket,setSocket] = useState(null);
    const [html, setHtml] = useState('');
    const [css, setCss] = useState('');
    const [js, setJs] = useState('');    
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
            setHtml(data.html);
            setCss(data.css);
            setJs(data.js);
        });

        socket.emit('get-document', DocId);

    }, [socket, DocId]);

    
    useEffect(() => {   
        if(socket === null) return;
        const updateContent = (delta) => {
            setHtml(delta.html);
            setCss(delta.css);
            setJs(delta.js);
        };
        socket.on('receive-changes', updateContent);
        return () => {
            socket.off('receive-changes', updateContent);
        }
    }, [socket]);

    useEffect(() => {
        if(socket === null) return;
        var data = {
            'html': html,
            'css': css,
            'js': js
        };
        socket.emit('save-document', data);
        socket.emit('changes', data);
    }, [socket,html,css,js]);

    const Resultcode = () => {
        console.log(html);
        const timeout = setTimeout(() => {
            const DOC = outputRef.current.contentDocument;
            const DOC_CON = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="ie=edge">
                <title>Document</title>
                <style>
                    ${css}
                </style>
                </head>
                <body>
                ${html}
        
                <script type="text/javascript">
                    ${js}
                </script>
                </body>
                </html>
            `;
            if(DOC === 'undefined') return;
            else{
                DOC.open();
                DOC.write(DOC_CON);
                DOC.close();
            }
            
        }, 1000); 

        return () => {
            clearTimeout(timeout);
        }
       
    };





    
    useEffect(() => {
        Resultcode();
    }, [html,css,js]);
    return (
        <div id = "editor">
            <section className="playground">
              <div className="code-editor html-code">
                <div className="editor-header">HTML</div>
                <CodeMirror
                  value={html}
                  options={{
                    mode: 'htmlmixed',
                    theme: 'material',
                    lineNumbers: true,
                    scrollbarStyle: null,
                    lineWrapping: true,
                  }}
                  onBeforeChange={(editor, data, html) => {
                    setHtml(html);
                  }}
                />
              </div>
              <div className="code-editor css-code">
                <div className="editor-header">CSS</div>
                <CodeMirror
                  value={css}
                  options={{
                    mode: 'css',
                    theme: 'material',
                    lineNumbers: true,
                    scrollbarStyle: null,
                    lineWrapping: true,
                  }}
                  onBeforeChange={(editor, data, css) => {
                    setCss(css);
                  }}
                />
              </div>
              <div className="code-editor js-code">
                <div className="editor-header">JS</div>
                <CodeMirror
                  value={js}
                  options={{
                    mode: 'javascript',
                    theme: 'material',
                    lineNumbers: true,
                    scrollbarStyle: null,
                    lineWrapping: true,
                  }}
                  onBeforeChange={(editor, data, js) => {
                    setJs(js);
                  }}
                />
              </div>
            </section>
            <section className="result">
              <iframe title="result" className="iframe" ref={outputRef} />
            </section>
        </div>
    )
}
