import React, {Component} from "react";
import {Select, Table} from "antd";
import moment from "moment";
import { sendReportMail} from "../../../utils/clinicUtils";
import {PATIENTS_REPORTS, PATIENTS_LIST} from "../../../constants/api";
import {getAPI} from "../../../utils/common";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";
import {hideEmail, hideMobile} from "../../../utils/permissionUtils";

export default class PDDoctorWisePatient extends Component {
    constructor(props) {
        super(props);
        this.state = {
            report: [],
            mailingUsersList: this.props.mailingUsersList,
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,

        }
    }


    componentDidMount() {
        this.loadPDDoctorWisePatient();
    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate || this.props.patient_groups != newProps.patient_groups
            || this.props.blood_group != newProps.blood_group || this.props.pd_doctor != newProps.pd_doctor)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate,
                pd_doctor: newProps.pd_doctor
            }, function () {
                that.loadPDDoctorWisePatient();
            })
    }


    loadPDDoctorWisePatient = (page = 1) => {
        const that = this;
        that.setState({
            loading: true,
        });
        const successFn = function (data) {
            if (data.current == 1) {
                that.setState({
                    report: data.results,
                    loading: false,
                    loadMoreReport: data.next
                })
            } else {
                that.setState(function (prevState) {
                    return {
                        total: data.count,
                        report: [...prevState.report, ...data.results],
                        loading: false,
                        loadMoreReport: data.next
                    }
                })
            }
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        const apiParams = {
            pd_doctor: this.state.pd_doctor ? this.state.pd_doctor : '',
            page
        };

        if (this.props.patient_groups) {
            apiParams.groups = this.props.patient_groups.toString();
        }
        if (this.props.blood_group) {
            apiParams.blood_group = this.props.blood_group;
        }

        getAPI(PATIENTS_LIST, successFn, errorFn, apiParams);

    }


    sendMail = (mailTo) => {
        const apiParams = {
            pd_doctor: 1,
        }
        if (this.props.patient_groups) {
            apiParams.groups = this.props.patient_groups.toString();
        }
        if (this.props.blood_group) {
            apiParams.blood_group = this.props.blood_group;
        }
        apiParams.mail_to = mailTo;
        const successFn = function (data) {

        }
        const errorFn = function (error) {

        }
        sendReportMail(PATIENTS_LIST, apiParams, successFn, errorFn);
    }


    render() {
        const that = this;
        const {report} = this.state;
        const reportData = [];
        for (let i = 1; i <= report.length; i++) {
            reportData.push({s_no: i, ...report[i - 1]});
        }

        const columns = [{
            title: 'S. No',
            key: 's_no',
            dataIndex: 's_no',
            width: 50
        }, {
            title: 'Patient Name',
            dataIndex: 'user.first_name',
            key: 'first_name',
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
            dataIndex: 'gender',
        }, {
            title: 'PD Doctor',
            key: 'pd_doctor_data',
            dataIndex: 'pd_doctor_data',
            render: (item, record) => <span>{item ? item.user.first_name : null}</span>
        }, {
            title: 'PD Doctor Added',
            key: 'pd_doctor_added',
            dataIndex: 'pd_doctor_added',
            render: (item, record) => <span>{item ? moment(item).format('LL') : '--'}</span>
        }
        ]
        return (
            <div>
                <h2>PD Doctor Wise Patient
                    <span style={{float: 'right'}}>
                        <p><small>E-Mail To:&nbsp;</small>
                            <Select onChange={(e) => this.sendMail(e)} style={{width: 200}}>
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


                <Table
                  pagination={false}
                  loading={this.state.loading}
                  columns={columns}
                  dataSource={reportData}
                />
                <InfiniteFeedLoaderButton
                  loaderFunction={() => this.loadPDDoctorWisePatient(this.state.loadMoreReport)}
                  loading={this.state.loading}
                  hidden={!this.state.loadMoreReport}
                />

            </div>
        );
    }

}
