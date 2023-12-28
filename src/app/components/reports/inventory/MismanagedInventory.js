import React from "react";
import {Card,Table,Form,Select} from "antd";
import {MIS_INVENTORY_REPORT} from "../../../constants/api";
import {getAPI} from "../../../utils/common";
import { sendReportMail} from "../../../utils/clinicUtils";

class MismanagedInventory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            mailingUsersList: this.props.mailingUsersList,
            practices: [],
            items: []
        }
        this.loadPractices = this.loadPractices.bind(this);
    }

    componentDidMount() {
        this.loadPractices();

    }


    loadPractices() {
        const that = this;
        that.setState({
            loading:true
        })
        const successFn = function (data) {
            that.setState({
                loading: false,
                practices: data.practices,
                items: data.item_detail
            })
        }

        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        const apiParams = {
            practice:that.props.active_practiceId,
        }
        getAPI(MIS_INVENTORY_REPORT, successFn, errorFn,apiParams);
    }

    sendMail = (mailTo) => {
        const that=this;
        const apiParams = {
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD')
        }
        apiParams.mail_to = mailTo;
        sendReportMail(MIS_INVENTORY_REPORT, apiParams)
    }


    addDataToColumn = (columnName,id) => {
        const columnData = {
            title: columnName,
            key: `practice_${id}`,
            dataIndex: `practice_${id}`,
            render: (value) => <span>{value || 'Not exist'}</span>
        };
        return columnData
    }

    render() {
        const that = this;
        const {getFieldDecorator} = this.props.form;

        const columns = [{
            title: 'Item',
            key: 'name',
            dataIndex: 'name',
            render: (value) => <span>{value || ''}</span>
        }];

        {
            this.state.practices.map((item) => {
                columns.push(this.addDataToColumn(item.name,item.id))
            })
        }

        return (
    <div>
            <h2>Mismanaged Inventory
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
            <Card bodyStyle={{padding:0}}>
                <Table
                  loading={this.state.loading}
                  bordered
                  rowKey={(record) => record.id}
                  pagination={false}
                  columns={columns}
                  dataSource={this.state.items}
                />
            </Card>
    </div>
)
    }
}


export default Form.create()(MismanagedInventory);
