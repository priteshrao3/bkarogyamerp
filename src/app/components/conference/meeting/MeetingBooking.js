import React from "react";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {Button, Card, Col, Dropdown, Icon, Menu, Row, Spin} from "antd";
import {Route, Switch} from "react-router";
import {Link} from "react-router-dom";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import {Calendar as BigCalendar, momentLocalizer, Navigate} from "react-big-calendar";
import moment from "moment";
import TimeGrid from "react-big-calendar/lib/TimeGrid";
import * as dates from "date-arithmetic";
import AddOrEditMeeting from "./AddOrEditMeeting";
import {getAPI} from "../../../utils/common";
import {MEETING_DETAILS} from "../../../constants/api";
import MeetingEventComponent from "./MeetingEventComponent";
import MeetingRightPanel from "./MeetingRightPanel";
import PermissionDenied from "../../common/errors/PermissionDenied";
import {CANCELLED_STATUS} from "../../../constants/hardData";

const DragAndDropCalendar = withDragAndDrop(BigCalendar);
const localizer = momentLocalizer(moment);
export default class MeetingBooking extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            selectedDate: moment(),
            selectedStartDate: moment().subtract(1, 'days'),
            selectedEndDate: moment().add(5, 'days'),
            meetingList: [],
            filterMeetingList: [],
            filterType: 'Zoom User',
        }
    }

    componentDidMount() {
        this.loadMeetingList();
    }

    onSelectSlot = (value) => {
        const that = this;
        const time = moment(value.start);
        if (value.action == "doubleClick") {
            that.setState({
                startTime: time,
                redirect: true
            });
            this.props.history.push('/erp/meeting-booking/add');
        }

    }

    onRangeChange = (e) => {
        const that = this;
        if (e.start && e.end) {

            if (moment(e.start).date() == 1) {
                this.setState({
                    selectedDate: moment(e.start),
                    selectedStartDate: moment(e.start),
                    selectedEndDate: moment(e.end),
                }, function () {
                    that.loadMeetingList();
                })
            } else {
                const newDate = moment(e.start);
                this.setState({
                    selectedDate: newDate.month(newDate.month() + 1).date(1),
                    selectedStartDate: moment(e.start),
                    selectedEndDate: moment(e.end),
                }, function () {
                    that.loadMeetingList();
                })
            }
        } else if (e.length) {
            if (e.length == 7) {
                this.setState({
                    selectedDate: moment(e[1]),
                    selectedStartDate: moment(e[0]).subtract(1, 'day'),
                    selectedEndDate: moment(e[e.length - 1]).add(1, 'day')
                }, function () {
                    that.loadMeetingList();
                });
            } else {
                this.loadMeetingList(moment(e[0]), moment(e[e.length - 1]));
                this.setState({
                    selectedDate: moment(e[0]),
                    selectedStartDate: moment(e[0]),
                    selectedEndDate: moment(e[e.length - 1])
                }, function () {
                    that.loadMeetingList();
                });
            }

        }
    };

    loadMeetingList = () => {
        const that = this;
        that.setState({
            loading: true
        });
        const successFn = function (data) {
            const eventList = [];
            data.forEach(function (meeting) {
                eventList.push({
                    ...meeting,
                    title: meeting.agenda,
                    start: new Date(meeting.start),
                    end: new Date(meeting.end),
                });
            });
            that.setState({
                meetingList: eventList,
                filterMeetingList: eventList,
                loading: false
            })
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        const params = {
            start: moment(this.state.selectedStartDate).startOf('day').format(),
            end: moment(this.state.selectedEndDate).endOf('day').format(),
        };
        // if (value){
        //     params.zoom_user=value;
        // }
        getAPI(MEETING_DETAILS, successFn, errorFn, params)
    };

    render() {
        const that = this;
        return (
            <div style={{margin: 20}}>
                <Switch>
                    <Route
                      exact
                      path='/erp/meeting-booking/add'
                      render={(route) => (that.props.activePracticePermissions || that.props.CreateMeeting ? (
                            <AddOrEditMeeting
                              {...this.state}
                              {...route}
                              {...this.props}
                              loadData={this.loadMeetingList}
                            />
                        ) : <PermissionDenied />)}
                    />

                    <Route
                      exact
                      path="/erp/meeting-booking/edit/:id"
                      render={(route) => (that.props.activePracticePermissions || that.props.UpdateMeeting ? (
                            <AddOrEditMeeting
                              {...route}
                              {...this.props}
                              {...this.state}
                              loadData={this.loadMeetingList}
                            />
                        ) : <PermissionDenied />)}
                    />

                    <Card
                      title="Meeting Booking"
                      extra={(
<Link to="/erp/meeting-booking/add"><Button type="primary"><Icon type="plus" /> Add
                            Booking
                                </Button>
</Link>
)}
                    >
                        <Spin size="large" spinning={this.state.loading}>
                            <Row gutter={16}>
                                <Col span={18}>
                                    <DragAndDropCalendar
                                      localizer={localizer}
                                      startAccessor="start"
                                      defaultView="week"
                                      step={10}
                                      timeslots={1}
                                      events={this.state.filterMeetingList}
                                      selectable
                                      date={new Date(this.state.selectedDate.format())}
                                      endAccessor="end"
                                      defaultDate={new Date()}
                                      views={{month: true, week: MyWeek, day: true}}
                                      onSelectSlot={this.onSelectSlot}
                                      style={{height: "calc(100vh - 85px)"}}
                                      onRangeChange={this.onRangeChange}
                                      components={{
                                            event(option) {
                                                return <MeetingEventComponent {...option} {...that.props} />
                                            }
                                        }}
                                    />
                                </Col>
                                <Col span={6}>
                                    <MeetingRightPanel {...this.props} {...this.state} />
                                </Col>
                            </Row>
                        </Spin>
                    </Card>
                </Switch>
            </div>
        )
    }
}


class MyWeek
    extends React
        .Component {
    render() {
        const {date} = this.props
        const range = MyWeek.range(date)

        return <TimeGrid {...this.props} range={range} eventOffset={15} />
    }
}

MyWeek.range = date => {
    const start = dates.add(date, -1, 'day')
    const end = dates.add(start, 6, 'day')
    let current = start
    const range = []
    while (dates.lte(current, end, 'day')) {
        range.push(current)
        current = dates.add(current, 1, 'day')
    }
    return range
}

MyWeek.navigate = (date, action) => {
    switch (action) {
        case Navigate.PREVIOUS:
            return dates.add(date, -3, 'day')

        case Navigate.NEXT:
            return dates.add(date, 3, 'day')

        default:
            return date
    }
}

MyWeek.title = date => {
    return ` ${date.toLocaleDateString()}`
}


function MonthEventWrapper(props) {
    return props.children;
}
