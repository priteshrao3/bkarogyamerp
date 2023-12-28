import React, { Component } from 'react';

export default class ChatBot extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div
                style={{
                    position: 'fixed',
                    right: '20px',
                    bottom: '55px',
                    zIndex: '20',
                }}
            >
                <iframe
                    width="350"
                    height="430"
                    allow="microphone;"
                    src="https://console.dialogflow.com/api-client/demo/embedded/62d2a9f4-909e-4519-b3b6-49a162b6aeb1"
                ></iframe>
            </div>
        );
    }
}
