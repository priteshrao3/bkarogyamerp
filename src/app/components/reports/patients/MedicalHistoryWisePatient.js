import React, { Component } from "react";
import { Col, Row, Select, Statistic,Tag,Table } from "antd";
import { hideEmail, hideMobile } from "../../../utils/permissionUtils";
import { getAPI } from "../../../utils/common";
import { PATIENT_MEDICAL__REPORTS } from "../../../constants/api";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";
import CustomizedTable from "../../common/CustomizedTable";
import {  sendReportMail } from "../../../utils/clinicUtils";

export default class MedicalHistoryWisePatient extends Component {
    constructor(props) {
        super(props);
        this.state = {
            report: [],
            patientCount: 0,
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            nextItemPage:null,
            loading: false,
            mailingUsersList: this.props.mailingUsersList

        }
        this.loadMedicalHistoryWisePatient = this.loadMedicalHistoryWisePatient.bind(this);
    }


    componentDidMount() {
        this.loadMedicalHistoryWisePatient();
        
    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate ||this.props.patient_groups !=newProps.patient_groups
            ||this.props.blood_group !=newProps.blood_group || this.props.blood_group !=newProps.blood_group || this.props.medical_history !=newProps.medical_history)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            }, function () {
               that.loadMedicalHistoryWisePatient();
            })
    }



    loadMedicalHistoryWisePatient = (page=1) => {
        const that = this;
        that.setState({
            loading: true,
        });

        const successFn = function (data) {
            that.setState(function (prevState) {
                if (data.current==1) {
                    return {
                        loading:false,
                        report: data.results,
                        patientCount: data.count,
                        nextItemPage: data.next
                    }
                }
                    return {
                        loading:false,
                        report: [...prevState.report,...data.results],
                        nextItemPage: data.next
                    }

            })

        }

        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        const apiParams = {
            page,
            type: this.props.type,
        }
        if (this.props.medical_history){
            apiParams.medical_history=this.props.medical_history.toString();
        }
        getAPI(PATIENT_MEDICAL__REPORTS, successFn, errorFn, apiParams);

    }


    sendMail = (mailTo) => {
        const apiParams = {
            from_date: this.props.startDate.format('YYYY-MM-DD'),
            to_date: this.props.endDate.format('YYYY-MM-DD'),
        }
        apiParams.mail_to = mailTo;
        sendReportMail(PATIENT_MEDICAL__REPORTS, apiParams)
    }


    render() {
        const that = this;
        const { report } = this.state;
        const reportData = [];
        for (let i = 1; i <= report.length; i++) {
            reportData.push({ s_no: i, ...report[i - 1] });
        };

        const columns = [{
            title: 'S. No',
            key: 's_no',
            dataIndex: 's_no'

        }, {
            title: 'Patient Name',
            dataIndex: 'user.first_name',
            key: 'first_name'
        }, {
            title: 'Patient Number',
            key: 'id',
            render: (item, record) => <span>{record.custom_id ? record.custom_id : record.id}</span>,
            exports: (item, record) => (record.custom_id ? record.custom_id : record.id),
        }, {
            title: 'Mobile Number',
            key: 'user.mobile',
            dataIndex: 'user.mobile',
            render: (value) => that.props.activePracticePermissions.PatientPhoneNumber ? value : hideMobile(value),
            exports: (value) => (value),
        }, {
            title: 'Email',
            key: 'user.email',
            dataIndex: 'user.email',
            render: (value) => that.props.activePracticePermissions.PatientEmailId ? value : hideEmail(value),
            exports: (value) => (value),
        }, {
            title: 'Gender',
            key: 'gender',
            dataIndex: 'gender'
        }, {
            title: 'Medical History',
            dataIndex: 'medical_history_data',
            render: (text,record,index) => (
<span>{record.medical_history_data.map((item) =>
                <Tag>{item.name}</Tag>
            )}
</span>
)
        }];
        return (
            <div>
                <h2>Medical History
                <span style={{ float: 'right' }}>
                        <p><small>E-Mail To:&nbsp;</small>
                            <Select onChange={(e) => this.sendMail(e)} style={{ width: 200 }}>
                                {this.state.mailingUsersList.map(item => (
                                    <Select.Option
                                      value={item.email}
                                    >{item.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </p>
                </span>
                </h2>
                <Row>
                <Col span={12} offset={6} style={{textAlign:"center"}}>
                    <Statistic title="Total Patients" value={this.state.patientCount} />
                    <br />
                </Col>
                </Row>
                <Table
                  loading={this.state.loading}
                  bordered
                  rowKey={(record) => record.id}
                  columns={columns}
                  dataSource={reportData}
                  pagination={false}
                />
                <InfiniteFeedLoaderButton
                  loaderFunction={() => this.loadMedicalHistoryWisePatient(this.state.nextItemPage)}
                  loading={this.state.loading}
                  hidden={!this.state.nextItemPage}
                />
            </div>
        )
    }

}
