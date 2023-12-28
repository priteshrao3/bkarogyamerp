import React, {Component} from "react";
import {Row, Card, Tabs, Icon} from "antd";
import CurrentTask from "./CurrentTask";
import RecurringTaskList from "../recurringTask/RecurringTaskList";
import CompletedTask from "./CompletedTask";
import BacklogTask from "./BacklogTask";
import ReccuringTaskUser from "./ReccuringTaskUser";
import ReccuringTaskUserShow from "./ReccuringTaskUserShow";
import MyReccuringTragetsProgress from "../targets/MyReccuringTragetsProgress";
import MyDashboard from "./MyDashboard";

const {TabPane} = Tabs;
export default class MyTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: "1"
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
                        <TabPane
                          key="1"
                          tab="My Current Tasks"
                        >
                            {activeTab == "1" ? <CurrentTask {...this.props} /> : null}
                        </TabPane>
                        <TabPane
                          key="2"
                          tab="My Recurring Tasks"

                        >
                            {activeTab == "2" ? <RecurringTaskList {...this.props} /> : null}
                        </TabPane>
                        <TabPane
                          key="5"
                          tab="My Completed Tasks"
                        >
                            {activeTab == "5" ? <CompletedTask {...this.props} /> : null}
                        </TabPane>
                        <TabPane tab={'My Reccuring Targets Record'} key={'reccuringTargetRecords'}>
                            {activeTab == 'reccuringTargetRecords' ? <MyReccuringTragetsProgress {...this.props}/> : null}
                        </TabPane>
                        <TabPane
                          key="6"
                          tab="Backlog"
                        >
                            {activeTab == "6" ? <BacklogTask {...this.props} /> : null}
                        </TabPane>
                        <TabPane
                          key="66"
                          tab="Dashboard"
                        >
                            {activeTab == "66" ? <MyDashboard {...this.props} /> : null}
                        </TabPane>
                        {/* <TabPane
                          key="7"
                          tab="testing"
                        >
                            {activeTab == "7" ? <ReccuringTaskUser {...this.props} /> : null}
                        </TabPane>
                        <TabPane
                          key="8"
                          tab="reccuing user task show"
                        >
                            {activeTab == "8" ? <ReccuringTaskUserShow {...this.props} /> : null}
                        </TabPane> */}
                    </Tabs>
                </Card>
            </Row>
        );
    }

}

