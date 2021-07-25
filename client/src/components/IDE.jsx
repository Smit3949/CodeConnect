import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
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
import logo from '../images/logo.svg';
import upArrow from '../images/icons/up-arrow.svg';
import runIcon from '../images/icons/run.svg';
import closeIcon from '../images/icons/close.png';
import muteIcon from '../images/icons/mute.svg';
import videoIcon from '../images/icons/video.svg';
import phoneIcon from '../images/icons/phone.svg';


export default function IDE({ }) {
  const { id: DocId } = useParams();
  const [socket, setSocket] = useState(null);
  const [cpp, setcpp] = useState('');
  const [java, setjava] = useState('');
  const [python, setpython] = useState('');
  const [selected, setSelected] = useState('PYTHON');
  const [peer, setPeer] = useState(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [modal, setModal] = useState(false);
  const [username, setUsername] = useState('smit'); 
  const outputRef = useRef(null);
  const videoGrid = document.getElementById('video-grid');
  const myVideo = document.createElement('video');
  myVideo.className = "rounded mb-4"
  myVideo.muted = true;
  const [myStream, setMystream] = useState(null);
  const peers = {};
  const canvasRef = useRef(null);
  const colorsRef = useRef(null);
  const [userId, setUserId] = useState(null);



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
    socket.emit('get-document', DocId);
    socket.once('load-document', (data) => {
      setcpp(data.cpp);
      setjava(data.java);
      setpython(data.python);
    });

  }, [socket, DocId]);


  useEffect(() => {
    if (socket === null) return;
    var updateC = (delta) => {
     setpython(delta.python);
     setjava(delta.java);
     setcpp(delta.cpp); 
    }
    socket.on('receive-changes', updateC);
    return () => {
      socket.off('receive-changes', updateC);
    }
  }, [socket, cpp, java, python]);

  useEffect(() => {
    if (socket === null) return;
    var data = {
      'cpp': cpp,
      'java': java,
      'python': python
    };

    var savetodb = setTimeout(() => {socket.emit('save-document', data); socket.emit('changes', data);}, 2000);
    
    return () =>{
      clearTimeout(savetodb);
    };
    
  }, [socket, cpp, java, python]);


  function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    })
    videoGrid.append(video);
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

      socket.on('user-connected', (userId, username) => {
        const call = peer.call(userId, stream);
        console.log('user connected : ', username);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
        const video = document.createElement('video');
        call.on('stream', (anotherUserVideoStream) => {

          console.log(anotherUserVideoStream.getAudioTracks());
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
      setUserId(id);
      socket.emit('join-room', DocId, id, username);
    });

  }, [socket, DocId, peer]);

  const muteMic = () => {
    myStream.getAudioTracks()[0].enabled = !(myStream.getAudioTracks()[0].enabled);
    socket.emit('toggled', userId, myStream.getVideoTracks()[0].enabled, myStream.getAudioTracks()[0].enabled);
  }

  const muteCam = () => {
    if(socket === null) return;
    myStream.getVideoTracks()[0].enabled = !(myStream.getVideoTracks()[0].enabled);
    socket.emit('toggled', userId, myStream.getVideoTracks()[0].enabled, myStream.getAudioTracks()[0].enabled);
  }

  useEffect(() => {
    if(socket === null) return;
    socket.on('received-toggled-events', (userId, video, audio) => {
      console.log(userId, video, audio);
    });
  })
  

  useEffect(() => {


    if (socket === null || colorsRef === null) return;
    const canvas = document.getElementById('whiteboard-canvas')
    const test = colorsRef.current;
    const context = canvas.getContext('2d');

    const colors = document.getElementsByClassName('color');
    console.log(colors, 'the colors');
    console.log(test);
    const current = {
      color: 'black',
      width: 5,
    };

    const onColorUpdate = (e) => {
      current.color = e.target.className.split(' ')[1];
      if(current.color === 'black') current.width = 5;
      else current.width = 25;
    };

    for (let i = 0; i < colors.length; i++) {
      colors[i].addEventListener('click', onColorUpdate, false);
    }
    let drawing = false;


    const drawLine = (x0, y0, x1, y1, color, width, emit) => {
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.strokeStyle = color;
      context.lineWidth = width;
      context.stroke();
      context.closePath();

      if (!emit) { return; }
      const w = canvas.width;
      const h = canvas.height;
      console.log(w, h, window.width, window.height);


      socket.emit('drawing', {
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color,
        width
      });
    };



    const onMouseDown = (e) => {

      console.log(drawing + ' d');
      drawing = true;
      current.x = e.clientX || e.touches[0].clientX;
      current.y = e.clientY || e.touches[0].clientY;
    };

    const onMouseMove = (e) => {
      if (!drawing) { return; }
      drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, current.width, true);
      current.x = e.clientX || e.touches[0].clientX;
      current.y = e.clientY || e.touches[0].clientY;
    };

    const onMouseUp = (e) => {

      if (!drawing) { return; }
      drawing = false;
      drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, current.width, true);
    };
    const throttle = (callback, delay) => {
      let previousCall = new Date().getTime();
      return function () {
        const time = new Date().getTime();

        if ((time - previousCall) >= delay) {
          previousCall = time;
          callback.apply(null, arguments);
        }
      };
    };


    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
    canvas.addEventListener('mouseout', onMouseUp, false);
    canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

    canvas.addEventListener('touchstart', onMouseDown, false);
    canvas.addEventListener('touchend', onMouseUp, false);
    canvas.addEventListener('touchcancel', onMouseUp, false);
    canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);


    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', onResize, false);
    onResize();
    const onDrawingEvent = (data) => {
      const w = canvas.width;
      const h = canvas.height;
      drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.width);
    }
    socket.on('drawing', onDrawingEvent);
  }, [socket]);


  
  const runCode = () => {
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

  const toggleModal = () => {
    setModal(!modal);
  }

  return (
    <>
      <div className="flex">
      <div ref={colorsRef} className="colors">
        <button className="color black" >black</button>
        <button className="color white"> white</button>
      </div>
        <div className="h-screen flex flex-grow flex-col">
          <Header runCode={runCode} toggleModal={toggleModal} />
          <div className="flex-grow flex">
            <div id="editor" className="flex-grow flex flex-col">
              <FileTabs />
              <div className="h-96 overflow-y-auto">
                {
                  selected === 'CPP' &&
                  <section className="playground">
                    <div className="code-editor-cpp cpp-code h-full">
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
                    <div className="code-editor-java java-code h-full">
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
              <div className={`flex-grow ${modal ? "top-0" : " top-full"} duration-300 left-0 p-4 backdrop-filter backdrop-blur-sm absolute z-50 w-screen h-screen`}>
                {/* <textarea onChange={(e) => { setInput(e.target.value) }} value={input} rows="4" cols="50">
                </textarea>

                <textarea onChange={(e) => { setOutput(e.target.value) }} value={output} rows="4" cols="50">
                </textarea> */}
                
                <div className="absolute right-10 top-10">
                  <img onClick={toggleModal} src={closeIcon} className="w-6 cursor-pointer" alt="close icon" />
                </div>

                <canvas id="whiteboard-canvas" className="m-0 border h-full w-full bg-white rounded-xl border-black" />
              </div>
            </div>
            <RightVideoPanel muteCam={muteCam} muteMic={muteMic}/>
          </div>
        </div>
      </div>
    </>
  )
}


function Header({ runCode, toggleModal }) {
  return (
    <div className=" bg-purple-standard flex py-2 px-2 justify-end items-center">
      {/* <div className="h-16">
        <img className="h-full" src={logo} alt="codeconnect logo" />
      </div> */}
      <div className="flex">
        <button className=" text-white mr-4" onClick={toggleModal}>whiteboard</button>
        <button onClick={runCode} className="bg-orange-standard flex items-center text-base font-medium rounded px-3 py-1 mr-2">
          <img className="h-3" src={runIcon} alt="run code icon" />
          <span className="ml-2">Run</span>
        </button>
        <button className="bg-orange-standard border border-r rounded px-3 py-1 ml-2">
          Login/Register
        </button>
      </div>
    </div>
  )
}


function RightVideoPanel({muteCam, muteMic}) {
  
  return (
    <div className="flex flex-col items-center px-2 bg-purple-dark shadow-lg">
      <button><img className="h-4 my-2" src={upArrow} alt="scroll up arrow" /></button>
      <div className="flex flex-col items-center justify-center" id="video-grid"></div>
      <button><img className="h-4 my-2 transform rotate-180" src={upArrow} alt="scroll down arrow" /></button>
      <div className="flex items-center w-full justify-around mt-2">
        <button className="bg-orange-standard border border-r rounded-full h-8 w-8 p-1.5">
          <img src={muteIcon} alt="mute icon" />
        </button>
        <button className="bg-orange-standard border border-r rounded-full h-8 w-8 p-1.5">
          <img src={videoIcon}  onClick={muteCam} alt="video icon" />
        </button>
        <button className="bg-orange-standard border border-r rounded-full h-8 w-8 p-1.5">
          <img src={phoneIcon} onClick={muteMic} alt="phone icon" />
        </button>
      </div>
    </div>
  )
}

function FileTabs({ files }) {
  return (
    <div className="w-full">
      {
        files && files.map((file, index) => {
          return (
            <div className="flex flex-col items-center justify-center" key={index}>
              <div className="flex flex-col items-center justify-center">
                <div className="flex-grow flex-shrink-0">
                  <img className="h-4 my-2" src={file.icon} alt="file icon" />
                </div>
                <div className="flex-grow flex-shrink-0">
                  <span className="ml-2">{file.name}</span>
                </div>
              </div>
            </div>
          )
        })
      }
    </div>
  )
}