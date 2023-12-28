import React, { Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Layout, Spin, Button } from 'antd';
import AppHeader from './AppHeader';
import AppSider from './AppSider';
import { loadUserDetails, loggedInactivePractice, loggedInUserPractices, setCurrentPractice } from '../../utils/auth';
import Error404 from '../common/errors/Error404';
import Profile from '../auth/Profile';
import PrintPatientForm from '../patients/patient/PrintPatientForm';
import BlockCalendar from '../calendar/BlockCalendar';
import PermissionDenied from '../common/errors/PermissionDenied';
import SuggestionBox from './SuggestionBox';
import ErrorBoundary from '../../../crashHandling/ErrorBoundary';
import AppFooter from './AppFooter';
import ConversionHome from '../conversion/ConversionHome';
import MeetingCall from '../conference/MeetingCall';
import CreateAppointment from '../calendar/CreateAppointment';
import { loadConfigParameters } from '../../utils/clinicUtils';
import moment from 'moment';
import { getAPI } from '../../utils/common';
import { EMPLOYEE_TASK_SUMMARY } from '../../constants/api';
import RemainderTaskTrackerUpdate from '../common/RemainderTaskTrackerUpdate';
import { REFRESH_TASK_TRACKER, REMAINDER_DELAY_TIME } from '../../constants/dataKeys';

const AdvisorDash = React.lazy(() => import('../advisors/AdvisorDash'));
const Calendar = React.lazy(() => import('../calendar/Calendar'));
const ReportsHome = React.lazy(() => import('../reports/ReportsHome'));
const WebAdminHome = React.lazy(() => import('../webAdmin/WebAdminHome'));
const InventoryHome = React.lazy(() => import('../inventory/InventoryHome'));
const MeetingBooking = React.lazy(() => import('../conference/meeting/MeetingBooking'));
const SettingsDash = React.lazy(() => import('../settings/SettingsDash'));
const PatientHome = React.lazy(() => import('../patients/PatientHome'));
const TaskTrackerHome = React.lazy(() => import('../taskTracker/TaskTrackerHome'));

