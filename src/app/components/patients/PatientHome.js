import React from 'react';

import { Button, Layout, Result, Spin } from 'antd';
import { Redirect, Route, matchPath } from 'react-router';
import { Link, Switch } from 'react-router-dom';
import PatientProfile from './patient/PatientProfile';
import EditPatientDetails from './patient/EditPatientDetails';
import Appointment from './appointment/Appointment';
import PatientSider from './PatientSider';
import PatientTimeline from './timeline/PatientTimeline';
import PatientFiles from './files/PatientFiles';
import PatientClinicNotes from './clinicNotes/PatientClinicNotes';
import PatientHeader from './PatientHeader';
import PatientCommunication from './communication/PatientCommunication';
import PatientVitalSign from './vitalSign/PatientVitalSign';
import AddorEditPatientVitalSigns from './vitalSign/AddorEditPatientVitalSigns';
import PatientCompletedProcedures from './completedProcedures/PatientCompletedProcedures';
import PatientPrescriptions from './prescriptions/PatientPrescriptions';
import PatientTreatmentPlans from './treatmentPlans/PatientTreatmentPlans';
import PatientLabOrders from './labOrders/PatientLabOrders';
import PatientInvoices from './invoices/PatientInvoices';
import PatientPayments from './payments/PatientPayments';
import PatientInvoicesReturn from './invoices/ReturnInvoices';
import PatientLedgers from './ledgers/PatientLedgers';
import PrescriptionTemplate from './prescriptions/PrescriptionTemplate';
import { displayMessage, getAPI, getCommonSettings, interpolate, saveCommonSettings } from '../../utils/common';
import { AGENT_WALLET, PATIENT_PENDING_AMOUNT, PATIENT_PROFILE, PATIENTS_MEMBERSHIP_API } from '../../constants/api';
import { ERROR_MSG_TYPE } from '../../constants/dataKeys';
import PatientMerge from './merge/PatientMerge';
import PatientRequiredNoticeCard from './PatientRequiredNoticeCard';
import PatientMedicalCertificate from './files/PatientMedicalCertificate';
import PermissionDenied from '../common/errors/PermissionDenied';
import BookingHome from './booking/BookingHome';
import PatientWalletLedger from './wallet-ledger/PatientWalletLedger';
import { ROUTES_TO_HIDE_PATIENT_SIDE_PANEL } from '../../constants/hardData';
import PatientAccessModal from './PatientAccessModal';
import PrintPatientForm from './patient/PrintPatientForm';
import AllopathHistory from './allopath/AllopathHistory';
import AddAllopathHistoryBulk from './allopath/AddAllopathHistoryBulk';
import EditPrintPatientModal from './patient/EditPrintPatientModal';

import PatientProformaInvoices from './proformaInvoices/PatientInvoices';

const { Content } = Layout;

class PatientHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPatient: null,
            active_practiceId: this.props.active_practiceId,
            medicalHistory: [],
            listModalVisible: false,
            loading: false,
            showAllClinic: getCommonSettings('showAllClinic'),
            pendingAmount: null,
            walletAmount: null,
            hideSidePanel: false,
        };
        this.setCurrentPatient = this.setCurrentPatient.bind(this);
        this.togglePatientListModal = this.togglePatientListModal.bind(this);
        this.toggleShowAllClinic = this.toggleShowAllClinic.bind(this);
        this.loadPatientPendingAmount = this.loadPatientPendingAmount.bind(this);
        this.loadPatientWallet = this.loadPatientWallet.bind(this);
    }

    componentDidMount() {
        if (this.props.match.params.id && (!this.state.currentPatient || this.props.match.params.id != this.state.currentPatient.id)) {
            this.getPatientListData(this.props.match.params.id);
        }
        this.loadPatientPendingAmount();
        this.loadPatientWallet();
        this.loadMembership();
    }

    componentWillReceiveProps(nextProps, nextContext) {
        const that = this;
        if (this.state.currentPathLocation != nextProps.location)
            this.setState({
                currentPathLocation: nextProps.location,
            }, function() {
                let foundFlag = false;
                for (let i = 0; i < ROUTES_TO_HIDE_PATIENT_SIDE_PANEL.length; i++) {
                    if (matchPath(that.state.currentPathLocation.pathname, {
                        path: ROUTES_TO_HIDE_PATIENT_SIDE_PANEL[i],
                        exact: false,
                        strict: false,
                    })) {
                        foundFlag = true;
                        that.setState({
                            hideSidePanel: true,
                        });
                    }
                }
                if (!foundFlag)
                    that.setState({
                        hideSidePanel: false,
                    });
            });
    }

    getPatientListData(id) {
        const that = this;
        that.setState({
            loading: true,
        });
        const successFn = function(data) {
            that.setCurrentPatient(data);
            // that.setState({
            //     patientListData: data.results,
            //     morePatients: data.next,
            //     currentPage: data.current,
            //     loading: false
            // })
        };
        const errorFn = function() {
            displayMessage(ERROR_MSG_TYPE, 'Patient Loading Failed');
            that.setState({
                loading: false,
            });

        };
        const params = this.props.activePracticePermissions.ViewAllClinics ? {} : {
            perm_practice: this.props.active_practiceId,
        };
        getAPI(interpolate(PATIENT_PROFILE, [id]), successFn, errorFn, params);
    }

    setCurrentPatient(patientObj, redirectUrl = null) {
        const that = this;
        const urlArray = this.props.location.pathname.split('/');
        if (!isNaN(parseInt(urlArray[2]))) {
            if (patientObj) {
                urlArray[1] = 'patient';
                urlArray[2] = patientObj.id;
            } else {
                urlArray[1] = 'patients';
                urlArray.splice(2, 1);
            }
        } else if (patientObj) {
            urlArray[1] = 'patient';
            urlArray.splice(2, 0, patientObj.id);
        }
        this.props.history.push(urlArray.join('/'));
        this.setState({
            currentPatient: patientObj,
            patientAllowed: patientObj ? !!patientObj.is_active : null,
            loading: false,
            listModalVisible: false,
        }, function() {
            if (redirectUrl)
                that.props.history.push(interpolate(redirectUrl, [patientObj.id]));
        });
    }

    togglePatientListModal(option) {
        this.setState({
            listModalVisible: !!option,
        });
    }

    toggleShowAllClinic(option) {
        this.setState({
            showAllClinic: !!option,
        }, function() {
            saveCommonSettings('showAllClinic', !!option);
        });
    }

    loadPatientPendingAmount = () => {
        const that = this;
        if (this.state.currentPatient && this.state.currentPatient.id) {
            const successFn = function(data) {
                that.setState({
                    pendingAmount: data,
                });
            };
            const errorFn = function() {

            };
            getAPI(interpolate(PATIENT_PENDING_AMOUNT, [this.state.currentPatient.id]), successFn, errorFn);
        } else {
            this.setState({
                pendingAmount: null,
            });
        }
    };

    loadPatientWallet = () => {
        const that = this;
        if (this.state.currentPatient && this.state.currentPatient.id) {
            const successFn = function(data) {
                that.setState({
                    walletAmount: data,
                });
            };
            const errorFn = function() {

            };
            getAPI(interpolate(AGENT_WALLET, [this.state.currentPatient.id]), successFn, errorFn);
        } else {
            this.setState({
                pendingAmount: null,
            });
        }
    };

    loadMembership = () => {
        const that = this;
        if (this.state.currentPatient && this.state.currentPatient.id) {
            const successFn = function(data) {
                that.setState({
                    MedicalMembership: data.length ? data[data.length - 1] : null,
                });
            };
            const errorFn = function() {
            };
            getAPI(interpolate(PATIENTS_MEMBERSHIP_API, [that.state.currentPatient.id]), successFn, errorFn);
        }
    };

    refreshWallet = () => {
        this.loadPatientWallet();
        this.loadPatientPendingAmount();
        this.loadMembership();
    };

    render() {
        const that = this;
        return (
            <Content>
                <Spin spinning={this.state.loading} size="large">
                    <PatientHeader
                        {...this.state}
                        {...this.props}
                        togglePatientListModal={this.togglePatientListModal}
                        key={this.state.currentPatient}
                        setCurrentPatient={this.setCurrentPatient}
                        toggleShowAllClinic={this.toggleShowAllClinic}
                        refreshWallet={this.refreshWallet}
                    />
                    {this.state.currentPatient && !this.state.patientAllowed ? (
                        <>
                            <Result
                                status={403}
                                title="Permission Denied"
                                subTitle={'You don\'t have permission to access this patient'}
                                extra={<Link to="/patients/"><Button type="primary">Go to All Patient</Button></Link>}
                            />
                            <PatientAccessModal
                                {...this.props}
                                patientData={this.state.currentPatient}
                                loadData={() => this.getPatientListData(that.props.match.params.id)}
                            />
                        </>
                    ) : (
                        <Layout>
                            <PatientSider {...this.state} {...this.props} />
                            <Layout>
                                <Content
                                    className="main-container"
                                    key={this.state.showAllClinic.toString()}
                                    style={{
                                        // margin: '24px 16px',
                                        padding: '0px 5px',
                                        minHeight: 280,
                                        // marginLeft: '200px'
                                    }}
                                >
                                    <Switch>
                                        {/** * Patient Profile Routes */}
                                        <Route
                                            exact
                                            path="/erp/patients/merge"
                                            render={(route) => (that.props.activePracticePermissions.MergePatients || that.props.allowAllPermissions ?
                                                <PatientMerge {...this.state} /> : <PermissionDenied/>)}
                                        />

                                        {that.props.activePracticePermissions.WebAdmin || that.allowAllPermissions ? (
                                                <Route
                                                    exact
                                                    path='erp/patients/profile'
                                                    render={(route) =>
                                                        (this.state.currentPatient ? (
                                                            <Redirect
                                                                to={`/erp/patient/${this.state.currentPatient.id}/profile`}
                                                            />
                                                        ) : (
                                                            <PatientProfile
                                                                {...this.state}
                                                                key={this.state.currentPatient}
                                                                setCurrentPatient={this.setCurrentPatient}
                                                                refreshWallet={this.refreshWallet}
                                                                {...this.props}
                                                            />
                                                        ))}
                                                />
                                            )
                                            : null}

                                        <Route
                                            exact
                                            path='/erp/patients/profile/add'
                                            render={(route) => (that.props.activePracticePermissions.AddPatient || that.props.allowAllPermissions ? (
                                                    <EditPatientDetails
                                                        key={this.state.currentPatient}
                                                        {...this.props}
                                                        {...route}
                                                    />
                                                ) :
                                                <PermissionDenied/>)}
                                        />
                                        <Route
                                            exact
                                            path='/erp/patient/:id/profile'
                                            render={(route) => (that.props.activePracticePermissions.ViewPatient || that.props.allowAllPermissions ? (
                                                    <PatientProfile
                                                        {...this.state}
                                                        key={this.state.currentPatient}
                                                        refreshWallet={this.refreshWallet}
                                                        setCurrentPatient={this.setCurrentPatient}
                                                        {...this.props}
                                                        {...route}
                                                    />
                                                ) :
                                                <PermissionDenied/>)}
                                        />
                                        {/* <Route
                        exact
                        path="/patients/:id/patientprintform"
                        render={(route) => <PrintPatientForm {...this.state} key={this.state.currentPatient}
                          setCurrentPatient={this.setCurrentPatient} {...this.props}
                          {...route} />}
                      /> */}

                                        <Route
                                            exact
                                            path='/erp/patient/:id/profile/edit'
                                            render={(route) => (that.props.activePracticePermissions.EditPatient || that.props.allowAllPermissions ? (
                                                    <EditPatientDetails
                                                        key={this.state.currentPatient}
                                                        {...this.state}
                                                        {...this.props}
                                                        {...route}
                                                    />
                                                ) :
                                                <PermissionDenied/>)}
                                        />

                                        {/** * Patient Appointment Routes */}
                                        {that.props.activePracticePermissions.PatientAppointments || that.allowAllPermissions ? (
                                                <Route
                                                    exact
                                                    path='/erp/patients/appointments'
                                                    render={(route) => (this.state.currentPatient ? (
                                                        <Redirect
                                                            to={`/erp/patient/${this.state.currentPatient.id}/appointments`}
                                                        />
                                                    ) : (
                                                        <Appointment
                                                            key={this.state.currentPatient}
                                                            {...this.state}
                                                            {...route}
                                                            {...this.props}
                                                        />
                                                    ))}
                                                />
                                            )
                                            : null}
                                        {that.props.activePracticePermissions.PatientAppointments || that.allowAllPermissions ? (
                                                <Route
                                                    exact
                                                    path='/erp/patient/:id/appointments'
                                                    render={(route) => (
                                                        <Appointment
                                                            key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                            {...this.state}
                                                            {...route}
                                                            {...this.props}
                                                        />
                                                    )}
                                                />
                                            )
                                            : null}
                                        {that.props.activePracticePermissions.PatientAppointments || that.allowAllPermissions ? (
                                                <Route
                                                    exact
                                                    path='/erp/patients/appointments/:appointmentid'
                                                    render={(route) => (
                                                        <Appointment
                                                            key={this.state.currentPatient}
                                                            {...this.state}
                                                            {...route}
                                                            {...this.props}
                                                        />
                                                    )}
                                                />
                                            )
                                            : null}
                                        {/*      <Route exact path='/patients/appointments/create'
                           render={() => <CreateAppointment {...this.props} />}/> */}

                                        {/** * Patient Communication Routes */}
                                        {that.props.activePracticePermissions.PatientCommunications || that.allowAllPermissions ? (
                                                <Route
                                                    exact
                                                    path='/erp/patients/communications'
                                                    render={() => (this.state.currentPatient ? (
                                                        <Redirect
                                                            to={`/erp/patient/${this.state.currentPatient.id}/communications`}
                                                        />
                                                    ) : (
                                                        <PatientRequiredNoticeCard
                                                            togglePatientListModal={this.togglePatientListModal}
                                                        />
                                                    ))}
                                                />
                                            )
                                            : null}
                                        {that.props.activePracticePermissions.PatientCommunications || that.allowAllPermissions ? (
                                                <Route
                                                    exact
                                                    path='/erp/patient/:id/communications'
                                                    render={(route) => (
                                                        <PatientCommunication
                                                            key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                            {...this.props}
                                                            {...this.state}
                                                            {...route}
                                                        />
                                                    )}
                                                />
                                            )
                                            : null}

                                        {/** * Patient Allopath History Routes */}
                                        {that.props.activePracticePermissions.PatientCommunications || that.allowAllPermissions ? (
                                                <Route
                                                    exact
                                                    path='/erp/patient/:id/allopath/addbulk'
                                                    render={(route) => (
                                                        <AddAllopathHistoryBulk
                                                            key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                            {...this.props}
                                                            {...this.state}
                                                            {...route}
                                                        />
                                                    )}
                                                />
                                            )
                                            : null}
                                        {that.props.activePracticePermissions.PatientCommunications || that.allowAllPermissions ? (
                                                <Route
                                                    exact
                                                    path='/erp/patients/allopath'
                                                    render={() => (this.state.currentPatient ? (
                                                        <Redirect
                                                            to={`/erp/patient/${this.state.currentPatient.id}/allopath`}
                                                        />
                                                    ) : (
                                                        <PatientRequiredNoticeCard
                                                            togglePatientListModal={this.togglePatientListModal}
                                                        />
                                                    ))}
                                                />
                                            )
                                            : null}

                                        {that.props.activePracticePermissions.PatientCommunications || that.allowAllPermissions ? (
                                                <Route
                                                    exact
                                                    path='/erp/patient/:id/allopath'
                                                    render={(route) => (
                                                        <AllopathHistory
                                                            key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                            {...this.props}
                                                            {...this.state}
                                                            {...route}
                                                        />
                                                    )}
                                                />
                                            )
                                            : null}


                                        {/** * Patient Vital Sign Routes */}
                                        {/** * Patient Vital Sign Routes */}
                                        {that.props.activePracticePermissions.PatientVitalSigns || that.allowAllPermissions ? (
                                                <Route
                                                    exact
                                                    path='/erp/patients/emr/vitalsigns'
                                                    render={(route) => (this.state.currentPatient ? (
                                                        <Redirect
                                                            to={`/erp/patient/${this.state.currentPatient.id}/emr/vitalsigns`}
                                                        />
                                                    ) : (
                                                        <PatientVitalSign
                                                            togglePatientListModal={this.togglePatientListModal}
                                                            key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                            {...this.state}
                                                            {...route}
                                                        />
                                                    ))}
                                                />
                                            )
                                            : null}

                                        <Route
                                            path='/erp/patient/:id/emr/vitalsigns'
                                            render={(route) => (that.props.activePracticePermissions.PatientVitalSigns || that.allowAllPermissions ? (
                                                    <PatientVitalSign
                                                        key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                        {...this.state}
                                                        {...route}
                                                    />
                                                ) :
                                                <PermissionDenied/>)}
                                        />


                                        <Route
                                            exact
                                            path='/erp/patient/:id/emr/vitalsigns/edit'
                                            render={(route) => (that.props.activePracticePermissions.PatientVitalSigns || that.allowAllPermissions ? (
                                                    <AddorEditPatientVitalSigns
                                                        key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                        {...this.state}
                                                        {...route}
                                                    />
                                                ) :
                                                <PermissionDenied/>)}
                                        />

                                        {/** * Patient Clinic Notes Routes */}

                                        <Route
                                            path="/erp/patients/emr/clinicnotes"
                                            render={(route) => (
                                                <PatientClinicNotes
                                                    togglePatientListModal={this.togglePatientListModal}
                                                    key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                    {...this.props}
                                                    {...this.state}
                                                    {...route}
                                                />
                                            )}
                                        />}/>
                                        <Route
                                            path="/erp/patient/:id/emr/clinicnotes"
                                            render={(route) => (
                                                <PatientClinicNotes
                                                    key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                    {...this.props}
                                                    {...this.state}
                                                    {...route}
                                                />
                                            )}
                                        />

                                        {/** * Patient Completed Procedures Routes */}
                                        {that.props.activePracticePermissions.PatientCompletedProcedure || that.allowAllPermissions ? (
                                                <Route
                                                    exact
                                                    path='/erp/patients/emr/workdone'
                                                    render={(route) => (this.state.currentPatient ? (
                                                        <Redirect
                                                            to={`/erp/patient/${this.state.currentPatient.id}/emr/workdone`}
                                                        />
                                                    ) : (
                                                        <PatientCompletedProcedures
                                                            togglePatientListModal={this.togglePatientListModal}
                                                            key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                            {...this.props}
                                                            {...this.state}
                                                            {...route}
                                                        />
                                                    ))}
                                                />
                                            )
                                            : null}
                                        {that.props.activePracticePermissions.PatientCompletedProcedure || that.allowAllPermissions ? (
                                                <Route
                                                    path='/erp/patient/:id/emr/workdone'
                                                    render={(route) => (
                                                        <PatientCompletedProcedures
                                                            {...that.props}
                                                            key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                            {...this.state}
                                                            {...route}
                                                        />
                                                    )}
                                                />
                                            )
                                            : null}
                                        {/** * Patient Files Routes */}
                                        {that.props.activePracticePermissions.PatientFiles || that.allowAllPermissions ? (
                                                <Route
                                                    exact
                                                    path='/erp/patients/emr/files'
                                                    render={(route) => (this.state.currentPatient ? (
                                                        <Redirect
                                                            to={`/erp/patient/${this.state.currentPatient.id}/emr/files`}
                                                        />
                                                    ) : (
                                                        <PatientFiles
                                                            togglePatientListModal={this.togglePatientListModal}
                                                            key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                            {...route}
                                                            {...this.state}
                                                        />
                                                    ))}
                                                />
                                            )
                                            : null}
                                        {that.props.activePracticePermissions.PatientFiles || that.allowAllPermissions ? (
                                                <Route
                                                    path="/erp/patient/:id/emr/files"
                                                    render={(route) => (
                                                        <PatientFiles
                                                            key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                            {...this.props}
                                                            {...route}
                                                            {...this.state}
                                                        />
                                                    )}
                                                />
                                            )
                                            : null}
                                        {that.props.activePracticePermissions.PatientFiles || that.allowAllPermissions ? (
                                                <Route
                                                    path="/erp/patient/:id/emr/create-medicalCertificate"
                                                    render={(route) => (
                                                        <PatientMedicalCertificate

                                                            key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                            {...this.props}
                                                            {...route}
                                                            {...this.state}
                                                        />
                                                    )}
                                                />
                                            )
                                            : null}
                                        {/** * Patient Prescriptions Routes */}
                                        {that.props.activePracticePermissions.PatientPrescriptions || that.allowAllPermissions ? (
                                                <Route
                                                    exact
                                                    path='/erp/patients/emr/prescriptions'
                                                    render={(route) => (this.state.currentPatient ? (
                                                        <Redirect
                                                            to={`/erp/patient/${this.state.currentPatient.id}/emr/prescriptions`}
                                                        />
                                                    ) : (
                                                        <PatientPrescriptions
                                                            togglePatientListModal={this.togglePatientListModal}
                                                            key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                            {...this.props}
                                                            {...this.state}
                                                            {...route}
                                                        />
                                                    ))}
                                                />
                                            )
                                            : null}
                                        {that.props.activePracticePermissions.PatientPrescriptions || that.allowAllPermissions ? (
                                                <Route
                                                    path='/erp/patient/:id/emr/prescriptions'
                                                    render={(route) => (
                                                        <PatientPrescriptions
                                                            key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                            {...this.props}
                                                            {...this.state}
                                                            {...route}
                                                        />
                                                    )}
                                                />
                                            )
                                            : null}
                                        {/** * Patient Treatment Plan Routes */}
                                        {that.props.activePracticePermissions.PatientTreatmentPlans || that.allowAllPermissions ? (
                                                <Route
                                                    exact
                                                    path='/erp/patients/emr/plans'
                                                    render={(route) => (this.state.currentPatient ? (
                                                        <Redirect
                                                            to={`/erp/patient/${this.state.currentPatient.id}/emr/plans`}
                                                        />
                                                    ) : (
                                                        <PatientTreatmentPlans
                                                            togglePatientListModal={this.togglePatientListModal}
                                                            key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                            {...this.state}
                                                            {...this.props}
                                                            {...route}
                                                        />
                                                    ))}
                                                />
                                            )
                                            : null}
                                        {that.props.activePracticePermissions.PatientTreatmentPlans || that.allowAllPermissions ? (
                                                <Route
                                                    path='/erp/patient/:id/emr/plans'
                                                    render={(route) => (
                                                        <PatientTreatmentPlans
                                                            key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                            {...this.state}
                                                            {...that.props}
                                                            {...route}
                                                        />
                                                    )}
                                                />
                                            )
                                            : null}
                                        {/** * Patient Timeline Routes */}

                                        <Route
                                            path="/erp/patient/:id/emr/timeline"
                                            render={(route) => (that.props.activePracticePermissions.PatientTimeline || that.allowAllPermissions ? (
                                                    <PatientTimeline
                                                        key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                        {...this.state}
                                                        {...route}
                                                    />
                                                ) :
                                                <PermissionDenied/>)}
                                        />
                                        {/** * Patient Lab Order Routes */}
                                        {that.props.activePracticePermissions.PatientLabOrders || that.allowAllPermissions ? (
                                                <Route
                                                    exact
                                                    path='/erp/patient/emr/labtrackings'
                                                    render={(route) => (this.state.currentPatient ? (
                                                            <Redirect
                                                                to={`/erp/patient/${this.state.currentPatient.id}/emr/labtrackings`}
                                                            />
                                                        ) : (
                                                            <PatientLabOrders
                                                                key={this.state.currentPatient}
                                                                {...this.state}
                                                                {...route}
                                                            />
                                                        )
                                                    )}
                                                />
                                            )
                                            : null}

                                        <Route
                                            path='/erp/patient/:id/emr/labtrackings'
                                            render={(route) => (that.props.activePracticePermissions.PatientLabOrders || that.allowAllPermissions ? (
                                                    <PatientLabOrders
                                                        key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                        {...this.state}
                                                        {...route}
                                                    />
                                                ) :
                                                <PermissionDenied/>)}
                                        />

                                        {/** * Patient Invoices Routes */}
                                        {that.props.activePracticePermissions.PatientInvoices || that.allowAllPermissions ? (
                                                <Route
                                                    exact
                                                    path='/erp/patients/billing/invoices'
                                                    render={(route) => (this.state.currentPatient ? (
                                                        <Redirect
                                                            to={`/erp/patient/${this.state.currentPatient.id}/billing/invoices`}
                                                        />
                                                    ) : (
                                                        <PatientInvoices
                                                            togglePatientListModal={this.togglePatientListModal}
                                                            key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                            {...this.props}
                                                            {...this.state}
                                                            {...route}
                                                        />
                                                    ))}
                                                />
                                            )
                                            : null}
                                        <Route
                                            path='/erp/patient/:id/billing/invoices'
                                            render={(route) => (that.props.activePracticePermissions.PatientInvoices || that.allowAllPermissions ? (
                                                    <PatientInvoices
                                                        {...that.state}
                                                        refreshWallet={this.refreshWallet}
                                                        key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                        {...this.props}
                                                        {...this.state}
                                                        {...route}
                                                    />
                                                ) :
                                                <PermissionDenied/>)}
                                        />


                                        {that.props.activePracticePermissions.PatientReturns || that.allowAllPermissions ? (
                                                <Route
                                                    exact
                                                    path='/erp/patients/billing/return/invoices'
                                                    render={(route) => (this.state.currentPatient ? (
                                                        <Redirect
                                                            to={`/erp/patient/${this.state.currentPatient.id}/billing/return/invoices`}
                                                        />
                                                    ) : (
                                                        <PatientInvoicesReturn
                                                            togglePatientListModal={this.togglePatientListModal}
                                                            key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                            {...this.state}
                                                            {...this.props}
                                                            {...route}
                                                        />
                                                    ))}
                                                />
                                            )
                                            : null}


                                        <Route
                                            exact
                                            path='/erp/patient/:id/billing/return/invoices'
                                            render={(route) => (that.props.activePracticePermissions.PatientReturns || that.allowAllPermissions ? (
                                                    <PatientInvoicesReturn
                                                        refreshWallet={this.refreshWallet}
                                                        key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                        {...this.state}
                                                        {...this.props}
                                                        {...route}
                                                    />
                                                ) :
                                                <PermissionDenied/>)}
                                        />


                                        {/** * Patient Payments Routes */}
                                        {that.props.activePracticePermissions.PatientPayments || that.allowAllPermissions ? (
                                                <Route
                                                    path='/erp/patients/billing/payments'
                                                    render={(route) => (this.state.currentPatient ? (
                                                        <Redirect
                                                            to={`/erp/patient/${this.state.currentPatient.id}/billing/payments`}
                                                        />
                                                    ) : (
                                                        <PatientPayments
                                                            togglePatientListModal={this.togglePatientListModal}
                                                            key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                            {...this.state}
                                                            {...this.props}
                                                            {...route}
                                                        />
                                                    ))}
                                                />
                                            )
                                            : null}
                                        <Route
                                            path='/erp/patient/:id/billing/payments'
                                            render={(route) => (that.props.activePracticePermissions.PatientPayments || that.allowAllPermissions ? (
                                                    <PatientPayments
                                                        refreshWallet={this.refreshWallet}
                                                        key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                        {...this.state}
                                                        {...this.props}
                                                        {...route}
                                                    />
                                                ) :
                                                <PermissionDenied/>)}
                                        />

                                        {/** * Patient Ledger Routes */}
                                        {this.state.currentPatient ? (
                                            <Route
                                                exact
                                                path='/erp/patient/:id/billing/ledger'
                                                render={(route) => (that.props.activePracticePermissions.PatientLedger || that.allowAllPermissions ? (
                                                        <PatientLedgers
                                                            refreshWallet={this.refreshWallet}
                                                            key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                            {...this.state}
                                                            {...this.props}
                                                            {...route}
                                                        />
                                                    ) :
                                                    <PermissionDenied/>)}
                                            />
                                        ) : null}

                                        <Route
                                            exact
                                            path='/erp/patient/:id/prescriptions/template/add'
                                            render={(route) => (that.props.activePracticePermissions.PatientPrescriptions || that.allowAllPermissions ? (
                                                    <PrescriptionTemplate
                                                        key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                        {...this.state}
                                                        {...route}
                                                    />
                                                ) :
                                                <PermissionDenied/>)}
                                        />

                                        <Route
                                            path="/erp/patient/:id/booking"
                                            render={(route) => (that.props.activePracticePermissions.PatientBookings || that.props.allowAllPermissions ? (
                                                    <BookingHome
                                                        {...this.state}
                                                        {...this.props}
                                                        {...route}
                                                        key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                    />
                                                ) :
                                                <PermissionDenied/>)}
                                        />
                                        {this.state.currentPatient && this.state.currentPatient.is_agent ? (
                                            <Route
                                                exact
                                                path="/erp/patient/:id/billing/wallet"
                                                render={(route) => (that.props.activePracticePermissions.PatientBookings || that.props.allowAllPermissions ? (
                                                        <PatientWalletLedger
                                                            {...this.state}
                                                            {...this.props}
                                                            {...route}
                                                            key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                        />
                                                    ) :
                                                    <PermissionDenied/>)}
                                            />
                                        ) : null}

                                        {/** * Patient Proforma Invoices Routes */}

                                        {that.props.activePracticePermissions.PatientInvoices || that.allowAllPermissions ? (
                                                <Route
                                                    exact
                                                    path='/erp/patients/proforma-invoice'
                                                    render={(route) => (this.state.currentPatient ? (
                                                        <Redirect
                                                            to={`/erp/patient/${this.state.currentPatient.id}/proforma-invoice`}
                                                        />
                                                    ) : (
                                                        <PatientProformaInvoices
                                                            togglePatientListModal={this.togglePatientListModal}
                                                            key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                            {...this.props}
                                                            {...this.state}
                                                            {...route}
                                                        />
                                                    ))}
                                                />
                                            )
                                            : null}
                                        <Route
                                            path='/erp/patient/:id/proforma-invoice'
                                            render={(route) => (that.props.activePracticePermissions.PatientInvoices || that.allowAllPermissions ? (
                                                    <PatientProformaInvoices
                                                        {...that.state}
                                                        refreshWallet={this.refreshWallet}
                                                        key={this.state.currentPatient ? this.state.currentPatient.id : null}
                                                        {...this.props}
                                                        {...this.state}
                                                        {...route}
                                                    />
                                                ) :
                                                <PermissionDenied/>)}
                                        />

                                        <Route render={(route) =>
                                            (this.state.currentPatient ? (
                                                <Redirect
                                                    to={`/erp/patient/${this.state.currentPatient.id}/profile`}
                                                />
                                            ) : (
                                                <PatientProfile
                                                    {...this.state}
                                                    key={this.state.currentPatient}
                                                    setCurrentPatient={this.setCurrentPatient}
                                                    {...this.props}
                                                />
                                            ))}
                                        />


                                    </Switch>
                                </Content>
                            </Layout>
                        </Layout>
                    )}
                </Spin>
            </Content>
        );
    }
}

export default PatientHome;
