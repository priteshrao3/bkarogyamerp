import React from "react";
import { displayMessage, getOuterAPI, interpolate, makeURL, postOuterAPI } from "../../../utils/common";
import { MEETING_JOINEE, SINGLE_MEETING } from "../../../constants/api";
import PermissionDenied from "../../common/errors/PermissionDenied";
import SocketContext from "./SocketContext";
import _get from "lodash/get";
import { Button, Col, Drawer, Popover, Row, Spin } from "antd";
import Jitsi from "react-jitsi";
import WebCallChat from "./WebCallChat";
import { ERROR_MSG_TYPE, WARNING_MSG_TYPE } from "../../../constants/dataKeys";
import io from "socket.io-client";
import { checkUserAuthorisation } from "../../../utils/meetingWrapperUtils";

let signalingSocket = null;
let peers = {};
export default class MeetingWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            joineeAllowed: false,
            joineeDetail: null,
            SIGNALING_SERVER: process.env.REACT_APP_MEETING_WS_SIGNALING_SERVER,
            MUTE_CHANNEL: false,
            userAuthDetails: null,
            userDetails: {}
        };
    }

    componentDidMount() {
        this.meeting = null;
        let that = this;
        if (this.props.match.params && this.props.match.params.meetingId) {
            let pairValueObject = {};
            if (this.props.history && this.props.history.location.search) {
                const pairValueArray = this.props.history.location.search.substr(1).split("&");
                if (pairValueArray.length) {
                    pairValueArray.forEach(function(item) {
                        pairValueObject[(item.split("="))[0]] = ((item.split("="))[1]);
                    });
                }
            }
            let authSuccessCallBack = function() {
                that.loadMeeting(that.props.match.params.meetingId);
            };
            that.setState({ ...pairValueObject }, function() {
                checkUserAuthorisation(that, authSuccessCallBack);
            });
            // that.props.history.replace("/meeting/" + that.props.match.params.meetingId);
        }
    }


    loadMeeting = (meetingId) => {
        const that = this;
        that.setState({
            loadingMeetingDetails: true
        });
        const successFn = function(data) {
            let admin = false;
            data.admins.forEach(function(doctor) {
                if (that.state.userAuthDetails.staff && that.state.userAuthDetails.staff.id == doctor) {
                    admin = true;
                }
            });
            that.setState({
                meetingDetails: data,
                is_admin: admin,
                loadingMeetingDetails: false
            }, function() {
                that.registerJoinee();
            });
        };
        const errorFn = function() {
            that.setState({
                loadingMeetingDetails: false
            });
        };
        getOuterAPI(makeURL(interpolate(SINGLE_MEETING, [meetingId])), successFn, errorFn,{},{Authorization:`Token ${that.state.token}`});
    };

    handleLoad = (JitsiMeeting) => {
        this.meeting = JitsiMeeting;
        let { meetingDetails, is_admin } = this.state;
        if (is_admin) {

        } else {
            JitsiMeeting.addEventListeners({
                "audioMuteStatusChanged": (value) => this.audioMuteStatusChanged(value.muted),
                "videoConferenceLeft": this.meetingSuspended,
                "suspendDetected": this.meetingSuspended,
                "readyToClose": this.meetingSuspended
            });
        }
//         //it will fire only for guests
//         JitsiMeeting.on('passwordRequired', () => {
//             JitsiMeeting.executeCommand('password', meetingDetails.meeting_id)
//         });
//
// //this will setup the password for 1st user
//         JitsiMeeting.on('participantRoleChanged', (event) => {
//             if (event.role === 'moderator') {
//                 JitsiMeeting.executeCommand('password', meetingDetails.meeting_id)
//             }
//         })
        JitsiMeeting.executeCommand("subject", meetingDetails.name);
        this.initSockets();
    };
    meetingSuspended = () => {
        this.meeting.executeCommand("hangup");
        this.meeting.dispose();
        window.location.href= "/erp/meeting";
    };

    registerJoinee = () => {
        const { meetingDetails, joineeDetail } = this.state;
        const that = this;
        const reqData = {
            meeting: meetingDetails.id,
            is_active: true,
        };
        if(this.state.patient){
            reqData.patient = that.state.userAuthDetails ? that.state.userAuthDetails.patient.id : null
        }else{
            reqData.staff = that.state.userAuthDetails ? that.state.userAuthDetails.staff.id : null
        }
        const successFn = function(data) {
            that.setState({
                joineeDetail: data,
                joineeAllowed: (data.is_allowed || !data.is_blocked)
                //TODO: Need to change this restriction
            });
        };
        const errorFn = function() {

        };
        postOuterAPI(makeURL(MEETING_JOINEE), reqData, successFn, errorFn,{Authorization:`Token ${that.state.token}`});
    };
    toggleChat = (option)=>{
        this.setState({
            showChatDrawer:!!option
        })
    }
    render() {
        const { meetingDetails, joineeDetail, joineeAllowed, is_admin, MUTE_CHANNEL, loadingMeetingDetails, socketConnected, userAuthDetails, loadingAuthUser,showChatDrawer } = this.state;
        let extraDetails = {};
        if (!userAuthDetails && loadingAuthUser) {
            return <LoadingSpinner tip={"Authenticating User.."}/>;
        } else if (!meetingDetails && loadingMeetingDetails) {
            return <LoadingSpinner tip={"Loading Meeting Details.."}/>;
        }
        if (!joineeAllowed && joineeDetail) {
            return <>
                <div style={{ width: "100%", height: "calc(100vh - 110px)" }}>
                    <PermissionDenied/>
                </div>
            </>;
        }
        if (meetingDetails && joineeDetail)
            return <>
                <SocketContext.Provider value={signalingSocket}>
                    <div style={{ width: "100%", height: "calc(100vh - 60px)", textAlign: "center" }}>
                        <Jitsi domain={process.env.REACT_APP_JITSI_BASE_URL}
                               onAPILoad={this.handleLoad}
                               displayName={_get(this.state.userAuthDetails, "first_name")}
                               userInfo={{
                                   name: this.state.userAuthDetails.first_name,
                                   displayName: this.state.userAuthDetails.first_name,
                                   email: this.state.userAuthDetails.email
                               }}
                               containerStyle={{ width: "100%", height: "100%" }}
                               roomName={`${meetingDetails.id}`}
                               interfaceConfig={{ disableInviteFunctions: true }}
                               config={{ disableDeepLinking: true }}
                               disableInviteFunctions={true}
                               {...extraDetails}
                        />
                    </div>
                    <Row style={{
                        background: "#474747",
                        textAlign: "center",
                        padding: "10px",
                        backgroundImage: " linear-gradient(to top,rgba(0,0,0,1),rgba(0,0,0,0.6))"
                    }}>
                        <Col span={20}>
                            {/*<Popover placement="topLeft" title={"Participants"} content={"j"} trigger="click">*/}
                            {/*    <Button type={"link"} style={{ float: "left" }}>Participants</Button>*/}
                            {/*</Popover>*/}
                             <Button.Group>
                                 {is_admin ?  <Button icon={"audio"} type={"primary"}
                                        onClick={() => this.muteAllToggle(!MUTE_CHANNEL)}>{MUTE_CHANNEL ? "Unmute All" : "Mute All"}</Button> : null}
                                <Button icon={"mic"} type={"danger"} onClick={this.meetingSuspended}>Hang up</Button>
                            </Button.Group>

                        </Col>
                        <Col xs={4} sm={4} md={4}>
                            <Button type={"link"} style={{ float: "right" }} icon={"message"} onClick={()=>this.toggleChat(true)}>Chat</Button>
                            <Drawer visible={showChatDrawer} onClose={()=>this.toggleChat(false)} title={"Chat"} mask={false}>
                                <SocketContext.Consumer>
                                    {socket => (
                                        <WebCallChat
                                            meeting={meetingDetails.id}
                                            joinee={joineeDetail.id}
                                            socket={socket}
                                            is_admin={is_admin}
                                            token={this.state.token}
                                            fullScreen={true}
                                        />
                                    )}
                                </SocketContext.Consumer>
                            </Drawer>
                        </Col>
                    </Row>
                </SocketContext.Provider>
            </>;
        return <div style={{ width: "100%", height: "calc(100vh - 110px)", textAlign: "center", marginTop: "40vh" }}>
            <Spin size="large" tip={"Loading Meeting. Please wait..."}/></div>;
    }

    muteAllToggle = (option) => {
        const { meetingDetails } = this.state;
        if (!this.state.is_admin) {
            displayMessage(WARNING_MSG_TYPE, "You are not allowed for this action.");
            return false;
        }
        signalingSocket.send({ admin: null, peer_id: "admin", channel: meetingDetails.id, mute: option });
    };

    audioMuteStatusChanged = (option) => {
        console.log(option, this.state.MUTE_CHANNEL);
        let that = this;
        if (this.state.MUTE_CHANNEL && option != this.state.MUTE_CHANNEL && !this.state.is_admin) {
            // setTimeout(function(){
            displayMessage(ERROR_MSG_TYPE, "You are not allowed unmute. Raise your hand.");
            that.meeting.executeCommand("toggleAudio");
            // },1)
        }

    };
    initSockets = () => {
        const that = this;
        console.log("Connecting to signaling server");
        const { SIGNALING_SERVER, DEFAULT_CHANNEL, ICE_SERVERS, MUTE_CHANNEL, is_admin, meetingDetails } = this.state;
        signalingSocket = io(SIGNALING_SERVER);
        signalingSocket.on("message", function(data) {
            console.log("userDetails", data);
            console.log("admin", data.admin);
            that.setState({
                meetingUserDetails: data,
                MUTE_CHANNEL: !!data.mute
            });
            that.meeting.isAudioMuted().then(muted => {
                if (data.mute != muted && !is_admin)
                    that.meeting.executeCommand("toggleAudio");
            });

        });

        signalingSocket.on("connect", function() {
            that.setState({
                socketConnected: true
            });
            join_chat_channel(meetingDetails.id, { "whatever-you-want-here": "stuff" });
            console.log("Connected to signaling server");
        });
        signalingSocket.on("disconnect", function() {
            console.log("Disconnected from signaling server");
            peers = {};
        });
        signalingSocket.on("channel_joined", function(config) {
            let peer_id = config.peer_id;
            const userData = { ...that.state.userAuthDetails, peer_id, channel: DEFAULT_CHANNEL };
            if (that.state.is_admin || userData.is_superuser) {
                userData.admin = true;
                signalingSocket.send({ admin: peer_id, peer_id: "admin", channel: DEFAULT_CHANNEL });
            }
            that.setState({
                myPeerId: config.peer_id
            });
            signalingSocket.send(userData);
        });

        function join_chat_channel(channel, userdata) {
            signalingSocket.emit("join", { "channel": channel, "userdata": userdata });

        }

        function part_chat_channel(channel) {
            signalingSocket.emit("part", channel);
        }


        /**
         * When we join a group, our signaling server will send out 'addPeer' events to each pair
         * of users in the group (creating a fully-connected graph of users, ie if there are 6 people
         * in the channel you will connect directly to the other 5, so there will be a total of 15
         * connections in the network).
         */
        signalingSocket.on("addPeer", function(config) {
            console.log("Signaling server said to add peer:", config);
            const { peer_id } = config;
            if (peer_id in peers) {
                /* This could happen if the user joins multiple channels where the other peer is also in. */
                console.log("Already connected to peer ", peer_id);
                return;
            }
        });


        /**
         * When a user leaves a channel (or is disconnected from the
         * signaling server) everyone will recieve a 'removePeer' message
         * telling them to trash the media channels they have open for those
         * that peer. If it was this client that left a channel, they'll also
         * receive the removePeers. If this client was disconnected, they
         * wont receive removePeers, but rather the
         * signalingSocket.on('disconnect') code will kick in and tear down
         * all the peer sessions.
         */
        signalingSocket.on("removePeer", function(config) {
            console.log("Signaling server said to remove peer:", config);
            const { peer_id } = config;
            // peers[peer_id].close();
            // delete peers[peer_id];
            that.setState(function(prevState) {
                const availablePeers = { ...prevState.availablePeers };
                // delete availablePeers[peer_id];
                return { availablePeers: { ...availablePeers } };
            }, function() {

            });

        });
    };
};

function LoadingSpinner(props) {
    return <div style={{ width: "100%", height: "calc(100vh - 110px)", textAlign: "center", marginTop: "40vh" }}>
        <Spin size="large" tip={props.tip || "Loading..."}/>
    </div>;
}
