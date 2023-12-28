import { Card, Tabs } from 'antd';
import React from 'react';
import DepartmentTargetList from './DepartmentTargetList';
import DepartmentTargetRecord from './DepartmentTargetRecord'


export default class TargetDepartment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'departmentTarget',
        };
    }

    onChange = (activeTab) => {
        this.setState({
            activeTab,
        });
    };

    render() {
        const { activeTab } = this.state;
        return <Card>

            <Tabs defaultActiveKey="departmentTarget" onChange={(tab) => this.onChange(tab)}>
                <Tabs.TabPane tab={'Department Target List'} key={'departmentTarget'}>
                    {activeTab == 'departmentTarget' ? <DepartmentTargetList {...this.props}/> : null}
                </Tabs.TabPane>
                <Tabs.TabPane tab={'Department Target Record'} key={'departmentTargetRecord'}>
                    {activeTab == 'departmentTargetRecord' ? <DepartmentTargetRecord {...this.props}/> : null}
                </Tabs.TabPane>
            </Tabs>
        </Card>;
    }
}
