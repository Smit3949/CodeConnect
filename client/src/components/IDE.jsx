import React, { useEffect, useState, useRef } from 'react';
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
import VideoTile from './VideoTile';
import ResizablePanels from './Resizable';
import { ReactSketchCanvas } from "react-sketch-canvas";


export default function IDE({ }) {
  const { id: DocId } = useParams();
  const [socket, setSocket] = useState(null);
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');
  const [cpp, setcpp] = useState('');
  const [java, setjava] = useState('');
  const [python, setpython] = useState('');
  const [path, setPath] = useState([]);
  const [selected, setSelected] = useState('PYTHON');
  const [peer, setPeer] = useState(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const outputRef = useRef(null);
  const videoGrid = document.getElementById('video-grid');
  const myVideo = document.createElement('video');
  myVideo.muted = true;
  const [myStream, setMystream] = useState(null);
  const peers = {};
  const canvas = useRef(null);



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
    if (socket == null) return;


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
    if (socket === null) return;
    const updateContent = (delta) => {
      setHtml(delta.html);
      setCss(delta.css);
      setJs(delta.js);
      setcpp(delta.cpp);
      setjava(delta.java);
      setpython(delta.python);
      setPath(delta.path);
      canvas.current.loadPaths(delta.path);
    };
    socket.on('receive-changes', updateContent);
    return () => {
      socket.off('receive-changes', updateContent);
    }
  }, [socket]);

  useEffect(() => {
    if (socket === null) return;
    var data = {
      'html': html,
      'css': css,
      'js': js,
      'cpp': cpp,
      'java': java,
      'python': python
    };

    var data1 = {
      'html': html,
      'css': css,
      'js': js,
      'cpp': cpp,
      'java': java,
      'python': python,
      'path': path
    }
    socket.emit('save-document', data);
    socket.emit('changes', data1);
  }, [socket, html, css, js, cpp, java, python, path]);

  function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
      video.play()
    })
    videoGrid.append(video)
  };

  useEffect(() => {
    if (socket == null) return;

    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(stream => {
      addVideoStream(myVideo, stream);
      setMystream(stream);
      peer.on('call', cal => {
        cal.answer(stream);
        const video = document.createElement('video');

        cal.on('stream', (anotherUserVideoStream) => {
          addVideoStream(video, anotherUserVideoStream);
        });
      });


      socket.on('user-connected', (userId) => {
        const call = peer.call(userId, stream);
        const video = document.createElement('video');
        call.on('stream', (anotherUserVideoStream) => {
          addVideoStream(video, anotherUserVideoStream);
        });

        call.on('close', () => {
          video.remove();
        });
        peers[userId] = call;
      });


    });

    socket.on('user-disconnected', userId => {
      if (peers[userId]) peers[userId].close()
    });

    peer.on('open', (id) => {
      socket.emit('join-room', DocId, id);
    });

  }, [socket, DocId, peer]);




  const muteMic = () => {
    myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
  }

  const muteCam = () => {
    myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
  }

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
      .then((data) => {
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
          .then((data) => {
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
              .then((data) => {
                console.log(data.result.run_status.output);
                var goToOutput = data.result.run_status.output;

              })
              .catch(e => console.log(e));
          })
          .catch(e => console.log(e));
      })
      .catch(e => console.log(e));
  };
  const styles = {
    border: "0.0625rem solid #9c9c9c",
    borderRadius: "0.25rem"
  };

  const updateBoard = (update) => {
    console.log(update);
    setPath(update);
  }
  
  return (
    <div id="editor" className="h-screen">
      <ResizablePanels>
        <div className="h-full">
          {
            selected === 'CPP' &&
            <section className="playground h-full">
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
          }
          {
            selected === 'JAVA' &&
            <section className="playground h-full">
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
          }
          {
            selected === 'PYTHON' &&
            <section className="playground h-full">
              <div className="code-editor-java flex flex-col h-full mb-5 java-code">
                <div className="editor-header">python</div>
                <CodeMirror
                  value={python}
                  className="flex-grow"
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
        </div>
        <div>
          <section className="result">
            <VideoTile />
            <textarea onChange={(e) => { setInput(e.target.value) }} value={input} rows="4" cols="50">
            </textarea>

            <textarea onChange={(e) => { setOutput(e.target.value) }} value={output} rows="4" cols="50">
            </textarea>
            <button onClick={RunCode}>RUN</button>
            <button onClick = {muteMic}>Mute</button>
            <button onClick = {muteCam}>Video</button>
            <ReactSketchCanvas
              ref = {canvas}
              style={styles}
              width="600"
              height="400"
              strokeWidth={4}
              strokeColor="red"
              canvasColor="black"
              onUpdate = {updateBoard}
            />

          </section>
        </div>
      </ResizablePanels>

    </div>
  )
}