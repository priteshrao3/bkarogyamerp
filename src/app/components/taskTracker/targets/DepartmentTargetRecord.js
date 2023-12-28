import CustomizedTable from "../../common/CustomizedTable";
import React from "react";
import { Col, DatePicker, Form, Modal, Row } from "antd";
import moment from "moment";
import { displayMessage, getAPI } from "../../../utils/common";
import {
    TARGET_HEADS,
    TASK_MONTHLY_TARGET,
    TASK_USER_DAILY_TARGET,
    TASK_USER_DAILY_TARGET_STATUS,
    Task_DEPARTMENT_DAILY_TARGET_STATUS
} from "../../../constants/api";
import DynamicFieldsForm from "../../common/DynamicFieldsForm";
import { LABEL_FIELD, NUMBER_FIELD, SUCCESS_MSG_TYPE, TEXT_FIELD } from "../../../constants/dataKeys";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";
import Progress from "antd/es/progress";

export default class DepartmentTargetRecord extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            targets: [],
            currentDate: moment(),
            loading: false,
            filterStrings: {
                date: moment().format("YYYY-MM-DD")
            },
            ismonth:false
        };
    }

    componentDidMount() {
        this.loadData();
    }

    loadData = (page = 1) => {
        const that = this;
        that.setState({
            loading: true
        });
        const successFn = function(data) {
            if (data.current == 1) {
                that.setState({
                    targets: data.results,
                    loading: false,
                    loadMoreReport: data.next
                });
            } else {
                that.setState(function(prevState) {
                    return {
                        targets: [...prevState.targets, ...data.results],
                        loading: false,
                        loadMoreReport: data.next
                    };
                });
            }
        };
        const errorFn = function() {
            that.setState({
                loading: false
            });
        };
        const apiParams = {
            ...this.state.filterStrings,
            department: this.props.user.staff.department,
            page
        };
        getAPI(Task_DEPARTMENT_DAILY_TARGET_STATUS, successFn, errorFn, apiParams);
    };

    applyFilter = (type, value) => {
        const that = this;
        this.setState(function(prevState) {
            return {
                filterStrings: { ...prevState.filterStrings, [type]: value }
            };
        }, function() {
            that.loadData();
        });
    };

    editTarget = (record) => {
        this.setState({
            editRecord: record,
            visible: true
        });
    };

    editCancel = () => {
        this.setState({
            editRecord: null,
            visible: false
        });
    };

    render() {
        const that = this;
        const columns = [
            {
                title: "Staff Name",
                key: "username",
                dataIndex: "staff.user.first_name"

            },
            {
                title: "Staff Id",
                key: "staffid",
                dataIndex: "staff.emp_id"

            },
            {
                title: "Target Name",
                dataIndex: "targets.name",
                key: "name"
            }, {
                title: "Department ",
                dataIndex: "targets.department.value",
                key: "department"
            }, {
                title: "Designation ",
                dataIndex: "targets.designation.value",
                key: "designation"
            }, {
                width: 150,
                title: "Progress ",
                dataIndex: "targets.date_target.target",
                key: "date_target.target",
                filters:[{
                    text:'Months Wise',
                    value: true
                },{
                    text:'Day Wise',
                    value: false
                }

            
                        ],
                onFilter: (value, record) => {
                    that.setState({ismonth: value})
                    return true;
                } ,
                render: (value, record) => {
                    let ismont =  that.state.ismonth;
                    let percent = (ismont ? (record.targets.month_target && record.targets.month_target.target && record.targets.month_target.working_days ? ((value || 0) * 100 / (record.targets.month_target.target )).toFixed(0) : 0) : (record.targets.month_target && record.targets.month_target.target && record.targets.month_target.working_days ? ((value || 0) * 100 / (record.targets.month_target.target  /  record.targets.month_target.working_days )).toFixed(0) : 0)) || 0;
                    return <span>
                <Progress
                    percent={percent}
                    strokeColor={percent > 90 ? "#87d068" : (percent > 50 ? "#d0c268" : "#f50")}/>
                </span>;

                },
                export: (value, record) => (record.targets.month_target && record.targets.month_target.target && record.targets.month_target.working_days ? ((value || 0) * 100 / (record.targets.month_target.target / record.targets.month_target.working_days)).toFixed(0) : 0) || 0 + "%"
            }, {
                title: "Target Achieved",
                dataIndex: "targets.date_target.target",
                key: "date_target"
            }, {
                title: "Remarks",
                dataIndex: "targets.date_target.remarks",
                key: "remarks"
            }];
        // }, {
        //     title: 'Actions',
        //     key: 'action',
        //     render: (text, record) => (
        //         <span>
        //        <a onClick={() => this.editTarget(record.targets)}>Edit Target</a>
        //     </span>
        //     ),
        // }];
        const { filterStrings, currentDate, editRecord, visible } = this.state;
        console.log(editRecord);
        const DailyTargetEditForm = Form.create()(DynamicFieldsForm);
        const fields = [{
            label: "Target Name",
            follow: editRecord ? editRecord.name : null,
            type: LABEL_FIELD,
            key: "name"
        }, {
            label: "Target Count",
            initialValue: editRecord && editRecord.date_target ? editRecord.date_target.target : null,
            type: NUMBER_FIELD,
            key: "target",
            required: true
        }, {
            label: "Remark",
            initialValue: editRecord && editRecord.date_target ? editRecord.date_target.remarks : null,
            type: TEXT_FIELD,
            key: "remarks",
            row: 3
        }];
        const formProp = {
            method: "post",
            action: TASK_USER_DAILY_TARGET,
            beforeSend: function(values) {
                return [{
                    ...values,
                    id: editRecord && editRecord.date_target ? editRecord.date_target.id : null
                }];
            },
            successFn: function(data) {
                displayMessage(SUCCESS_MSG_TYPE, "Monthly Target Recorded Successfully!!");
                that.editCancel();
                that.loadData();
            },
            errorFn: function() {

            }
        };
        const defaultFields = [{ key: "date", value: filterStrings.date },
            { key: "head", value: editRecord ? editRecord.id : null }];
        return <>
            <Row gutter={16}>
                <Col span={6}>
                    <h4>Date</h4>
                    <DatePicker allowClear={false}
                                defaultValue={currentDate}
                                style={{ width: "100%", marginBottom: 10 }}
                                onChange={(value) => this.applyFilter("date", moment(value).format("YYYY-MM-DD"))}/>
                </Col>
            </Row>
            <CustomizedTable
                loading={this.state.loading}
                columns={columns}
                dataSource={this.state.targets}
                hideReports={true}
                pagination={false}/>
            <InfiniteFeedLoaderButton
                loaderFunction={() => this.loadData(this.state.loadMoreReport)}
                loading={this.state.loading}
                hidden={!this.state.loadMoreReport}
            />
            <Modal visible={visible} footer={null} title="Daily Target" onCancel={() => this.editCancel()}>
                <DailyTargetEditForm fields={fields} formProp={formProp} defaultValues={defaultFields}/>
            </Modal>
        </>;
    }
}
