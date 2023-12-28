import React from "react";
import {Icon, Popover} from "antd";
import EventMeetingPopover from "./EventMeetingPopover";

export default class MeetingEventComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
        };
    }

    handleVisibleChange = visible => {
        this.setState({ visible });
    };

    render() {
        const that = this;
        return (
            <Popover
              placement="right"
              content={(
                    <EventMeetingPopover
                      meetingId={this.props.event.id}
                      key={this.props.event.id}
                      {...that.props}
                      handleVisibleChange={this.handleVisibleChange}
                    />
                )}
              trigger="hover"
              visible={this.state.visible}
              onVisibleChange={this.handleVisibleChange}
            >
                <div style={{color: 'white', height: '100%'}}>
                    <h1 style={{color: 'white'}}><Icon type="user" />{this.props.event.name}</h1>
                </div>
            </Popover>
        )
    }
}

