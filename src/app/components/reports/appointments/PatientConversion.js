import React from "react";
import {Col, Row, Select, Statistic} from "antd";
import moment from "moment";
import {getAPI} from "../../../utils/common";
import {PATIENT_APPOINTMENTS_REPORTS} from "../../../constants/api";
import CustomizedTable from "../../common/CustomizedTable";
import {hideEmail, hideMobile} from "../../../utils/permissionUtils";
import {sendReportMail} from "../../../utils/clinicUtils";

export default class PatientConversion extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            patient_conversion: [],
            distinct_patients: '',
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            loading: false,
            activeIndex: 0,
            mailingUsersList: this.props.mailingUsersList
        };
        this.loadPatientConversion = this.loadPatientConversion.bind(this);
    }

    componentDidMount() {
        this.loadPatientConversion();
    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate || this.props.categories != newProps.categories ||
            this.props.country != newProps.country || this.props.state != newProps.state || this.props.city != newProps.city
            || this.props.doctors != newProps.doctors || this.props.exclude_cancelled != newProps.exclude_cancelled || this.props.appointmentType != newProps.appointmentType|| this.props.conversionType != newProps.conversionType)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate
            }, function () {
                that.loadPatientConversion();
            })

    }

    loadPatientConversion() {
        const that = this;
        that.setState({
            loading: true,
        });
        const successFn = function (data) {
            that.setState({
                patient_conversion: data.data,
                distinct_patients: data.distinct_patients,
                loading: false,
            })
        };
        const errorFn = function () {
            that.setState({
                loading: false,
            })
        };
        const apiParams = {
            type: this.props.type,
            practice: this.props.active_practiceId,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
            exclude_cancelled: !!this.props.exclude_cancelled,
        };
        if (this.props.categories) {
            apiParams.categories = this.props.categories.toString();
        }
        if (this.props.doctors) {
            apiParams.doctors = this.props.doctors.toString();
        }

        if (this.props.country) {
            apiParams.country = this.props.country;
        }
        if (this.props.state) {
            apiParams.state = this.props.state;
        }
        if (this.props.city) {
            apiParams.city = this.props.city;
        }
        if (this.props.appointmentType) {
            apiParams.first = this.props.appointmentType;
        }
        if (this.props.conversionType) {
            apiParams.conversion = this.props.conversionType;
        }


        getAPI(PATIENT_APPOINTMENTS_REPORTS, successFn, errorFn, apiParams);

    }

    sendMail = (mailTo) => {
        const apiParams = {
            type: this.props.type,
            practice: this.props.active_practiceId,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
            exclude_cancelled: !!this.props.exclude_cancelled,
        };
        // if (this.props.exclude_cancelled){
        //     apiParams.exclude_cancelled=this.props.exclude_cancelled;
        // }
        if (this.props.categories) {
            apiParams.categories = this.props.categories.toString();
        }
        if (this.props.doctors) {
            apiParams.doctors = this.props.doctors.toString();
        }
        if (this.props.country) {
            apiParams.country = this.props.country;
        }
        if (this.props.state) {
            apiParams.state = this.props.state;
        }
        if (this.props.city) {
            apiParams.city = this.props.city;
        }
        apiParams.mail_to = mailTo;
        sendReportMail(PATIENT_APPOINTMENTS_REPORTS, apiParams)
    }

    render() {
        const that = this;

        const {patient_conversion} = this.state;
        const patient_conversionData = [];
        for (let i = 1; i <= patient_conversion.length; i++) {
            patient_conversionData.push({s_no: i, ...patient_conversion[i - 1]});
        }
        ;

        const columns = [
            {
                title: 'S. No',
                key: 's_no',
                dataIndex: 's_no',
                width: 50
            }, {
                title: 'Appointment',
                key: 'appointment',
                dataIndex: 'appointment',
                render: (value) => <span>{moment(value).format('DD MMM YYYY HH:mm')}</span>
            }, {
                title: 'Patient Id',
                key: 'custom_id',
                dataIndex: 'custom_id',
            }, {
                title: 'Patient Name',
                key: 'patient_name',
                dataIndex: 'patient_name',
            }, {
                title: 'Contact Number',
                key: 'mobile',
                dataIndex: 'mobile',
                render: (value) => that.props.activePracticePermissions.PatientPhoneNumber ? value : hideMobile(value),
                exports: (value) => (value),
            }, {
                title: 'Secondary Number',
                key: 'secondary_number',
                dataIndex: 'secondary_number',
                render: (value) => that.props.activePracticePermissions.PatientPhoneNumber ? value : hideMobile(value),
                exports: (value) => (value),
            }, {
                title: 'Email',
                key: 'email',
                dataIndex: 'email',
                render: (value) => that.props.activePracticePermissions.PatientEmailId ? value : hideEmail(value),
                exports: (value) => (value),
            }, {
                title: 'Address',
                key: 'address',
                dataIndex: 'address',
            }, {
                title: 'Gender',
                key: 'gender',
                dataIndex: 'gender',
            }, {
                title: 'DOB',
                key: 'dob',
                dataIndex: 'dob',
                render: (value) => moment(value).format('lll')
            }, {
                title: 'Source',
                key: 'source',
                dataIndex: 'source',
            }, {
                title: 'Appointment Status',
                key: 'status',
                dataIndex: 'status',
            }, {
                title: 'Doctor',
                key: 'doctor',
                dataIndex: 'doctor',
            }, {
                title: 'Last Payments',
                key: 'invoice_total',
                dataIndex: 'invoice_total',
            }, {
                title: 'Last Patient Note',
                key: 'last_note',
                dataIndex: 'last_note',
                render: (item, record) =>
                    <span>{record.last_note ? `${record.last_note}( ${record.note_by})` : ''}</span>
            }, {
                title: 'Referal',
                key: 'referal_by',
                dataIndex: 'referal_by',
            }, {
                title: 'First Appointment',
                key: 'first_appointment',
                dataIndex: 'first_appointment',
                render: (item) => <span>{item ? "YES" : "NO"}</span>
            }, {
                title: 'Conversion',
                key: 'conversion',
                dataIndex: 'invoice_total',
                render: (item) => <span>{item ? "YES" : "NO"}</span>
            }, {
                title: 'City',
                key: 'city',
                dataIndex: 'city',
            }, {
                title: 'State',
                key: 'state',
                dataIndex: 'state',
            }, {
                title: 'Country',
                key: 'country',
                dataIndex: 'country',
            }
        ];
        return (
            <div>
                <h2>Patient Conversion
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
                <Row>
                    <Col span={12} offset={6} style={{textAlign: "center"}}>
                        <Statistic title="Total Conversions" value={this.state.distinct_patients} />
                    </Col>
                </Row>
                <CustomizedTable
                  hideReport
                  loading={this.state.loading}
                  columns={columns}
                  dataSource={patient_conversionData}
                />
            </div>
        )
    }


}
