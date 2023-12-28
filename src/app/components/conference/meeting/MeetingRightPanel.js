import React from "react";
import {Icon, Divider, Spin, List, Avatar, Popover} from "antd";
import moment from "moment";
import EventMeetingPopover from "./EventMeetingPopover";
import {getAPI} from "../../../utils/common";
import {MEETING_DETAILS} from "../../../constants/api";

export default class MeetingRightPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading:false
        }

    }

    componentWillReceiveProps() {
        this.loadTodayMeeting();

    }


    loadTodayMeeting(){
        const that=this;
        this.setState({
            loading:true,
        });
        const successFn =function (data) {
            that.setState({
                filterMeetingList:data,
                loading:false,
            })
        };
        const errorFn = function () {
            that.setState({
                loading:false,
            });
        };
        const params={
            start: moment().startOf('day').format(),
            end: moment().endOf('day').format(),
        };

        getAPI(MEETING_DETAILS, successFn, errorFn, params);
    }


    render() {
        const that = this;
        const {filterMeetingList} =this.state;
        console.log("===",filterMeetingList);
        return (
<div>
            <Divider>
                <a type="primary"><Icon type="left" /></a> Meeting's Schedule <a type="primary"><Icon type="right" /></a>
            </Divider>

            <Spin spinning={this.props.loading}>
                <List
                  dataSource={filterMeetingList}
                  bordered
                  renderItem={meeting => (
                          <List.Item>

                              <MeetingCard {...meeting} />
                          </List.Item>
                      )}
                />
            </Spin>
</div>
)
    }
}

function MeetingCard(meeting) {

    return (
<div style={{width: '100%'}}>
        <p style={{marginBottom: 0}}>
            <Popover
              placement="right"
              content={(
<EventMeetingPopover
  meetingId={meeting.id}
  key={meeting.id}
/>
)}
            >
            <span style={{width: 'calc(100% - 60px)'}}><b>{moment(meeting.start).format("LT")}</b>&nbsp;
                {meeting.name}
            </span>
            </Popover>


        </p>
</div>
);
}