class AppBase extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: false,
            active_practiceId: loggedInactivePractice(),
            practiceList: loggedInUserPractices(),
            activePracticeData: null,
            activePracticePermissions: {},
            specialisations: null,
            allowAllPermissions: false,
            loadingPermissions: true,
            visible: false,
            visibleRemainderTaskTracker: false,
        };
        this.activeData = this.activeData.bind(this);
        // this.clinicData = this.clinicData.bind(this);
        this.switchPractice = this.switchPractice.bind(this);
    }

    componentDidMount = async () => {
        let eleven_AM = moment('11:00 am', 'HH:mm a');
        let current_hour_time = moment().format('HH');
        this.activeData();
        await loadConfigParameters(this, ['config_date_time']);
        if (current_hour_time >= moment(eleven_AM).format('HH')) {
            setInterval(this.checkTaskTracker, REFRESH_TASK_TRACKER);
        }


    };
    checkTaskTracker = async () => {
        await loadConfigParameters(this, ['config_date_time']);
        await this.loadSummary();
    };
    loadSummary = async () => {
        let that = this;
        let { config_date_time,visibleRemainderTaskTracker } = that.state;
        const successFn = function(data) {
            let last_update_task = data[data.length - 1];
            // console.log('last_update_task', last_update_task.time);
            // console.log('last_update_task2', config_date_time);
            let hours = moment(config_date_time).diff(moment(last_update_task.time), 'hours');

            console.log('hours', hours);
            if (hours >= REMAINDER_DELAY_TIME) {
                that.setState({
                    visibleRemainderTaskTracker: !visibleRemainderTaskTracker,
                });


            }
        };
        const errorFn = function() {

        };
        const apiParams = {
            date: moment().format('YYYY-MM-DD'),
            user: this.props.user.id,
        };
        if (this.props.user)
            getAPI(EMPLOYEE_TASK_SUMMARY, successFn, errorFn, apiParams);
    };

    handleCancelRemainderTaskTracker=()=>{
        let {visibleRemainderTaskTracker } = this.state;
        this.setState({
            visibleRemainderTaskTracker: !visibleRemainderTaskTracker,
        })
    }

    toggleSider = option => {
        this.setState({
            collapsed: !!option,
        });
    };

    activeData() {
        const that = this;
        const successFn = function(data) {
            that.setState(
                function(prevState) {
                    const permissions = {};
                    data.practice_permissions.forEach(function(permission) {
                        permissions[permission.codename] = permission;
                    });
                    data.global_permissions.forEach(function(permission) {
                        permissions[permission.codename] = permission;
                    });
                    return {
                        activePracticePermissions: permissions,
                        loadingPermissions: false,
                        practiceList: loggedInUserPractices(),
                    };
                },
                function() {
                    that.props.updateUserInfo();
                },
            );
        };
        const errorFn = function() {
            that.setState({
                loadingPermissions: false,
            });
        };

        that.setState(
            function(prevState) {
                let activePracticeObj = null;
                prevState.practiceList.forEach(function(practiceObj) {
                    if (practiceObj.practice.id == prevState.active_practiceId) {
                        activePracticeObj = practiceObj.practice;
                    }
                });
                if (activePracticeObj || !prevState.practiceList.length)
                    return {
                        activePracticeData: activePracticeObj,
                        loadingPermissions: true,
                    };
                setCurrentPractice(prevState.practiceList[0].practice.id);
                return {
                    activePracticeData: prevState.practiceList[0].practice,
                    active_practiceId: prevState.practiceList[0].practice.id,
                    loadingPermissions: true,
                };
            },
            function() {
                loadUserDetails(that.state.active_practiceId, successFn, errorFn);
            },
        );
    }

    switchPractice(practiceId) {
        const that = this;
        that.setState(
            function(prevState) {
                return {
                    active_practiceId: practiceId,
                };
            },
            function() {
                setCurrentPractice(practiceId);
                that.activeData();
            },
        );
    }

    showDrawer = () => {
        this.setState({
            visible: true,
        });
    };

    onClose = () => {
        this.setState({
            visible: false,
        });
    };

    render() {
        const that = this;
        let { visibleRemainderTaskTracker } = that.state;
        if (this.state.loadingPermissions) {
            return (
                <Spin spinning={this.state.loadingPermissions} tip="Loading Permissions....">
                    <div style={{ width: '100vw', height: '100vh' }}/>
                </Spin>
            );
        }
        return (
            <Layout style={{ minHeight: '100vh' }}>
                {visibleRemainderTaskTracker ? <RemainderTaskTrackerUpdate onCancel={that.handleCancelRemainderTaskTracker}/> : null}
                <ErrorBoundary>
                    <div
                        style={{
                            position: 'fixed',
                            left: '20px',
                            bottom: '20px',
                            zIndex: '20',
                        }}
                    >
                        <Button
                            type="primary"
                            shape="circle"
                            icon="mail"
                            size="large"
                            onClick={this.showDrawer}
                        />
                    </div>
                    <Switch>
                        <Route
                            path="/erp/patients/:id/patientprintform"
                            render={route => (
                                <PrintPatientForm
                                    {...this.state}
                                    {...this.props}
                                    key={that.state.active_practiceId}
                                    {...route}
                                />
                            )}
                        />
                        <Route
                            path="/erp/patients/patientprintform"
                            render={route => (
                                <PrintPatientForm
                                    {...this.state}
                                    key={that.state.active_practiceId}
                                />
                            )}
                        />

                        <Route>
                            <Layout>
                                <AppSider
                                    showDrawer={this.showDrawer}
                                    toggleSider={this.toggleSider}
                                    {...this.state}
                                    key={that.state.active_practiceId}
                                    {...this.props}
                                />
                                <Layout>
                                    <AppHeader
                                        {...this.props}
                                        {...this.state}
                                        switchPractice={this.switchPractice}
                                        toggleSider={this.toggleSider}
                                    />
                                    <div style={{ minHeight: 'calc(100vh - 95px)' }}>
                                        <Switch>
                                            {this.state.activePracticePermissions.SettingsAgents ? (
                                                <Route
                                                    path="/erp/advisors"
                                                    render={route => (
                                                        <Suspense
                                                            fallback={
                                                                <Spin
                                                                    spinning
                                                                    tip="Loading Advisor Panel...."
                                                                >
                                                                    <div
                                                                        style={{
                                                                            width: '100vw',
                                                                            height: '100vh',
                                                                        }}
                                                                    />
                                                                </Spin>
                                                            }
                                                        >
                                                            <AdvisorDash
                                                                {...this.state}
                                                                {...this.props}
                                                                {...route}
                                                                key={that.state.active_practiceId}
                                                            />
                                                        </Suspense>
                                                    )}
                                                />
                                            ) : null}
                                            <Route
                                                exact
                                                path="/erp/webcall/:meetingId"
                                                render={(route) =>
                                                    <MeetingCall {...this.state} {...this.props} {...route} />}
                                            />
                                            {this.state.activePracticePermissions.WebAdmin ? (
                                                <Route
                                                    path="/erp/web"
                                                    render={route => (
                                                        <Suspense
                                                            fallback={
                                                                <Spin
                                                                    spinning
                                                                    tip="Loading Web Admin Panel...."
                                                                >
                                                                    <div
                                                                        style={{
                                                                            width: '100vw',
                                                                            height: '100vh',
                                                                        }}
                                                                    />
                                                                </Spin>
                                                            }
                                                        >
                                                            <WebAdminHome
                                                                {...this.state}
                                                                {...this.props}
                                                                {...route}
                                                                key={that.state.active_practiceId}
                                                            />
                                                        </Suspense>
                                                    )}
                                                />
                                            ) : null}
                                            {this.state.activePracticePermissions.WebAdmin ? (
                                                <Route
                                                    path="/erp/mission"
                                                    render={route => (
                                                        <Suspense
                                                            fallback={
                                                                <Spin
                                                                    spinning
                                                                    tip="Loading Web Admin Panel...."
                                                                >
                                                                    <div
                                                                        style={{
                                                                            width: '100vw',
                                                                            height: '100vh',
                                                                        }}
                                                                    />
                                                                </Spin>
                                                            }
                                                        >
                                                            <WebAdminHome
                                                                {...this.state}
                                                                {...this.props}
                                                                {...route}
                                                                key={that.state.active_practiceId}
                                                            />
                                                        </Suspense>
                                                    )}
                                                />
                                            ) : null}
                                            <Route
                                                exact
                                                path="/erp/calendar/create-appointment"
                                                render={(route) => (that.state.activePracticePermissions.AddAppointment || that.state.allowAllPermissions ? (
                                                        <CreateAppointment
                                                            {...this.state}
                                                            {...this.props}
                                                            {...route}
                                                            startTime={this.state.startTime}
                                                        />
                                                    ) :
                                                    <PermissionDenied/>)}
                                            />

                                            <Route
                                                exact
                                                path="/erp/calendar/:appointmentid/edit-appointment"
                                                render={(route) => (that.state.activePracticePermissions.EditAppointment || that.state.allowAllPermissions ? (
                                                        <CreateAppointment
                                                            {...this.state}
                                                            {...this.props}
                                                            {...route}
                                                            startTime={this.state.startTime}
                                                        />
                                                    ) :
                                                    <PermissionDenied/>)}
                                            />
                                            <Route
                                                exact
                                                path="/erp/calendar/blockcalendar"
                                                render={route =>
                                                    that.state.activePracticePermissions
                                                        .BlockCalendar ||
                                                    that.state.allowAllPermissions ? (
                                                        <BlockCalendar
                                                            {...this.state}
                                                            {...this.props}
                                                            {...route}
                                                        />
                                                    ) : (
                                                        <PermissionDenied/>
                                                    )
                                                }
                                            />
                                            <Route
                                                path="/erp/calendar"
                                                render={route =>
                                                    that.state.activePracticePermissions
                                                        .ViewCalendar ? (
                                                        <Suspense
                                                            fallback={
                                                                <Spin
                                                                    spinning
                                                                    tip="Loading Calendar..."
                                                                >
                                                                    <div
                                                                        style={{
                                                                            width: '100vw',
                                                                            height: '100vh',
                                                                        }}
                                                                    />
                                                                </Spin>
                                                            }
                                                        >
                                                            <Calendar
                                                                {...that.state}
                                                                {...that.props}
                                                                {...route}
                                                                key={that.state.active_practiceId}
                                                            />
                                                        </Suspense>
                                                    ) : (
                                                        <PermissionDenied/>
                                                    )
                                                }
                                            />
                                            <Route
                                                path="/erp/patient/:id"
                                                render={route => (
                                                    <Suspense
                                                        fallback={
                                                            <Spin
                                                                spinning
                                                                tip="Loading Patient Panel..."
                                                            >
                                                                <div
                                                                    style={{
                                                                        width: '100vw',
                                                                        height: '100vh',
                                                                    }}
                                                                />
                                                            </Spin>
                                                        }
                                                    >
                                                        <PatientHome
                                                            {...this.state}
                                                            {...this.props}
                                                            {...route}
                                                            key={`${that.state.active_practiceId}|${route.match.params.id}`}
                                                        />
                                                    </Suspense>
                                                )}
                                            />

                                            <Route
                                                path="/erp/settings"
                                                render={route => (
                                                    <Suspense
                                                        fallback={
                                                            <Spin
                                                                spinning
                                                                tip="Loading Settings Panel..."
                                                            >
                                                                <div
                                                                    style={{
                                                                        width: '100vw',
                                                                        height: '100vh',
                                                                    }}
                                                                />
                                                            </Spin>
                                                        }
                                                    >
                                                        <SettingsDash
                                                            {...this.state}
                                                            {...this.props}
                                                            {...route}
                                                            key={that.state.active_practiceId}
                                                            refreshClinicData={this.activeData}
                                                        />
                                                    </Suspense>
                                                )}
                                            />
                                            <Route
                                                path="/erp/inventory"
                                                render={route => (
                                                    <Suspense
                                                        fallback={
                                                            <Spin
                                                                spinning
                                                                tip="Loading Inventory..."
                                                            >
                                                                <div
                                                                    style={{
                                                                        width: '100vw',
                                                                        height: '100vh',
                                                                    }}
                                                                />
                                                            </Spin>
                                                        }
                                                    >
                                                        <InventoryHome
                                                            {...this.state}
                                                            {...this.props}
                                                            {...route}
                                                            key={that.state.active_practiceId}
                                                        />
                                                    </Suspense>
                                                )}
                                            />
                                            <Route
                                                path="/erp/reports/:type"
                                                render={route => (
                                                    <Suspense
                                                        fallback={
                                                            <Spin spinning tip="Loading Reports...">
                                                                <div
                                                                    style={{
                                                                        width: '100vw',
                                                                        height: '100vh',
                                                                    }}
                                                                />
                                                            </Spin>
                                                        }
                                                    >
                                                        <ReportsHome
                                                            {...this.state}
                                                            {...this.props}
                                                            {...route}
                                                            key={that.state.active_practiceId}
                                                        />
                                                    </Suspense>
                                                )}
                                            />

                                            <Route
                                                path="/erp/profile"
                                                render={route => (
                                                    <Profile
                                                        {...this.state}
                                                        {...this.props}
                                                        {...route}
                                                        key={that.state.active_practiceId}
                                                    />
                                                )}
                                            />

                                            <Route
                                                path="/erp/meeting-booking"
                                                render={route =>
                                                    this.state.activePracticePermissions
                                                        .ViewMeeting ||
                                                    this.state.allowAllPermissions ? (
                                                        <MeetingBooking
                                                            {...this.state}
                                                            {...this.props}
                                                            {...route}
                                                            key={that.state.active_practiceId}
                                                        />
                                                    ) : (
                                                        <PermissionDenied/>
                                                    )
                                                }
                                            />
                                            <Route
                                                path="/erp/conversion"
                                                render={route => (
                                                    <ConversionHome
                                                        {...this.state}
                                                        {...this.props}
                                                        {...route}
                                                        key={that.state.active_practiceId}
                                                    />
                                                )}
                                            />
                                            <Route
                                                path="/erp/tasktracker"
                                                render={route => (
                                                    <Suspense
                                                        fallback={
                                                            <Spin
                                                                spinning
                                                                tip="Loading Task Track..."
                                                            >
                                                                <div
                                                                    style={{
                                                                        width: '100vw',
                                                                        height: '100vh',
                                                                    }}
                                                                />
                                                            </Spin>
                                                        }
                                                    >
                                                        <TaskTrackerHome
                                                            {...this.state}
                                                            {...this.props}
                                                            {...route}
                                                            key={that.state.active_practiceId}
                                                        />
                                                    </Suspense>
                                                )}
                                            />

                                            {this.state.activePracticePermissions.ViewCalendar ? (
                                                <Route
                                                    exact
                                                    path="/erp/"
                                                    render={route => (
                                                        <Suspense
                                                            fallback={
                                                                <Spin
                                                                    spinning
                                                                    tip="Loading Calendar..."
                                                                >
                                                                    <div
                                                                        style={{
                                                                            width: '100vw',
                                                                            height: '100vh',
                                                                        }}
                                                                    />
                                                                </Spin>
                                                            }
                                                        >
                                                            <Calendar
                                                                {...this.state}
                                                                {...this.props}
                                                                {...route}
                                                                key={that.state.active_practiceId}
                                                            />
                                                        </Suspense>
                                                    )}
                                                />
                                            ) : null}

                                            <Route
                                                path="/erp/"
                                                render={route => (
                                                    <Suspense
                                                        fallback={
                                                            <Spin
                                                                spinning
                                                                tip="Loading Patient Panel...."
                                                            >
                                                                <div
                                                                    style={{
                                                                        width: '100vw',
                                                                        height: '100vh',
                                                                    }}
                                                                />
                                                            </Spin>
                                                        }
                                                    >
                                                        <PatientHome
                                                            {...this.state}
                                                            {...this.props}
                                                            {...route}
                                                            key={that.state.active_practiceId}
                                                        />
                                                    </Suspense>
                                                )}
                                            />

                       


                                            <Route component={Error404}/>
                                        </Switch>
                                    </div>
                                    <AppFooter/>
                                </Layout>
                            </Layout>
                        </Route>
                    </Switch>





                    
                    
                    


                    <SuggestionBox {...this.state} close={this.onClose}/>
                </ErrorBoundary>

                   
               
            </Layout>
        );
    }
}

export default AppBase;
