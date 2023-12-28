import React from "react";
import {APPLIED_CANDIDATES, APPLIED_SINGLE_CANDIDATE} from "../../../../constants/api";
import {displayMessage, getAPI, interpolate, makeFileURL} from "../../../../utils/common";
import {Button, Card, Col, Divider, Form, Modal, Row, Select, Statistic, Table} from "antd";
import InfiniteFeedLoaderButton from "../../../common/InfiniteFeedLoaderButton";
import {APPLIED_CANDIDATES_STATUS} from "../../../../constants/hardData";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {ERROR_MSG_TYPE, LABEL_FIELD, SELECT_FIELD, SUCCESS_MSG_TYPE} from "../../../../constants/dataKeys";
import moment from "moment";

export default class AppliedCandidates extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            candidateList: [],
            candidateCount: 0,
            loading: false,
            selectedStatus: null
        }
    }

    componentDidMount() {
        this.loadData();
    }

    loadData = (page = 1) => {
        let that = this;
        this.setState({
            loading: false
        });
        let successFn = function (data) {
            that.setState(function (prevState) {
                if (data.current == 1) {
                    return {
                        loading: false,
                        candidateList: data.results,
                        candidateCount: data.count,
                        nextPage: data.next
                    }
                }
                return {
                    loading: false,
                    candidateList: [...prevState.candidateList, ...data.results],
                    candidateCount: data.count,
                    nextPage: data.next
                }
            })
        }
        let errorFn = function () {

        }
        let apiParams = {};
        if (this.state.selectedStatus)
            apiParams.status = this.state.selectedStatus;
        getAPI(APPLIED_CANDIDATES, successFn, errorFn, apiParams);
    }

    onChangeFilters = (type, value) => {
        const that = this;
        this.setState({
            [type]: value
        }, function () {
            that.loadData();
        })
    }
    toggleCandidateDetails = (option) => {
        this.setState({
            showCandidateDetails: option
        })
    }
    toggleAssignStatus = (option) => {
        this.setState({
            editCandidateStatus: option
        })
    }

    render() {
        const that = this;
        const EditStatusForm = Form.create()(DynamicFieldsForm);
        const {candidateList, candidateCount, loading, nextPage, selectedStatus, showCandidateDetails, editCandidateStatus} = this.state;
        const columns = [{
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (value, record) => <Button size={"small"}
                                               type={"link"}
                                               onClick={() => this.toggleCandidateDetails(record)}>{value}</Button>
        }, {
            title: 'Status',
            dataIndex: 'status',
            key: 'status'
        }, {
            title: 'Job',
            dataIndex: 'job_data.title',
            key: 'job'
        }, {
            title: 'Applied On',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (value) => moment(value).format("LLL")
        }, {
            title: 'Mobile',
            dataIndex: 'mobile1',
            key: 'mobile1'
        }, {
            title: 'Email',
            dataIndex: 'email',
            key: 'email'
        }, {
            title: 'Resume',
            dataIndex: 'resume',
            key: 'resume',
            render: (value) => value ? <a href={makeFileURL(value)} target="_blank">Resume</a> : null
        }, {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (value, record) => <Button type={"link"} size={"small"}
                                               onClick={() => this.toggleAssignStatus(record)}>Edit Status</Button>
        }];
        const editFields = [{
            label: "Candidate",
            type: LABEL_FIELD,
            key: "name",
            follow: editCandidateStatus ? editCandidateStatus.name : null
        }, {
            label: "Job",
            type: LABEL_FIELD,
            key: "job_name",
            follow: editCandidateStatus ? editCandidateStatus.job_data.title : null
        }, {
            label: "Status",
            type: SELECT_FIELD,
            initialValue: editCandidateStatus ? editCandidateStatus.status : null,
            required: true,
            key: 'status',
            options: APPLIED_CANDIDATES_STATUS.map(item => {
                return {label: item, value: item}
            })
        }];
        const editFormProps = {
            method: "put",
            action: interpolate(APPLIED_SINGLE_CANDIDATE, [editCandidateStatus ? editCandidateStatus.id : null]),
            successFn: function (data) {
                that.loadData();
                that.toggleAssignStatus(null);
                displayMessage(SUCCESS_MSG_TYPE, "Status Changed Successfully!!");
            },
            errorFn: function () {
                displayMessage(ERROR_MSG_TYPE, "Something went wrong!!");
            }
        };
        return <div>
            <Card title={"Applied Candidates"} extra={<Select value={selectedStatus}
                                                              style={{width: 150}}
                                                              onChange={(e) => this.onChangeFilters('selectedStatus', e)}>
                <Select.Option value={null}>All</Select.Option>
                {APPLIED_CANDIDATES_STATUS.map(item => <Select.Option value={item}>{item}</Select.Option>)}
            </Select>}>
                <Row>
                    <Col span={24}>
                        <Statistic title={"Total Candidates"} value={candidateCount}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Table dataSource={candidateList} columns={columns} pagination={false}/>
                        <InfiniteFeedLoaderButton
                            loaderFunction={() => this.loadData(nextPage)}
                            loading={loading}
                            hidden={!nextPage}
                        />
                    </Col>
                </Row>
                <Modal visible={showCandidateDetails} onCancel={() => this.toggleCandidateDetails(null)} footer={false}>
                    {showCandidateDetails ?
                        <>
                            <PatientRow label={"Applied For"}
                                        value={showCandidateDetails.job_data ? showCandidateDetails.job_data.title : '--'}/>
                            <PatientRow label={"Applied On"} value={moment(showCandidateDetails.created_at).format('LLL')}/>
                            <PatientRow label={"Name"} value={showCandidateDetails.name}/>
                            <PatientRow label={"Mobile"} value={showCandidateDetails.mobile1}/>
                            <PatientRow label={"Secondary Mobile"} value={showCandidateDetails.mobile2}/>
                            <PatientRow label={"Email"} value={showCandidateDetails.email}/>
                            <PatientRow label={"Can Relocate?"} value={showCandidateDetails.relocation ? "Yes" : "No"}/>
                            <PatientRow label={"Pincode"} value={showCandidateDetails.pincode}/>
                            <PatientRow label={"Address"} value={showCandidateDetails.address1}/>
                            <PatientRow label={"Locality"} value={showCandidateDetails.locality}/>
                            <PatientRow label={"City"}
                                        value={showCandidateDetails.city_data ? showCandidateDetails.city_data.name : '--'}/>
                            <PatientRow label={"State"}
                                        value={showCandidateDetails.state_data ? showCandidateDetails.state_data.name : '--'}/>
                            <PatientRow label={"Country"}
                                        value={showCandidateDetails.country_data ? showCandidateDetails.country_data.name : '--'}/>
                            {showCandidateDetails.resume ?
                                <a href={makeFileURL(showCandidateDetails.resume)} target="_blank"><Button type={"link"}
                                                                                                           block
                                                                                                           size={"large"}>Resume</Button></a> :
                                <p>Resume Not Available</p>}
                            <Divider/>
                            <p>{showCandidateDetails.why_hire}</p>
                        </>
                        : null}
                </Modal>
                <Modal visible={editCandidateStatus} footer={null} onCancel={() => this.toggleAssignStatus(null)}>
                    {editCandidateStatus ?
                        <EditStatusForm fields={editFields} formProp={editFormProps} title={"Edit Status"}/> : null}
                </Modal>
            </Card>
        </div>
    }

}

function PatientRow(props) {
    return (
        <Row gutter={16} style={{marginBottom: '5px'}}>
            <Col span={8} style={{textAlign: 'right'}}>
                {props.label}:
            </Col>
            <Col span={16}>
                <strong>{props.value}</strong>
            </Col>
        </Row>
    );
}
