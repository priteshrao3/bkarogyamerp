import {Button, Col, Divider, Modal, Popconfirm, Result, Row, Spin, Typography} from "antd";
import React from "react";
import {SINGLE_MEETING} from "../../../constants/api";
import {displayMessage, getAPI, interpolate} from "../../../utils/common";
import {SUCCESS_MSG_TYPE} from "../../../constants/dataKeys";
import EditPatientMeetingNotes from "./EditPatientMeetingNotes";

const {Paragraph} = Typography;
export default class EventMeetingPopover extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            meeting: null,
            editReviewModalVisible: false
        }
    }

    componentDidMount() {
        this.loadMeetingDetails();
    }

    loadMeetingDetails = () => {
        const that = this;
        that.setState({
            loading: true
        })
        const successFn = function (data) {
            that.setState({
                loading: false,
                meeting: data
            })
        }
        const errorFn = function () {
            that.setState({
                loading: false,
            })
        }
        getAPI(interpolate(SINGLE_MEETING, [that.props.meetingId]), successFn, errorFn);
    }

    openWindowLink = (link) => {
        window.open(link)
    }

    copyToClipBoard(meeting) {

        navigator.clipboard.writeText(meeting);
        displayMessage(SUCCESS_MSG_TYPE, "Meeting URL & Password copied to clipboard")
    }

    toggleEditReviewModal = (option) => {
        this.setState({
            editReviewModalVisible: !!option
        })
        this.props.handleVisibleChange(false)
    }

    render() {
        if (!this.state.meeting) {
            return (
                <Result
                  status="warning"
                  title="Meeting Not Found"
                />
            )
        }
        const that = this;
        let patientCount=1; let doctorCount=1; let adminCount=1;
        return (
            <div style={{width: '400px', minHeight: '200px', overflowY: 'scroll', overflowX: 'hidden'}}>
                <Spin spinning={this.state.loading}>
                    <div>
                        <h3>{this.state.meeting.name}</h3>
                        <Paragraph ellipsis={{rows: 3, expandable: true}}>{this.state.meeting.purpose}</Paragraph>
                        <Row gutter={16}>
                            <Col span={8}>
                                <h4>Admins</h4>
                                <Paragraph ellipsis={{
                                    rows: 3,
                                    expandable: true
                                }}
                                >
                                    {this.state.meeting.admins_data.map(admin => {
                                        return <> {adminCount++}.&nbsp;{admin.user.first_name}<br />  </>
                                    })}
                                </Paragraph>
                            </Col>
                            <Col span={8}>
                                <h4>Doctors</h4>
                                <Paragraph ellipsis={{
                                    rows: 3,
                                    expandable: true
                                }}
                                >
                                    {this.state.meeting.doctors_data.map(admin => {
                                        return <> {doctorCount++}.&nbsp;{admin.user.first_name}<br />  </>
                                    })}
                                </Paragraph>
                            </Col>
                            <Col span={8}>
                                <h4>Patients</h4>
                                <Paragraph ellipsis={{
                                    rows: 3,
                                    expandable: true
                                }}
                                >
                                    {this.state.meeting.patients_data.map(admin => {
                                        return <> {patientCount++}.&nbsp;{admin.user.first_name}<br />  </>
                                    })}
                                </Paragraph>
                            </Col>
                        </Row>
                        <Popconfirm
                          title="Are you sure to start this meeting?"
                          onConfirm={() => that.openWindowLink(`/erp/webcall/${this.state.meeting.id}`)}
                          okText="Yes"
                          cancelText="No"
                        >
                            <a>Meeting Link</a>
                        </Popconfirm>
                        {/* <Divider style={{margin: 0}}>Invite Link</Divider> */}
                        {/* <p>{directMeetingLink}<br/>Password: {this.state.meeting.password}</p> */}
                        <Button
                          size="small"
                          onClick={() => this.copyToClipBoard(`${process.env.PUBLIC_URL}/erp/webcall/${this.state.meeting.id}`)}
                          block
                          shape="round"
                        >Copy Link
                        </Button>

                    </div>
                </Spin>
                <Row>
                    <Divider />
                    <Button onClick={() => this.toggleEditReviewModal(true)}>Edit Meeting Review Note for
                        Patient
                    </Button>
                </Row>
                <Modal
                  visible={this.state.editReviewModalVisible}
                  onCancel={() => this.toggleEditReviewModal(false)}
                  footer={null}
                  title="Add/Edit Meeting Call Notes"
                >
                    {this.state.editReviewModalVisible ? (
                        <EditPatientMeetingNotes
                          {...this.props}
                          meetingId={this.state.meeting.id}
                          loadData={() => this.toggleEditReviewModal(false)}
                        />
                      ) : null}
                </Modal>
            </div>
        )
    }
}
