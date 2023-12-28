import React from 'react';
import { Link } from 'react-router-dom';

import { Button, Card, Checkbox, Divider, Form, Icon, Popconfirm, Table } from 'antd';
import moment from 'moment';
import DynamicFieldsForm from '../../common/DynamicFieldsForm';
import { DOCTORS_ROLE } from '../../../constants/dataKeys';
import {
    ALL_APPOINTMENT_API,
    APPOINTMENT_API,
    APPOINTMENT_REPORTS,
    EMR_TREATMENTNOTES,
    PRACTICESTAFF,
    PROCEDURE_CATEGORY,
} from '../../../constants/api';
import { getAPI, interpolate, putAPI } from '../../../utils/common';
import { hideEmail, hideMobile } from '../../../utils/permissionUtils';
import InfiniteFeedLoaderButton from '../../common/InfiniteFeedLoaderButton';


class Appointment extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            redirect: false,
            appointments: null,
            practice_doctors: [],
            procedure_category: null,
            treatmentNotes: null,
            practice_staff: [],
            loading: false,

        };
        this.changeRedirect = this.changeRedirect.bind(this);
        this.editAppointment = this.editAppointment.bind(this);
        this.deleteAppointment = this.deleteAppointment.bind(this);
        this.loadProcedureCategory = this.loadProcedureCategory.bind(this);
        this.loadDoctors = this.loadDoctors.bind(this);

    }

    componentDidMount() {
        // this.loadProcedureCategory();
        this.loadDoctors();
        this.loadTreatmentNotes();
        if (this.props.match.params.appointmentid) {
            this.loadAppointment(this.props.match.params.appointmentid);
        } else {
            this.loadAllAppointments();
        }

    }

    loadAppointment(id) {
        const that = this;
        this.setState({
            loading: true,
        });
        const successFn = function(data) {

            that.setState({
                appointments: [data],
                loading: false,

            });


        };

        const errorFn = function() {
            that.setState({
                loading: false,

            });

        };
        getAPI(interpolate(APPOINTMENT_API, [id]), successFn, errorFn);

    }

    loadAllAppointments(page = 1) {
        const that = this;
        this.setState({
            loading: true,
        });
        const successFn = function(data) {
            if (data.current == 1) {
                that.setState({
                    appointments: data.results,
                    total: data.count,
                    loadMoreAppointment: data.next,
                    loading: false,

                });
            } else {
                that.setState(function(prevState) {
                    return {
                        total: data.count,
                        appointments: [...prevState.appointments, ...data.results],
                        loading: false,
                        loadMoreAppointment: data.next,
                    };
                });
            }


        };

        const errorFn = function() {
            that.setState({
                loading: false,

            });


        };
        const apiParams = {
            practice: this.props.active_practiceId,
            pagination: true,
            page,
        };
        if (this.props.match.params.id) {
            apiParams.patient = this.props.match.params.id;
        }

        getAPI(ALL_APPOINTMENT_API, successFn, errorFn, apiParams);

    }


    loadProcedureCategory() {
        const that = this;
        const successFn = function(data) {
            that.setState({
                procedure_category: data,
            });

        };
        const errorFn = function() {

        };
        getAPI(interpolate(PROCEDURE_CATEGORY, [this.props.active_practiceId]), successFn, errorFn);
    }

    loadDoctors() {
        const that = this;
        const successFn = function(data) {
            data.staff.forEach(function(usersdata) {
                if (usersdata.role == DOCTORS_ROLE) {
                    const doctor = that.state.practice_doctors;
                    doctor.push(usersdata);
                    that.setState({
                        practice_doctors: doctor,
                    });
                } else {
                    const doctor = that.state.practice_staff;
                    doctor.push(usersdata);
                    that.setState({
                        practice_staff: doctor,
                    });
                }
            });

        };
        const errorFn = function() {
        };
        getAPI(interpolate(PRACTICESTAFF, [this.props.active_practiceId]), successFn, errorFn);

    }

    loadTreatmentNotes() {
        const that = this;
        const successFn = function(data) {
            that.setState({
                treatmentNotes: data,
            });

        };
        const errorFn = function() {
            that.setState({});

        };
        getAPI(interpolate(EMR_TREATMENTNOTES, [this.props.active_practiceId]), successFn, errorFn);
    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    editAppointment(record) {

        const { id } = record;
        this.props.history.push(`/erp/calendar/${id}/edit-appointment`);

    }

    deleteAppointment(record) {
        const that = this;
        that.setState({
            loading: true,
        });
        const reqData = { 'is_active': false, 'status': 'Cancelled' };
        const successFn = function(data) {
            that.loadAllAppointments();
            that.setState({
                loading: false,
            });

        };
        const errorFn = function() {
            that.setState({
                loading: false,
            });
        };
        putAPI(interpolate(APPOINTMENT_API, [record.id]), reqData, successFn, errorFn);
    }

    render() {
        const that = this;
        const doctors = [];
        if (this.state.practice_doctors.length) {
            this.state.practice_doctors.forEach(function(doctor) {
                doctors[doctor.id] = doctor.user.first_name;
            });
        }
        const treatmentNotes = [];
        if (this.state.treatmentNotes) {
            this.state.treatmentNotes.forEach(function(treatmentNote) {
                treatmentNotes[treatmentNote.id] = treatmentNote.name;
            });
        }
        // const categories = {1: "fast", 2: "Full Stomach", 3: "No Liquids"}
        const columns = [{
            title: 'Schedule Time',
            key: 'name',
            render: (text, record) => (<span>{moment(record.schedule_at).format('LLL')},{record.slot}mins</span>
            ),
        }, {
            title: 'Patient ID',
            key: 'id',
            render: (item, record) =>
                <span>{record.patient.custom_id ? record.patient.custom_id : record.patient.id}</span>,
            exports: (item, record) => (record.patient.custom_id ? record.patient.custom_id : record.patient.id),
        }, {
            title: 'Patient Name',
            dataIndex: 'patient.user.first_name',
            key: 'patient_name',
        }, {
            title: 'Patient Mobile',
            dataIndex: 'patient.user.mobile',
            key: 'patient_mobile',
            render: (value) => that.props.activePracticePermissions.PatientPhoneNumber ? value : hideMobile(value),
        }, {
            title: 'Email',
            dataIndex: 'patient.user.email',
            key: 'email',
            render: value => that.props.activePracticePermissions.PatientEmailId ? value : hideEmail(value),
        }, {
            title: 'Doctor',
            key: 'doctor',
            render: (text, record) => (
                <span> {doctors[record.doctor]}</span>
            ),
        }, {
            title: 'First Appointment',
            key: 'first_appointment',
            dataIndex: 'first_appointment',
            render: value => value ? 'Yes' : 'No',
        }, {
            title: 'Created By',
            key: 'created_by',
            dataIndex: 'created_by',
            render: (item,record) => (record.created_by ? record.creator : '--'),
        }
            ,
            {
                title: 'Procedure',
                key: 'procedure',
                // render: (text, record) => (
                //     <span> {procedures[record.procedure]}</span>
                // )
            }, {
                title: 'Treatment Notes',
                key: 'notes',
                render: (text, record) => (
                    <span> {treatmentNotes[record.notes]}</span>
                ),
            }, {
                title: 'Category',
                key: 'category',
                render: (text, record) => (
                    <span> {record.category ? record.category_data.name : '--'}</span>
                ),
            }, {
                title: 'NotifyByEmail',
                key: 'notify_via_email',
                render: (text, record) => (
                    <Checkbox disabled checked={record.notify_via_email}/>
                ),
            }, {
                title: 'NotifyBySMS',
                key: 'notify_via_sms',
                render: (text, record) => (
                    <Checkbox disabled checked={record.notify_via_sms}/>
                ),
            },

            {
                title: 'Action',
                key: 'action',
                render: (text, record) => (
                    <span>
                <a
                    onClick={() => this.editAppointment(record)}
                    disabled={!that.props.activePracticePermissions.EditAppointment}
                >Edit
                </a>
                <Divider type="vertical"/>
                <Popconfirm
                    title="Are you sure delete this item?"
                    onConfirm={() => this.deleteAppointment(record)}
                    okText="Yes"
                    cancelText="No"
                >
                    <a disabled={!that.props.activePracticePermissions.EditAppointment}>Delete</a>
                </Popconfirm>


                    </span>
                ),
            }];
        const TestFormLayout = Form.create()(DynamicFieldsForm);
        if (this.props.match.params.id) {
            return (
                <Card extra={that.props.activePracticePermissions.AddAppointment || that.props.allowAllPermissions ? (
                    <Link to={`/erp/calendar/create-appointment?patient=${this.props.match.params.id}`}>
                        <Button type="primary">
                            <Icon type="plus"/>&nbsp;Add Appointment
                        </Button>
                    </Link>
                ) : null}
                >

                    <Table
                        loading={this.state.loading}
                        columns={columns}
                        scroll={{ x: 1300 }}
                        pagination={false}
                        dataSource={this.state.appointments}
                    />

                    <InfiniteFeedLoaderButton
                        loaderFunction={() => this.loadAllAppointments(this.state.loadMoreAppointment)}
                        loading={this.state.loading}
                        hidden={!this.state.loadMoreAppointment}
                    />


                </Card>
            );
        }
        return (
            <Card extra={that.props.activePracticePermissions.AddAppointment || that.props.allowAllPermissions ? (
                <Link to="/erp/calendar/create-appointment">
                    <Button type="primary">
                        <Icon type="plus"/>&nbsp;Add Appointment
                    </Button>
                </Link>
            ) : null}
            >
                <Table
                    loading={this.state.loading}
                    columns={columns}
                    scroll={{ x: 1300 }}
                    pagination={false}
                    dataSource={this.state.appointments}
                />

                <InfiniteFeedLoaderButton
                    loaderFunction={() => this.loadAllAppointments(this.state.loadMoreAppointment)}
                    loading={this.state.loading}
                    hidden={!this.state.loadMoreAppointment}
                />


            </Card>
        );
    }

}

export default Appointment;
