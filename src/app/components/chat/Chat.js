import {Affix, Button, Card, Col, Row} from "antd";
import '../../assets/chat.css'
import React from "react";

export default class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chatBoxOpen: false
        }
    }

    toggleChatBox = (option) => {
        this.setState({
            chatBoxOpen: !!option
        })
    }

    render() {
        const {chatBoxOpen} = this.state;
        return <div>
                <div className="chatbox-wrapper">
                    <Row>
                        <Col span={24}>
                            {chatBoxOpen?

                                <Card className="chatbot-card">
                                    <Button type={"danger"} icon="close" shape="circle"
                                            style={{float: "right", position:"absolute",top: -35,right:0}} onClick={() => this.toggleChatBox(false)} size={"small"}/>
                                    {/*<ChatBotLeftText message={"Hello"}/>*/}
                                    {/*<ChatBotRightText message={"Hi"}/>*/}
                                    {/*<ChatBotLeftText message={"How Can I help You?"}/>*/}
                                    {/*<ChatBotRightText message={"I have fever. Suggest me some good medicines for this"}/>*/}
                                    {/*<ChatBotLeftText message={"Take Crocin"}/>*/}
                                    {/*<ChatBotRightText message={"No! I dont want to eat it."}/>*/}
                                    {/*<ChatBotLeftText message={"How Can I help You?"}/>*/}
                                    {/*<ChatBotRightText message={"I have fever. Suggest me some good medicines for this"}/>*/}
                                    {/*<ChatBotLeftText message={"Take Crocin"}/>*/}
                                    {/*<ChatBotRightText message={"No! I dont want to eat it."}/>*/}
                                    <iframe
                                        allow="microphone;"
                                       style={{width:'100%',height:'100%'}}
                                        src="https://console.dialogflow.com/api-client/demo/embedded/62d2a9f4-909e-4519-b3b6-49a162b6aeb1">
                                    </iframe>
                                </Card>:
                            <Button type={"primary"} icon="audit" shape="circle"
                                    style={{float: "right", marginRight: 50}} onClick={() => this.toggleChatBox(true)} size={"large"}/>}
                        </Col>
                    </Row>
                </div>
        </div>
    }
}

function ChatBotLeftText (props){
    return <Row>
        <Col span={24}>
            <Card className="chatbox-chatmessage-wrapper left">
                {props.message}
            </Card>
        </Col>
    </Row>
}

function ChatBotRightText (props){
    return <Row>
        <Col span={24}>
            <Card className="chatbox-chatmessage-wrapper right" >
                {props.message}
            </Card>
        </Col>
    </Row>
}
