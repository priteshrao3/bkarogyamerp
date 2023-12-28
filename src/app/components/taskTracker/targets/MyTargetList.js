import CustomizedTable from '../../common/CustomizedTable';
import React from 'react';
import { Card, Divider, Popconfirm } from 'antd';
import { getAPI } from '../../../utils/common';
import { TARGET_HEADS } from '../../../constants/api';

export default class MyTargetList extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            targets: [],
            loading:false
        };
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        const that = this;
        that.setState({
            loading:true
        })
        const successFn = function(data) {
            that.setState({
                targets: data,
                loading: false,
            });
        };
        const errorFn = function() {
            that.setState({
                loading: false,
            });
        };
        const params = {
            department: this.props.user.staff.department,
            designation: this.props.user.staff.designation,
        };
        getAPI(TARGET_HEADS, successFn, errorFn, params);
    }

    render() {

        let i = 1;
        const columns = [{
            title: 'S.No',
            dataIndex: 'sno',
            key: 'sno',
            render: (value, record,index) => <span>{index+1}</span>,
        }, {
            title: 'Target Name',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: 'Project ',
            dataIndex: 'project.value',
            key: 'project',
        }];
        return <>
            <CustomizedTable loading={this.state.loading} columns={columns} dataSource={this.state.targets}
                             hideReport={true}/>
        </>;
    }
}
