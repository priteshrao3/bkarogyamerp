import React from "react";
import Webcam from "react-webcam";
import {Button} from "antd";

export default class WebCamField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    setRef = webcam => {
        this.webcam = webcam;
    };

    capture = () => {
        const imageSrc = this.webcam.getScreenshot();
        if(this.props.getScreenShot)
            this.props.getScreenShot(imageSrc);
    };

    render() {
        const videoConstraints = {
            width: 1280,
            height: 720,
            facingMode: "user"
        };
        return <div style={{width:680}}>
            <Webcam audio={false}
                    height={480}
                    width={640}
                    ref={this.setRef}
                    videoConstraints={videoConstraints}
                    screenshotFormat="image/jpeg"/>
            <Button onClick={this.capture}>Capture photo</Button>
        </div>
    }
}
