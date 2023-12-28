import React from "react";
import { Button, Card, Col, Input, List, Typography } from "antd";
import { joineeName } from "../../../utils/meetingUtils";
import { displayMessage, getAPI, getOuterAPI, makeURL, postAPI, postOuterAPI } from "../../../utils/common";
import { MEETING_CHAT } from "../../../constants/api";
import { ERROR_MSG_TYPE } from "../../../constants/dataKeys";

const { Text } = Typography;
export default class WebCallChat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chats: [],
            token: this.props.token,
            chatMessageString: null,
            meetingId: this.props.meeting,
            joineeId: this.props.joinee,
            is_admin: this.props.is_admin
        };
    }

    componentDidMount() {
        this.loadChatMessage();
        const that = this;
        const { socket } = this.props;
        if (socket)
            socket.on("chat", function(data) {
                console.log(data);
                that.loadChatMessage();
            });
    }

    loadChatMessage = (page = 1) => {
        const that = this;
        const meeting = this.state.meetingId;
        const successFn = function(data) {
            if (data.current == 1) {
                that.setState({
                    chats: data.results
                });
                if (that.el)
                    that.el.scrollIntoView({ behavior: "smooth" });

            } else {
                that.setState(function(prevState) {
                    return { chats: [...prevState.chats, ...data.results] };
                });
            }
        };
        const errorFn = function() {

        };
        getOuterAPI(makeURL(MEETING_CHAT), successFn, errorFn, {
            page,
            meeting
        }, { Authorization: `Token ${that.state.token}` });
    };

    sendChatMessage = (value) => {
        const { socket } = this.props;
        const { meetingId, joineeId, is_admin } = this.state;
        const that = this;
        const reqData = {
            meeting: meetingId,
            message: value,
            is_active: true,
            joinee: joineeId,
            is_public: !!is_admin
        };
        that.setState({
            sendingMessage: true
        });
        const successFn = function() {
            that.setState({
                chatMessageString: null,
                sendingMessage: false
            });
            socket.emit("chat", { message: value });
        };
        const errorFn = function() {
            displayMessage(ERROR_MSG_TYPE, "Message sending failed");
            that.setState({
                sendingMessage: false
            });
        };
        postOuterAPI(makeURL(MEETING_CHAT), reqData, successFn, errorFn, { Authorization: `Token ${that.state.token}` });

    };

    onChatMessageChange = (e) => {
        this.setState({
            chatMessageString: e.target.value
        });
    };

    updateChatMessageStatus = (messageObj, status) => {
        const that = this;
        const { socket } = this.props;
        const reqData = {
            ...messageObj,
            joinee: messageObj.joinee.id,
            is_public: !!status
        };
        const successFn = function() {
            that.loadChatMessage();
            socket.emit("chat", { message: "" });
        };
        const errorFn = function() {

        };
        postOuterAPI(makeURL(MEETING_CHAT), reqData, successFn, errorFn, { Authorization: `Token ${that.state.token}` });
    };

    render() {
        const that = this;
        const { chats, chatMessageString, is_admin, joineeId, sendingMessage } = this.state;
        const { fullScreen } = this.props;
        return (
            <>
                <div style={{ height: fullScreen ? "calc(100vh - 140px)" : 450, overflowY: "scroll" }}>
                    <List
                        size="small"
                        style={{ textAlign: "left", padding: "0px 6px" }}
                        dataSource={[...chats].reverse()}
                        renderItem={(item) => (
                            <List.Item size={"small"}>
                                <List.Item.Meta
                                    title={joineeName(item.joinee)}
                                    description={
                                        <Text {...(item.is_public == false && item.joinee.id != joineeId ? { delete: true } : {})}> {item.message}</Text>
                                    }
                                />
                                {!is_admin ? null : (
                                    <Button.Group size="small">
                                        {!item.is_public && (
                                            <Button
                                                icon="check"
                                                type="primary"
                                                size={"small"}
                                                onClick={() => this.updateChatMessageStatus(item, true)}
                                            />
                                        )}
                                        {(item.is_public == null || item.is_public) && (
                                            <Button
                                                icon="cross"
                                                type="danger"
                                                size={"small"}
                                                onClick={() => this.updateChatMessageStatus(item, false)}
                                            />
                                        )}
                                    </Button.Group>
                                )}
                            </List.Item>
                        )}
                    />
                    <div ref={el => {
                        that.el = el;
                    }}
                    />
                </div>
                <Input.Search
                    placeholder="Send Message..."
                    style={{ width: "100%", bottom: 0 }}
                    enterButton="Send"
                    loading={sendingMessage}
                    value={chatMessageString}
                    onChange={this.onChatMessageChange}
                    onSearch={value => this.sendChatMessage(value)}
                />
            </>
        );
    }

}
