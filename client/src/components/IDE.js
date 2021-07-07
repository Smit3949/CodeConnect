import React,{ useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/css/css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/python/python';
import { useParams } from 'react-router';
import Peer from 'peerjs';


export default function IDE({}) {
    const {id: DocId} = useParams();
    const [socket,setSocket] = useState(null);
    const [html, setHtml] = useState('');
    const [css, setCss] = useState('');
    const [js, setJs] = useState(''); 
    const [cpp, setcpp] = useState(''); 
    const [java, setjava] = useState('');  
    const [python, setpython] = useState(''); 
    const [selected, setSelected] = useState('PYTHON');   
    const [peer, setPeer] = useState(null); 
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const videoGrid = document.getElementById('video-grid');
    const myVideo = document.createElement('video');
    const [video, setVideo] = useState(true);
    const peers = {};
    myVideo.muted = true;

    

    useEffect(() => {
        var TempSocket = io('http://localhost:3001');
        setSocket(TempSocket);

        const peer = new Peer(undefined, {
          host: 'localhost',
          port: 9000,
          path: '/'
        });
      
        setPeer(peer);
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
            setcpp(data.cpp);
            setjava(data.java);
            setpython(data.python);
        });
        socket.emit('get-document', DocId);
    }, [socket, DocId]);
      
    
    useEffect(() => {   
        if(socket === null) return;
        const updateContent = (delta) => {
            setHtml(delta.html);
            setCss(delta.css);
            setJs(delta.js);
            setcpp(delta.cpp);
            setjava(delta.java);
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
            'html': html,
            'css': css,
            'js': js,
            'cpp': cpp,
            'java':java,
            'python':python
        };
        socket.emit('save-document', data);
        socket.emit('changes', data);
    }, [socket, html,css,js,cpp,java,python]);

    function addVideoStream(video, stream) {
      video.srcObject = stream
      video.addEventListener('loadedmetadata', () => {
        video.play()
      })
        videoGrid.append(video)
    };
  
    function connectToNewUser(userId, stream) {
      const call = peer.call(userId, stream)
      const video = document.createElement('video')
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
      })
      call.on('close', () => {
        video.remove()
      })

      peers[userId] = call
    };

    useEffect(() => {
    
      if (socket == null) return;

      const myVideo = document.createElement('video')
      myVideo.muted = true

      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      }).then(stream => {
        addVideoStream(myVideo, stream)

        peer.on('call', call => {
          call.answer(stream)
          const video = document.createElement('video')
          call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
          })
        })

        socket.on('user-connected', userId => {
          connectToNewUser(userId, stream)
        })
      });

      socket.on('user-disconnected', userId => {
        if (peers[userId]) peers[userId].close()
      });

      peer.on('open', id => {
        socket.emit('join-room', DocId, id)
      });
        
    }, [socket,peer,video]);

  
  const RunCode = () => {
    var lang = selected;
    console.log(lang, input);
    var backend_url = 'https://api.hackerearth.com/v4/partner/code-evaluation/submissions/';

    var data = {
      "lang": lang,
      "source": python,
      "input": input,
      "memory_limit": 243232,
      "time_limit": 5,
      "context": "{'id': 213121}",
      "callback": "https://client.com/callback/"
    }


    var status;
    fetch(backend_url, {
            method: 'POST', 
            mode: 'cors', 
            cache: 'no-cache', 
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/json',
              'client-secret': '0b281b4a748997e754b1c8afd4dbfb64fb2835ea'
            },
            redirect: 'follow', 
            referrerPolicy: 'no-referrer', 
            body: JSON.stringify(data)
    })
    .then((res) => res.json())
    .then((data) => 
    {
      status = data.status_update_url;
      console.log(data);

      fetch(status, {
            method: 'GET', 
            mode: 'cors', 
            cache: 'no-cache', 
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/json',
              'client-secret': '0b281b4a748997e754b1c8afd4dbfb64fb2835ea'
            },
            redirect: 'follow', 
            referrerPolicy: 'no-referrer', 
      })
      .then((res) => res.json())
      .then((data) => 
      {
        console.log(data);
        fetch(status, {
            method: 'GET', 
            mode: 'cors', 
            cache: 'no-cache', 
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/json',
              'client-secret': '0b281b4a748997e754b1c8afd4dbfb64fb2835ea'
            },
            redirect: 'follow', 
            referrerPolicy: 'no-referrer', 
        })
        .then((res) => res.json())
        .then((data) => 
        {
          console.log(data.result.run_status.output);
          var goToOutput = data.result.run_status.output;
          
        })
        .catch(e => console.log(e));
      })
      .catch(e => console.log(e));
    })
    .catch(e => console.log(e));
    

    
    
    
    
  };
    return (
        <div id = "editor">  
          {
            selected==='CPP' && 
            <section className="playground">
              <div className="code-editor">
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
          }
          {
            selected === 'JAVA' && 
            <section className="playground">
            <div className="code-editor">
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
          }
          {
            selected === 'PYTHON' &&
            <section className="playground">
              <div className="code-editor">
                <div className="editor-header">python</div>
                <CodeMirror className="codemirror"
                  value={python}
                  options={{
                    mode: "python",
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
          }
          <section className="result">
            <div id="video-grid"></div>
            <textarea onChange={(e) => { setInput(e.target.value) }} value={ input } rows="4" cols="50">
            </textarea>
            
            <textarea onChange={(e) => { setOutput(e.target.value) }} value={ output } rows="4" cols="50">
            </textarea>
           <button onClick={RunCode}>RUN</button>
          <button onClick={() => { setVideo(!video)}}> Video </button>
            
          </section>  
       
        </div>
    )
}
