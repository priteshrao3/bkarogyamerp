import { Card, Tabs } from 'antd';
import React from 'react';
import AllTargets from './AllTargets';
import MyTargetList from './MyTargetList';
import MonthlyTarget from './MonthlyTarget';
import MyDailyTargets from './MyDailyTargets';
import MyReccuringTragetsProgress from './MyReccuringTragetsProgress';


export default class Targets extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'myTarget',
        };
    }
    componentWillUnmount() {
        // Add cleanup logic here (unsubscribe, clear timeouts, etc.)
        // This ensures that no asynchronous tasks are trying to update the state
    }

    onChange = (activeTab) => {
        this.setState({
            activeTab,
        });
    };

    render() {
        const { activeTab } = this.state;
        return <Card>
            <Tabs defaultActiveKey="myTarget" onChange={(tab) => this.onChange(tab)}>
                <Tabs.TabPane tab={'My Targets'} key={'myTarget'}>
                    {activeTab == 'myTarget' ? <MyTargetList {...this.props}/> : null}
                </Tabs.TabPane>
                <Tabs.TabPane tab={'My Targets Record'} key={'targetRecords'}>
                    {activeTab == 'targetRecords' ? <MyDailyTargets {...this.props}/> : null}
                </Tabs.TabPane>
                <Tabs.TabPane tab={'My Reccuring Targets Record'} key={'reccuringTargetRecords'}>
                    {activeTab == 'reccuringTargetRecords' ? <MyReccuringTragetsProgress {...this.props}/> : null}
                </Tabs.TabPane>

                {this.props.activePracticePermissions.TaskHeads ?
                    <Tabs.TabPane tab={'Organisation Targets'} key={'allTarget'}>
                        {activeTab == 'allTarget' ? <AllTargets {...this.props}/> : null}
                    </Tabs.TabPane> : null}
                {this.props.activePracticePermissions.MonthlyTaskTargets ?
                    <Tabs.TabPane tab={'Monthly Targets'} key={'monthlyTarget'}>
                        {activeTab == 'monthlyTarget' ? <MonthlyTarget {...this.props}/> : null}
                    </Tabs.TabPane> : null}
            </Tabs>
        </Card>;
    }
}
