import React from "react";
import {TASK_REPORT} from "../../../constants/api";
import {getAPI} from "../../../utils/common";
import {sendReportMail} from "../../../utils/clinicUtils";
import {Table, Select} from 'antd';


export default class CompleteTaskReport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            complist: [],
            loading: false,
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            mailingUsersList: this.props.mailingUsersList
        };
        this.ListView = this.ListView.bind(this);
    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate
            || this.props.endDate != newProps.endDate ||
            this.props.tasktype != newProps.tasktype
        )
            this.setState(
                {
                    startDate: newProps.startDate,
                    endDate: newProps.endDate,
                    tasktype: newProps.tasktype
                },
                function () {
                    that.ListView();
                },
            );
    }


    componentDidMount() {
        this.ListView();
    }

    ListView() {
        const that = this;
        const {startDate, endDate} = this.state;
        that.setState({
            loading: true
        });
        const successFn = function (data) {
            let dataObject = {...data};
            console.log(dataObject)
            let prioritiesList = data.priorities;
            delete dataObject.priorities;
            let tableData = [];
            let departments = Object.keys(dataObject);
            departments.forEach(function (dept) {
                let totalTask = 0;
                prioritiesList.forEach(function (priority) {
                    totalTask += dataObject[dept][priority] || 0;
                })
                tableData.push({department: dept, ...dataObject[dept],total:totalTask});
            })
            that.setState({
                complist: tableData,
                priorities: prioritiesList,
                loading: false,
            });
        }
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        let apiParams = {
            type: 'DEPARTMENT',
            start: startDate.format('YYYY-MM-DD'),
            end: endDate.format('YYYY-MM-DD'),
        }
        if (this.state.tasktype)
            apiParams.incomplete = this.state.tasktype
        getAPI(TASK_REPORT, successFn, errorFn, apiParams);
    }

    sendMail = (mailTo) => {
        const that = this;
        const {startDate, endDate} = this.state;
        let apiParams = {
            type: 'DEPARTMENT',
            start: startDate.format('YYYY-MM-DD'),
            end: endDate.format('YYYY-MM-DD'),
        }
        if (this.state.tasktype)
            apiParams.incomplete = this.state.tasktype
        apiParams.mail_to = mailTo;
        sendReportMail(TASK_REPORT, apiParams);

    }

    render() {
        const {complist, priorities} = this.state;
        console.log();
        let columns = [
            {
                title: 'Departments',
                key: 'dept',
                dataIndex: 'department'
            }
        ];
        if (priorities)
            priorities.forEach(function (value) {
                columns.push({title: value, dataIndex: value, render: (val) => val || 0})
            })
        columns.push({title:'Total',dataIndex:'total',key:'total'});
        return (
            <div>
                <h2>
                    Department Summary
                    <span style={{float: 'right'}}>
                <p><small>E-Mail To:&nbsp;</small>
                    <Select onChange={(e) => this.sendMail(e)} style={{width: 200}}>
                        {this.state.mailingUsersList.map(item => (
                            <Select.Option
                                value={item.email}
                            >{item.name}
                            </Select.Option>
                        ))}
                    </Select>
                </p>
            </span>
                </h2>
                <Table
                    loading={this.state.loading}
                    dataSource={complist}
                    columns={columns}
                    pagination={false}
                ></Table>
            </div>
        )
    }
}
