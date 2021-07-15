import React from 'react';
import ReactDOM from 'react-dom';
import Draggable, { DraggableCore } from 'react-draggable';


const videoRoot = document.getElementById('video-root');

export default function VideoTile() {
    return (
        <VideoGrid>
            <Draggable
                axis="both"
                handle="#video-grid"
                defaultPosition={{ x: 0, y: 0 }}
                position={null}
                grid={[1, 1]}
                scale={1}
            // bounds={{ left: 0, top: 0, right: window.innerWidth - 200, bottom: window.innerHeight - 200 }}
            >
                <div id="video-grid"></div>
            </Draggable>
        </VideoGrid>
    )
}

class VideoGrid extends React.Component {
    constructor(props) {
        super(props);
        this.el = document.createElement('div');
    }

    componentDidMount() {
        videoRoot.appendChild(this.el);
    }

    componentWillUnmount() {
        videoRoot.removeChild(this.el);
    }

    render() {
        return ReactDOM.createPortal(
            this.props.children,
            this.el,
        );
    }
}