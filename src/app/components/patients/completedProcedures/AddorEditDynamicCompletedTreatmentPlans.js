import React from "react";
import {
    Card,
    Row,
    Form,
    Col,
    List,
    Button,
    Table,
    InputNumber,
    Input,
    Icon,
    Affix,
    Dropdown,
    Menu,
    DatePicker
} from 'antd';
import {remove} from 'lodash';
import {Redirect} from 'react-router-dom';
import moment from "moment";
import {displayMessage, getAPI, interpolate, postAPI} from "../../../utils/common";
import {PRACTICESTAFF, PROCEDURE_CATEGORY, TREATMENTPLANS_API} from "../../../constants/api";
import {DOCTORS_ROLE} from "../../../constants/dataKeys";
import {loadDoctors} from "../../../utils/clinicUtils";


class AddorEditDynamicCompletedTreatmentPlans extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingProcedures: true,
            procedure_category: [],
            tableFormValues: [],
            addNotes: {},
            practiceDoctors: [],
            selectedDoctor: {},
            selectedDate: moment()
        }
    }

    componentDidMount() {
        if (this.props.editId) {
            this.setState(function (prevState) {
                const tableValues = [];
                this.props.editTreatmentPlan.treatment_plans.forEach(function (treatment) {
                    const randId = Math.random().toFixed(7);
                    tableValues.push({
                        ...treatment,
                        ...treatment.procedure,
                        _id: randId,
                    })
                });
                return {
                    ...this.props.editTreatmentPlan,
                    tableFormValues: tableValues,
                    selectedDate: moment(this.props.editTreatmentPlan.date),
                    selectedDoctor: this.props.editTreatmentPlan.doctor
                }
            })
        }
        this.loadProcedures();
        loadDoctors(this);
    }

    calculateItem = (_id) => {
        const {getFieldsValue} = this.props.form;
        // console.log(getFieldsValue());
        this.setState(function (prevState) {
            const newtableFormValues = [...prevState.tableFormValues];
            newtableFormValues.forEach(function (item) {

            });
        });
    }

    addNotes = (_id, option) => {
        this.setState(function (prevState) {
            return {addNotes: {...prevState.addNotes, [_id]: !!option}}
        })
    }

    removeTreatment = (_id) => {
        this.setState(function (prevState) {
            return {
                tableFormValues: [...remove(prevState.tableFormValues, function (item) {
                    return item._id != _id;
                })]
            }
        });
    }

    add = (item) => {
        const that = this;
        this.setState(function (prevState) {
            const randId = Math.random().toFixed(7);
            return {
                addNotes: {...prevState.addNotes, [randId]: !!item.default_notes},
                tableFormValues: [{
                    ...item,
                    _id: randId,
                    children:undefined
                }, ...prevState.tableFormValues]
            }
        }, function () {
            if (item.children.length)
                item.children.forEach(function(itemData){
                    that.add(itemData)
                })
        });
    };

    loadProcedures() {
        const that = this;
        const params = {};
        if (this.state.searchString) {
            params.name = this.state.searchString;
        }
        that.setState({
            loadingProcedures: true
        })
        const successFn = function (data) {
            if (!params.name || that.state.searchString == params.name)
                that.setState({
                    // procedure_category: data.results,
                    loadingProcedures: false,
                    filteredItems: data.results,
                })
        };
        const errorFn = function () {
            that.setState({
                loadingProcedures: false
            })
        };

        getAPI(interpolate(PROCEDURE_CATEGORY, [this.props.active_practiceId]), successFn, errorFn, params);
    }

    selectDoctor = (doctor) => {
        this.setState({
            selectedDoctor: doctor
        })
    }

    selectedDate = (date) => {
        this.setState({
            selectedDate: date
        })
    }

    handleSubmit = (e) => {
        const that = this;
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                // console.log('Received values of form: ', values);
                const reqData = {
                    treatment_plans: [],
                    patient: that.props.match.params.id,
                    "doctor": that.state.selectedDoctor.id,
                    "date": that.state.selectedDate && moment(that.state.selectedDate).isValid() ? that.state.selectedDate.format('YYYY-MM-DD') : null,
                    "practice": that.props.active_practiceId,
                };
                if (that.props.editId) {
                    reqData.id = that.props.editTreatmentPlan.id
                }
                that.state.tableFormValues.forEach(function (item) {
                    // console.log(item);
                    item.quantity = values.quantity[item._id];
                    item.cost = values.cost[item._id];
                    item.discount = values.discount[item._id];
                    if (values.notes)
                        item.notes = values.notes[item._id];
                    const sendingItem = {
                        "procedure": item.id,
                        "cost": item.cost,
                        "quantity": item.quantity,
                        "margin": item.margin,
                        "default_notes": item.notes,
                        "is_active": true,
                        "is_completed": true,
                        "discount": item.discount,
                        "discount_type": "%",

                    };
                    reqData.treatment_plans.push(sendingItem);
                });

                const successFn = function (data) {
                    displayMessage("Inventory updated successfully");
                    if (that.props.loadData)
                        that.props.loadData();
                    const url = `/erp/patient/${  that.props.match.params.id  }/emr/workdone`;
                    that.props.history.replace(url);
                };
                const errorFn = function () {

                };
                postAPI(interpolate(TREATMENTPLANS_API, [that.props.match.params.id]), reqData, successFn, errorFn);
            }
        });
    };

    searchValues = (value) => {
        const that = this;
        this.setState(function (prevState) {
            return {searchString: value}
        }, function () {
            that.loadProcedures();
        });
        return false;
    }

    render() {
        const that = this;
        const {getFieldDecorator, getFieldValue, getFieldsValue} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 4},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 20},
            },
        };
        const formItemLayoutWithOutLabel = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 24},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 24},
            },
        };
        const consumeRow = [{
            title: 'Treatments',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => (
<span>
                <b>{name}</b><br />
                {this.state.addNotes[record._id] || this.props.editId ? (
                    <Form.Item
                      key={`default_notes[${record._id}]`}
                      {...formItemLayout}
                    >
                        {getFieldDecorator(`notes[${record._id}]`, {
                            validateTrigger: ['onChange', 'onBlur'],
                            rules: [{
                                message: "This field is required.",
                            }],
                            initialValue: record.default_notes
                        })(
                            <Input.TextArea min={0} placeholder="Notes..." />
                        )}
                    </Form.Item>
                  )
                    : <a onClick={() => this.addNotes(record._id, true)}>+ Add Note</a>}
</span>
)
        }, {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (name, record) => (
<Form.Item
  key={`quantity[${record._id}]`}
  {...formItemLayout}
>
                {getFieldDecorator(`quantity[${record._id}]`, {
                    validateTrigger: ['onChange', 'onBlur'],
                    rules: [{
                        required: true,
                        message: "This field is required.",
                    }],
                    initialValue: record.quantity,
                })(
                    <InputNumber
                      min={0}
                      placeholder="Quantity"
                      size="small"
                      onChange={() => this.calculateItem(record._id)}
                    />
                )}
</Form.Item>
)
        }, {
            title: 'Cost',
            dataIndex: 'cost',
            key: 'cost',
            render: (name, record) => (
<Form.Item
  key={`cost[${record._id}]`}
  {...formItemLayout}
>
                {getFieldDecorator(`cost[${record._id}]`, {
                    validateTrigger: ['onChange', 'onBlur'],
                    rules: [{
                        required: true,
                        message: "This field is required.",
                    }],
                    initialValue: record.cost
                })(
                    <InputNumber
                      min={0}
                      placeholder="Cost"
                      size="small"
                      onChange={() => this.calculateItem(record._id)}
                    />
                )}
</Form.Item>
)
        }, {
            title: 'Discount',
            dataIndex: 'discount',
            key: 'discount',
            render: (name, record) => (
<Form.Item
  key={`discount[${record._id}]`}
  {...formItemLayout}
>
                {getFieldDecorator(`discount[${record._id}]`, {
                    validateTrigger: ['onChange', 'onBlur'],
                    rules: [{
                        message: "This field is required.",
                    }],
                })(
                    <InputNumber
                      min={0}
                      placeholder="Discount"
                      size="small"
                      onChange={() => this.calculateItem(record._id)}
                    />
                )} %
</Form.Item>
)
        }, {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            render: (total, record) => (
<span>
                {total}
                <Button
                  icon="close"
                  onClick={() => this.removeTreatment(record._id)}
                  type="danger"
                  shape="circle"
                  size="small"
                />
</span>
)
        }];
        return (
<div>

            <Card title="Completed Procedures">
                <Row>
                    <Col span={17}>
                        <Form onSubmit={this.handleSubmit}>
                            <Table
                              pagination={false}
                              bordered
                              dataSource={this.state.tableFormValues}
                              columns={consumeRow}
                            />

                            <Affix offsetBottom={0}>
                                <Card>
                                    <span>by &nbsp;&nbsp;</span>
                                    <Dropdown
                                      placement="topCenter"
                                      overlay={(
<Menu>
                                        {this.state.practiceDoctors.map(doctor => (
                                            <Menu.Item key="0">
                                                <a onClick={() => this.selectDoctor(doctor)}>{doctor.user.first_name}</a>
                                            </Menu.Item>
                                          ))}
</Menu>
)}
                                      trigger={['click']}
                                    >
                                        <a className="ant-dropdown-link" href="#">
                                            <b>
                                                {this.state.selectedDoctor.user ? this.state.selectedDoctor.user.first_name : 'No DOCTORS Found'}
                                            </b>
                                        </a>
                                    </Dropdown>
                                    <span> &nbsp;&nbsp;on&nbsp;&nbsp;</span>
                                    <DatePicker
                                      value={this.state.selectedDate}
                                      onChange={(value) => this.selectedDate(value)}
                                      format="DD-MM-YYYY"
                                      allowClear={false}
                                    />
                                    <Form.Item
                                      {...formItemLayoutWithOutLabel}
                                      style={{marginBottom: 0, float: 'right'}}
                                    >
                                        <Button type="primary" htmlType="submit" style={{margin: 5}}>Save Treatment
                                            Plan
                                        </Button>
                                        {that.props.history ? (
                                            <Button
                                              style={{margin: 5, float: 'right'}}
                                              onClick={() => that.props.history.goBack()}
                                            >
                                                Cancel
                                            </Button>
                                          ) : null}
                                    </Form.Item>
                                </Card>
                            </Affix>
                            <div ref={el => {
                                that.bottomPoint = el;
                            }}
                            />
                        </Form>
                    </Col>
                    <Col span={7}>
                        <Affix offsetTop={0}>
                            <div style={{backgroundColor: '#ddd', padding: 8}}>
                                <Input.Search
                                  placeholder="Search in plans ..."
                                  onChange={e => this.searchValues(e.target.value)}
                                />
                            </div>
                            <List
                              size="small"
                              loading={this.state.loadingProcedures}
                              style={{maxHeight: '100vh', overflowX: 'scroll'}}
                              itemLayout="horizontal"
                              dataSource={this.state.filteredItems}
                              renderItem={item => (
                                      <List.Item onClick={() => this.add(item)}>
                                          <List.Item.Meta
                                            title={item.name}
                                          />
                                      </List.Item>
)}
                            />
                        </Affix>
                    </Col>
                </Row>
            </Card>

</div>
)
    }
}

export default Form.create()(AddorEditDynamicCompletedTreatmentPlans)
