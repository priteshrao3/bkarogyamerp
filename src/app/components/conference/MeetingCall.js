import React from "react";
import { getAuthToken } from "../../utils/auth";
export default class MeetingCall extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            meetingId:null
        }
    }

    componentDidMount() {
        this.meeting = null;
        if (this.props.match.params && this.props.match.params.meetingId) {
            this.setState({
                meetingId:this.props.match.params.meetingId
            })
        }
    }



    render() {
        const {meetingId} = this.state;
        const token =getAuthToken();
        return <iframe src={`/erp/meeting/${meetingId}?token=${token}`} style={{ width: "100%", height: "calc(100vh - 90px)",textAlign:'center' }} allow="microphone; camera"/>;
    }

};
