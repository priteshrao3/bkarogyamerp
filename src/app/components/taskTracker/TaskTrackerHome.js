import React, {Component} from "react";
import {Layout, Menu} from 'antd';
import {Link, Route, Switch} from 'react-router';
import TaskTrackerSlider from "./TaskTrackerSlider";
import AddOrEditTask from "./newTask/AddOrEditTask";
import MyTask from "./myTask";
import TaskDescription from "./myTask/TaskDescription";
import DepartmentDescription from "./DepartmentDescription";
import AddorEditRecurringTask from "./newTask/AddorEditRecurringTask";
import RecurringTaskList from "./recurringTask/RecurringTaskList";
import DepartmentTasks from "./departmentTasks";
import TaskReport from "./TaskReport";
import AssignRating from "./rating/AssignRating";
import EmpDailySummary from "./summary/EmpDailySummary";
import MyLastRatings from "./rating/MyLastRatings";
import MyDailySummary from "./summary/MyDailySummary";
import Targets from './targets';
import TargetDepartment from './targets/TargetDepartment';
import AllRecurringTask from "./recurringTask/AllRecurringTask";
import PermissionDenied from "../common/errors/PermissionDenied";
import ReccuringTaskUser from "./myTask/ReccuringTaskUser";
import ReccuringTaskUserShow from "./myTask/ReccuringTaskUserShow";

const {Content} = Layout;

class TaskTrackerHome extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }


    render() {
        return (
            <Content className="main-container" style={{minHeight: 280}}>
                <Layout>
                    <TaskTrackerSlider {...this.props} />
                    <Content style={{
                        margin: '24px 16px',
                        minHeight: 280,
                    }}
                    >
                        <Switch >
                            <Route
                                exact
                                path="/erp/tasktracker/createtask"
                                render={(route) => <AddOrEditTask {...route} {...this.props} title="Create New Task"/>}
                            />
                            {this.props.user.staff.is_manager ? (<Route
                                exact
                                path="/erp/tasktracker/createrecurringtask"
                                render={(route) => (
                                    <AddorEditRecurringTask
                                        {...route}
                                        {...this.props}
                                        title="Create New Recurring Task"
                                    />
                                )}
                            />):null}
                            {this.props.user.staff.is_manager ? (<Route
                                exact
                                path="/erp/tasktracker/createrecurringtaskUser"
                                render={(route) => (
                                    <ReccuringTaskUser
                                        {...route}
                                        {...this.props}
                                        title="Create User Recurring Task"
                                    />
                                )}
                            />):null}
                            {this.props.user.staff.is_manager ? (<Route
                                exact
                                path="/erp/tasktracker/allrecurringtaskUser"
                                render={(route) => (
                                    <ReccuringTaskUserShow
                                        {...route}
                                        {...this.props}
                                        title="All User Recurring Task"
                                    />
                                )}
                            />):null}
                            {this.props.user.staff.is_manager ? (<Route
                                exact
                                path="/erp/tasktracker/recurringtask/:id/edit"
                                render={(route) => (
                                    <AddorEditRecurringTask
                                        {...this.props}
                                        {...route}
                                        title="Edit Recurring Task"
                                    />
                                )}
                            />):null}
                            {this.props.activePracticePermissions.AllRecurringTasks ? (
                            <Route
                                exact
                                path="/erp/tasktracker/allrecurring"
                                render={(route) => <AllRecurringTask {...route} {...this.props} />}
                            />       ) : null}
                            <Route

                                path="/erp/tasktracker/mytask"
                                render={(route) => <MyTask {...this.props} {...route}  />}
                            />
                            <Route
                                exact
                                path="/erp/tasktracker/lastrating"
                                render={(route) => <MyLastRatings {...route} {...this.props} />}
                            />
                            {this.props.user.staff.is_manager ? (
                                <Route
                                    exact
                                    path="/erp/tasktracker/departmenttask"
                                    render={(route) => <DepartmentTasks {...route} {...this.props} />}
                                />
                            ) : null}
                            {this.props.user.staff.is_manager ? (
                                <Route
                                    exact
                                    path="/erp/tasktracker/summary"
                                    render={(route) => <EmpDailySummary {...route} {...this.props} />}
                                />
                            ) : null}
                            <Route
                                exact
                                path="/erp/tasktracker/daily-summary"
                                render={(route) => <MyDailySummary {...route} {...this.props} />}
                            />
                            <Route
                                exact
                                path="/erp/tasktracker/recurringtask"
                                render={(route) => <RecurringTaskList {...route} {...this.props} />}
                            />
                            <Route
                                path="/erp/tasktracker/taskreport"
                                render={(route) => <TaskReport {...route} {...this.props} />}
                            />
                            
                            <Route
                                exact
                                path="/erp/tasktracker/task/:id/view"
                                render={(route) => <TaskDescription {...this.props} {...route} />}
                            />
                            <Route
                                exact
                                path="/erp/tasktracker/task/:id/edit"
                                render={(route) => <AddOrEditTask {...this.props} {...route} title="Edit Task"/>}
                            />
                            <Route
                                exact
                                path="/erp/tasktracker/departmentdesc"
                                render={(route) => <DepartmentDescription {...route} {...this.props} />}
                            />
                            <Route
                                exact
                                path="/erp/tasktracker/rating"
                                render={(route) => <AssignRating {...route} {...this.props} />}
                            />
                            <Route
                                exact
                                path="/erp/tasktracker/targets"
                                render={(route) => <Targets {...route} {...this.props} />}
                            />
                             {this.props.user.staff.is_manager ? (
                             <Route
                                exact
                                path="/erp/tasktracker/department"
                                render={(route) => <TargetDepartment {...route} {...this.props} />}
                            />):null}
                        </Switch>
                    </Content>
                </Layout>

            </Content>
        );
    }
}

export default TaskTrackerHome;
