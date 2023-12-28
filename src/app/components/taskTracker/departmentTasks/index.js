import React, {Component} from "react";
import {Row, Card, Tabs, Icon} from "antd";
import DepartmentTask from "./DepartmentTask";
import RecurringTaskList from "../recurringTask/RecurringTaskList";
import DepartmentCompletedTask from "./DepartmentCompletedTask";
import DepartmentBacklogTask from "./DepartmentBacklogTask";
import DepartmentRecurringTaskList from "../recurringTask/DepartmentRecurringTaskList";
import DepartmentEmpTarget from "./DepartmentEmpTarget";
import ReportedTask from "./ReportedTask";

const {TabPane} = Tabs;
export default class MyTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: "2"
        }
    }

    onChange = (activeTab) => {
        this.setState({
            activeTab
        })
    }

    render() {
        const {activeTab} = this.state;
        return (
            <Row>
                <Card>
                    <Tabs defaultActiveKey="1" onChange={(tab) => this.onChange(tab)}>
                        {this.props.user.staff.is_manager ? (
                            <TabPane
                                key="2"
                                tab="Reported Current Tasks"
                            >
                                {activeTab == "2" ? <ReportedTask {...this.props} /> : null}
                            </TabPane>
                        ) : null}
                        {this.props.user.staff.is_manager ? (
                            <TabPane
                              key="3"
                              tab="Department Current Tasks"
                            >
                                {activeTab == "3" ? <DepartmentTask {...this.props} /> : null}
                            </TabPane>
                        ) : null}
                        {this.props.user.staff.is_manager ? (
                            <TabPane
                              key="4"
                              tab="Department Recurring Tasks"

                            >
                                {activeTab == "4" ? <DepartmentRecurringTaskList {...this.props} /> : null}
                            </TabPane>
                        ) : null}
                        {this.props.user.staff.is_manager ? (
                            <TabPane
                              key="6"
                              tab="Department Completed Tasks"

                            >
                                {activeTab == "6" ? <DepartmentCompletedTask {...this.props} /> : null}
                            </TabPane>
                        ) : null}
                        {this.props.user.staff.is_manager ? (
                            <TabPane
                              key="7"
                              tab="Department Backlog"

                            >
                                {activeTab == "7" ? <DepartmentBacklogTask {...this.props} /> : null}
                            </TabPane>
                        ) : null}
                        {this.props.user.staff.is_manager ? (
                            <TabPane
                                key="8"
                                tab="Department Emp target"

                            >
                                {activeTab == "8" ? <DepartmentEmpTarget {...this.props} /> : null}
                            </TabPane>
                        ) : null}
                    </Tabs>
                </Card>
            </Row>
        );
    }

}

