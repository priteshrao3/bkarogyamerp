import {Button, Card, DatePicker, Form, Input, InputNumber, Select, Spin, Table} from "antd";
import React from "react";
import {DOSE_REQUIRED} from "../../../constants/hardData";
import {displayMessage, postAPI} from "../../../utils/common";
import {SUCCESS_MSG_TYPE} from "../../../constants/dataKeys";
import {PATIENT_ALLOPATH_HISTORY} from "../../../constants/api";

class AddAllopathHistoryBulk extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            tableFormData: []
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        let that = this;
        this.props.form.validateFieldsAndScroll(function (err, values) {
            if (!err) {

                let reqData = [];
                that.state.tableFormData.forEach(function (item) {
                    reqData.push({
                        name: values.name[item._id],
                        formula: values.formula[item._id],
                        dosage_details: values.dosage_details[item._id],
                        start: values.start[item._id] ? values.start[item._id].format('YYYY-MM-DD') : null,
                        end: values.end[item._id] ? values.end[item._id].format('YYYY-MM-DD') : null,
                        remarks: values.remarks[item._id],
                        patient: that.props.currentPatient.id
                    })
                })
                let successFn = function(data){
                    displayMessage(SUCCESS_MSG_TYPE,"Allopath Medicine Recorded successfully!!");
                    that.props.history.push(`/erp/patient/${that.props.currentPatient.id}/allopath`);
                }
                let errorFn = function (){

                }
                postAPI(PATIENT_ALLOPATH_HISTORY,reqData,successFn,errorFn);

            }
        })
    }
    addRow = () => {
        this.setState(function (prevState) {
            return {
                tableFormData: [...prevState.tableFormData, {
                    _id: Math.random().toFixed(7)
                }]
            }
        })
    }
    removeRow = (_id) => {
        this.setState(function (prevState) {
            let newFormRows = [];
            prevState.tableFormData.forEach(function (item) {
                if (item._id != _id) {
                    newFormRows.push({...item});
                }
            })
            return {
                tableFormData: newFormRows
            }
        });
    }

    render() {
        const that = this;
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 4},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 24},
                md: {span: 24},
                lg: {span: 24},
                xl: {span: 24},
            },
        };
        if (this.props.currentPatient && this.props.currentPatient.id) {
            const {tableFormData} = this.state;
            const coloumns = [{
                title: 'Medicine Name',
                dataIndex: 'name',
                key: 'name',
                render: (value, record) => <Form.Item
                    key={`name[${record._id}]`}
                    {...formItemLayout}>
                    {getFieldDecorator(`name[${record._id}]`, {
                        validateTrigger: ['onChange', 'onBlur'],
                        rules: [{
                            required: true,
                            message: "This field is required.",
                        }],
                    })(
                        <Input/>
                    )}
                </Form.Item>
            }, {
                title: 'Medicine Formula',
                dataIndex: 'formula',
                key: 'formula',
                render: (value, record) => <Form.Item
                    key={`formula[${record._id}]`}
                    {...formItemLayout}>
                    {getFieldDecorator(`formula[${record._id}]`, {
                        validateTrigger: ['onChange', 'onBlur'],
                        rules: [{
                            required: true,
                            message: "This field is required.",
                        }],
                    })(
                        <Input/>
                    )}
                </Form.Item>
            }, {
                title: 'Medicine Dosage',
                dataIndex: 'dosage_details',
                key: 'dosage_details',
                render: (value, record) => <Form.Item
                    key={`dosage_details[${record._id}]`}
                    {...formItemLayout}>
                    {getFieldDecorator(`dosage_details[${record._id}]`, {
                        validateTrigger: ['onChange', 'onBlur'],
                        rules: [{
                            required: true,
                            message: "This field is required.",
                        }],
                    })(
                        <Select>
                            {DOSE_REQUIRED.map(item => <Select.Option value={item.value}>{item.label}</Select.Option>)}
                        </Select>
                    )}
                </Form.Item>
            }, {
                title: 'Start Date',
                dataIndex: 'start',
                key: 'start',
                render: (value, record) => <Form.Item
                    key={`start[${record._id}]`}
                    {...formItemLayout}>
                    {getFieldDecorator(`start[${record._id}]`)(
                        <DatePicker/>
                    )}
                </Form.Item>
            }, {
                title: 'End Date',
                dataIndex: 'end',
                key: 'end',
                render: (value, record) => <Form.Item
                    key={`end[${record._id}]`}
                    {...formItemLayout}>
                    {getFieldDecorator(`end[${record._id}]`)(
                        <DatePicker/>
                    )}
                </Form.Item>
            }, {
                title: 'Remarks',
                dataIndex: 'remarks',
                key: 'remarks',
                render: (value, record) => <Form.Item
                    key={`remarks[${record._id}]`}
                    {...formItemLayout}>
                    {getFieldDecorator(`remarks[${record._id}]`)(
                        <Input.TextArea/>
                    )}
                </Form.Item>
            }, {
                title: '',
                dataIndex: 'action',
                key: 'action',
                render: (value, record) => <Button size="small" shape="circle" icon={"close"} type={"danger"}
                                                   onClick={() => this.removeRow(record._id)}/>
            }]
            return <div>
                <Card title={"Add Allopath History"}
                      extra={<Button icon={"plus"} onClick={this.addRow}>Add Row</Button>}>
                    <Form onSubmit={this.handleSubmit}>
                        <Table dataSource={tableFormData} bordered pagination={false} columns={coloumns}/>
                        <Form.Item style={{paddingTop: '30px'}}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{margin: 5}}
                            >Save Medicines
                            </Button>
                            {that.props.history ? (
                                <Button
                                    style={{margin: 5}}
                                    onClick={() => that.props.history.goBack()}
                                >
                                    Cancel
                                </Button>
                            ) : null}
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        }
        return <Spin>
            <Card/>
        </Spin>
    }

}

export default Form.create()(AddAllopathHistoryBulk)
