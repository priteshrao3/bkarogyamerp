import React, {Component} from "react";
import {Divider, Icon, Layout, Menu} from 'antd';
import {Link, Switch} from 'react-router-dom';
import PermissionDenied from "../common/errors/PermissionDenied";

const {Sider} = Layout;

class TaskTrackerSlider extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        return (
            <Sider
                trigger={null}
                collapsible
                style={{overflow: 'auto', minHeight: '100vh', background: '#fff'}}
            >

                <Menu mode="inline" defaultSelectedKeys={['3']}>
                    <Menu.ItemGroup key="#tasktracker" title={<Divider style={{margin: '0px'}}>Task Tracker</Divider>}>
                        <Menu.Item key="1">
                            <Link to="/erp/tasktracker/createtask">
                                <Icon type="plus"/>New Task
                            </Link>
                        </Menu.Item>
                        {this.props.user.staff.is_manager ? (<Menu.Item key="2">
                            <Link to="/erp/tasktracker/createrecurringtask">
                                <Icon type="plus"/>New Recurring Task
                            </Link>
                        </Menu.Item>) : null}
                        {this.props.activePracticePermissions.AllRecurringTasks ? (<Menu.Item key="12">
                            <Link to="/erp/tasktracker/allrecurring">
                                <Icon type="retweet"/>All Recurring Task
                            </Link>
                        </Menu.Item>) : null}
                        {this.props.user.staff.is_manager ? (<Menu.Item key="15" style={{backgroundColor:"lightgreen"}}  >
                            <Link to="/erp/tasktracker/createrecurringtaskUser">
                                <Icon type="plus"/>New* Recurring Task
                            </Link>
                        </Menu.Item>) : null}
                        {this.props.user.staff.is_manager ? (<Menu.Item key="14" style={{backgroundColor:"lightgreen"}}  >
                            <Link to="/erp/tasktracker/allrecurringtaskUser">
                                <Icon type="retweet"/>All* User Recurring 
                            </Link>
                        </Menu.Item>) : null}
                        <Menu.Item key="3">
                            <Link to="/erp/tasktracker/mytask">
                                <Icon type="check-circle"/>My Task
                            </Link>
                        </Menu.Item>
                        {this.props.user.staff.is_manager ? (<Menu.Item key="4">
                            <Link to="/erp/tasktracker/departmenttask">
                                <Icon type="retweet"/>Department Task
                            </Link>
                        </Menu.Item>) : null}
                        <Menu.Item key="5">
                            <Link to="/erp/tasktracker/taskreport">
                                <Icon type="ordered-list"/>Task Report
                            </Link>
                        </Menu.Item>
                        {this.props.user.staff.is_manager ? (<Menu.Item key="6">
                            <Link to="/erp/tasktracker/rating">
                                <Icon type="star"/>Rating & Review
                            </Link>
                        </Menu.Item>) : null}
                        {this.props.user.staff.is_manager ? (<Menu.Item key="7">
                            <Link to="/erp/tasktracker/summary">
                                <Icon type="user"/>Emp Day Summary
                            </Link>
                        </Menu.Item>) : null}
                        <Menu.Item key="8">
                            <Link to="/erp/tasktracker/lastrating">
                                <Icon type="star"/>My Last Ratings
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="9">
                            <Link to="/erp/tasktracker/daily-summary">
                                <Icon type="user"/>My Daily Summary
                            </Link>
                        </Menu.Item>
                         <Menu.Item key="10">
                           <Link to="/erp/tasktracker/targets">
                               <Icon type="pushpin" />Targets
                           </Link>
                         </Menu.Item>
                         <Menu.Item key="11">
                           <Link to="/erp/tasktracker/department">
                               <Icon type="pushpin" />Department Targets
                           </Link>
                         </Menu.Item>

                    </Menu.ItemGroup>
                </Menu>

            </Sider>
        );
    }

}

export default TaskTrackerSlider;
