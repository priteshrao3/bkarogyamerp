import React from "react";
import {
    Card,
    Row,
    Col,
    Form,
    Table,
    Divider,
    Tabs,
    List,
    Button,
    Input,
    Select,
    Radio,
    InputNumber,
    Icon,
    Affix,
    Popconfirm,
    DatePicker,
    Dropdown,
    Menu, Tag
} from 'antd';
import {remove} from "lodash";
import {Link, Route, Switch} from "react-router-dom";
import moment from "moment";
import {
    DRUG_CATALOG,
    INVENTORY_ITEM_API,
    LABTEST_API,
    PRACTICESTAFF,
    PRESCRIPTIONS_API,
    PRESCRIPTION_TEMPLATE
} from "../../../constants/api";
import {displayMessage, getAPI, interpolate, postAPI, putAPI} from "../../../utils/common";
import {DURATIONS_UNIT, DOSE_REQUIRED, DRUG} from "../../../constants/hardData";
import {DOCTORS_ROLE, WARNING_MSG_TYPE} from "../../../constants/dataKeys";

import PrescriptionTemplate from "./PrescriptionTemplate";
import {loadDoctors} from "../../../utils/clinicUtils";

const {TabPane} = Tabs;

class AddorEditDynamicPatientPrescriptions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: {},
            filteredItems: {},
            formDrugList: [],
            formLabList: [],
            addInstructions: {},
            changeDurationUnits: {},
            addedDrugs: {},
            addedLabs: {},
            addTemplate: {},
            formTemplateList: [],
            practiceDoctors: [],
            selectedDoctor: {},
            selectedDate: moment(),
            searchStrings: {}
        }
        this.loadPrescriptionTemplate = this.loadPrescriptionTemplate.bind(this);
        this.deletePrescriptionTemplate = this.deletePrescriptionTemplate.bind(this);
    }

    componentDidMount() {
        const that = this;
        this.loadDrugList();
        this.loadPrescriptionTemplate();
        loadDoctors(this);
        if (this.props.editId) {
            this.setState(function (prevState) {
                const drugList = [];
                const addInstructions = {};
                const addedLabs = {};
                // let dosage = {};
                // let frequency = {};
                // let duration = {};
                // let duration_type = {};
                that.props.editPrescription.drugs.forEach(function (drug) {
                    const _id = Math.random();
                    drugList.push({...drug, _id, food_time: (drug.after_food ? 1 : 0), id: drug.inventory.id});
                    addInstructions[_id] = !!drug.instruction;
                    // dosage[_id] = drug.dosage;
                    // frequency[_id] = drug.frequency;
                    // duration[_id] = drug.duration;
                    // duration_type[_id] = drug.duration_type;
                });
                const labList = []
                that.props.editPrescription.labs.forEach(lab => {
                    labList.push({
                        ...lab,
                        _id: Math.random()
                    });
                    addedLabs[lab.id] = true
                })

                return {
                    ...that.props.editPrescription,
                    formDrugList: [...drugList],
                    formLabList: [...labList],
                    addInstructions: {...addInstructions},
                    addedLabs: {...addedLabs},
                    // dosage: {...dosage},
                    // frequency: {...frequency},
                    // duration: {...duration},
                    // duration_type: {...duration_type},
                    selectedDoctor: that.props.editPrescription.doctor,
                    selectedDate: moment(that.props.editPrescription.date).isValid() ? moment(that.props.editPrescription.date) : moment()
                }
            })
        }
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

    loadPrescriptionTemplate() {
        const that = this;
        const successFn = function (data) {
            that.setState(function (prevState) {
                const items = {...prevState.items}
                return {
                    items: {...items, "Template": data.results},
                    filteredItems: {...prevState.filteredItems, "Template": data.results}
                }
            })

        };
        const errorFn = function () {

        };
        getAPI(interpolate(PRESCRIPTION_TEMPLATE, [that.props.active_practiceId]), successFn, errorFn)
    }

    loadLabList() {
        const that = this;
        const successFn = function (data) {
            that.setState(function (prevState) {
                const items = {...prevState.items}
                return {
                    items: {...items, "Labs": data.results},
                    filteredItems: {...prevState.filteredItems, "Labs": data.results}
                }
            })
        };
        const errorFn = function () {

        };
        getAPI(interpolate(LABTEST_API, [that.props.active_practiceId]), successFn, errorFn);
    }

    loadDrugList(page = 1) {
        const that = this;
        const searchString = that.state.searchStrings.Drugs;
        const successFn = function (data) {
            if (searchString == that.state.searchStrings.Drugs)
                that.setState(function (prevState) {
                    const items = {...prevState.items}
                    return {
                        items: {...items, "Drugs": data.results},
                        filteredItems: {...prevState.filteredItems, "Drugs": data.results}
                    }
                })
        }
        const errorFn = function () {

        }
        const params = {
            practice: this.props.active_practiceId,
            item_type: DRUG,
            page
        };
        if (searchString) {
            params.item_name = searchString
        }
        getAPI(INVENTORY_ITEM_API, successFn, errorFn, params);
    }


    addDrug(item) {
        const that = this;
        const randId = Math.random().toFixed(7);
        this.setState(function (prevState) {
            return {
                addedDrugs: {...prevState.addedDrugs, [item.id]: true},
                formDrugList: [{
                    ...item,
                    _id: randId,
                    instruction: item.instructions
                }, ...prevState.formDrugList]
            }
        }, function () {
            if (item.instructions) {
                that.addInstructions(randId, true);
            }
        });

    }

    addInstructions = (_id, option) => {
        this.setState(function (prevState) {
            return {addInstructions: {...prevState.addInstructions, [_id]: !!option}}
        })
    }

    changeDurationUnits = (_id, option) => {
        this.setState(function (prevState) {
            return {changeDurationUnits: {...prevState.changeDurationUnits, [_id]: !!option}}
        })
    }

    removeDrug = (_id) => {
        this.setState(function (prevState) {
            return {
                formDrugList: [...remove(prevState.formDrugList, function (item) {
                    return item._id != _id;
                })]
            }
        });
    }

    removeLabs = (_id, item) => {
        this.setState(function (prevState) {
            return {
                addedLabs: {...prevState.addedLabs, [item.id]: false},
                formLabList: [...remove(prevState.formLabList, function (item) {
                    return item._id != _id;
                })]
            }
        });
    }

    addLabs = (item) => {
        this.setState(function (prevState) {
            const randId = Math.random().toFixed(7);
            if (prevState.addedLabs[item.id]) {
                displayMessage(WARNING_MSG_TYPE, "Item Already Added");
                return false;
            }
            return {
                addedLabs: {...prevState.addedLabs, [item.id]: true},
                formLabList: [...prevState.formLabList, {
                    ...item,
                    _id: randId,
                }]
            }
        });
    };

    addTemplate = (item) => {
        this.setState(function (prevState) {
            if (prevState.addTemplate[item.id]) {
                displayMessage(WARNING_MSG_TYPE, "Item Already Added");
                return false;
            }
            const prevLabs = [...prevState.formLabList];
            let prevAddedLabs = {...prevState.addedLabs};
            item.labs.forEach(function (lab) {
                const randId = Math.random().toFixed(7);
                prevLabs.push({
                    ...lab,
                    _id: randId,
                });
                prevAddedLabs = {...prevAddedLabs, [lab.id]: true}
            });

            const prevDrugs = [...prevState.formDrugList];
            const prevAddedDrugs = {...prevState.addedDrugs};
            item.drugs.forEach(function (drugs) {
                const randId = Math.random().toFixed(7);
                prevDrugs.push({
                    ...drugs,
                    _id: randId,
                    advice_data: item.advice_data,
                });
                prevAddedLabs = {...prevAddedDrugs, [drugs.id]: true}

            })


            return {
                addedLabs: prevAddedLabs,
                formLabList: prevLabs,
                addedDrugs: prevAddedDrugs,
                formDrugList: prevDrugs
            }

        });
    };

    removeTemplates = (_id, item) => {
        this.setState(function (prevState) {
            return {
                addTemplate: {...prevState.addTemplate, [item.id]: false},
                formTemplateList: [...remove(prevState.formTemplateList, function (item) {
                    return item._id != _id;
                })]
            }
        });
    }

    handleSubmit = (e) => {
        const that = this;
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const reqData = {
                    drugs: [],
                    labs: [],
                    patient: parseInt(that.props.match.params.id),
                    practice: that.props.active_practiceId,
                    doctor: that.state.selectedDoctor ? that.state.selectedDoctor.id : null,
                    date: that.state.selectedDate ? that.state.selectedDate.format('YYYY-MM-DD') : null,
                    advice_data: []
                };
                if (that.props.editId && !that.props.copy) {
                    reqData.id = that.props.editId;
                }
                that.state.formDrugList.forEach(function (item) {
                    item.dosage = values.dosage[item._id];
                    item.duration_type = values.duration_type[item._id];
                    item.duration = values.duration[item._id];
                    item.frequency = values.frequency[item._id];
                    if (values.instruction) {
                        item.instruction = values.instruction[item._id];
                    }
                    if (values.food_time[item._id]) {
                        item.after_food = true;
                        item.before_food = false;
                    } else {
                        item.before_food = true;
                        item.after_food = false;
                    }

                    // if (item.advice_data) {
                    //     item.advice_data.map(function (advice) {
                    //         reqData.advice_data.push(advice.id)
                    //     })
                    // }
                    const drugItem = {
                        "inventory": item.id,
                        "name": item.name,
                        "dosage": item.dosage,
                        "frequency": item.frequency,
                        "duration_type": item.duration_type,
                        "duration": item.duration,
                        "instruction": item.instruction,
                        "before_food": item.before_food,
                        "after_food": item.after_food,
                        "is_active": true,
                    };
                    reqData.drugs.push(drugItem);
                    // console.log("item drug", item);
                });
                that.state.formLabList.forEach(function (item) {
                    reqData.labs.push(item.id);
                });
                const successFn = function (data) {
                    if (that.props.loadData)
                        that.props.loadData();
                    const url = `/erp/patient/${that.props.match.params.id}/emr/prescriptions`;
                    that.props.history.replace(url);
                }
                const errorFn = function () {

                }
                postAPI(interpolate(PRESCRIPTIONS_API, [that.props.match.params.id]), reqData, successFn, errorFn);
            } else {
                // console.log(err);
            }
        });
    }

    deletePrescriptionTemplate(id) {
        const that = this;
        const reqData = {id, is_active: false};
        const successFn = function (data) {
            that.loadPrescriptionTemplate();
        };
        const errorFn = function () {
        };
        postAPI(interpolate(PRESCRIPTION_TEMPLATE, [that.props.active_practiceId]), reqData, successFn, errorFn);

    }

    onChange = e => {
        this.setState({});
    };

    searchValues = (type, value) => {
        const that = this;
        this.setState(function (prevState) {
            const searchValues = {...prevState.searchStrings};
            searchValues[type] = value;
            return {searchStrings: searchValues}
        }, function () {
            if (type == 'Drugs')
                that.loadDrugList();
            else
                that.filterValues(type);
        });
    }

    filterValues = (type) => {
        this.setState(function (prevState) {
            let filteredItemOfGivenType = [];
            if (prevState.items[type]) {
                if (prevState.searchStrings[type]) {
                    prevState.items[type].forEach(function (item) {
                        if (item.name && item.name
                            .toString()
                            .toLowerCase()
                            .includes(prevState.searchStrings[type].toLowerCase())) {
                            filteredItemOfGivenType.push(item);
                        }
                    });
                } else {
                    filteredItemOfGivenType = prevState.items[type];
                }
            }
            return {
                filteredItems: {...prevState.filteredItems, [type]: filteredItemOfGivenType}
            }
        });
    }

    render() {
        const that = this;
        const {getFieldDecorator, getFieldValue, getFieldsValue} = this.props.form;
        const drugTableColumns = [{
            title: 'Medicine Name',
            dataIndex: 'name',
            key: 'name',
            render: name => <h2>{name}</h2>
        }, {
            title: 'Dosage & Frequency',
            dataIndex: 'dosage',
            key: 'dosage',
            render: (dosage, record) => (
                <div>
                    <Form.Item
                      extra={<span>does(s)</span>}
                      key={`dosage[${record._id}]`}
                    >
                        {getFieldDecorator(`dosage[${record._id}]`, {
                            rules: [{required: true, message: "This field is required.",}],
                            initialValue: record.dosage,
                            min: 0
                        })(
                            <InputNumber size="small" />
                        )}
                    </Form.Item>
                    <Form.Item
                      key={`frequency[${record._id}]`}
                    >
                        {getFieldDecorator(`frequency[${record._id}]`, {
                            rules: [{
                                required: true,
                                message: "This field is required.",
                            }],
                            initialValue: record.frequency || DOSE_REQUIRED[0].value
                        })(
                            <Select size="small" onChange={() => this.changeDurationUnits(record._id, false)}>
                                {DOSE_REQUIRED.map(item => (
                                    <Select.Option
                                      value={item.value}
                                    >{item.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </Form.Item>
                </div>
            )
        }, {
            title: 'Duration',
            dataIndex: 'duration',
            key: 'duration',
            render: (duration, record) => (
                <div>
                    <Form.Item
                      key={`duration[${record._id}]`}
                    >
                        {getFieldDecorator(`duration[${record._id}]`, {
                            rules: [{required: true, message: "This field is required.",}],
                            initialValue: record.duration,
                        })(
                            <InputNumber size="small" min={1} />
                        )}
                    </Form.Item>
                    <Form.Item
                      key={`duration_type[${record._id}]`}
                    >
                        {getFieldDecorator(`duration_type[${record._id}]`, {
                            rules: [{
                                required: true,
                                message: "This field is required.",
                            }],
                            initialValue: record.duration_type || DURATIONS_UNIT[0].value
                        })(
                            <Select size="small" onChange={() => this.changeDurationUnits(record._id, false)}>
                                {DURATIONS_UNIT.map(item => (
                                    <Select.Option
                                      value={item.value}
                                    >{item.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </Form.Item>
                </div>
            )
        }, {
            title: 'Instructions',
            dataIndex: 'instruction',
            key: 'instruction',
            render: (instruction, record) => (
                <div>
                    {this.state.addInstructions[record._id] ? (
                            <Form.Item
                              extra={(
                                    <a onClick={() => this.addInstructions(record._id, false)}>Remove
                                        Instructions
                                    </a>
                                )}
                              key={`instruction[${record._id}]`}
                            >
                                {getFieldDecorator(`instruction[${record._id}]`, {
                                    validateTrigger: ['onChange', 'onBlur'],
                                    rules: [{
                                        message: "This field is required.",
                                    }],
                                    initialValue: record.instruction
                                })(
                                    <Input.TextArea placeholder="Instructions..." size="small" />
                                )}

                            </Form.Item>
                        )
                        : <a onClick={() => this.addInstructions(record._id, true)}>+ Add Instructions</a>}
                </div>
            )
        }, {
            title: "Timing",
            dataIndex: "food_time",
            key: 'food_time',
            render: (timing, record) => (
                <div>
                    <Form.Item key={`food_time[${record._id}]`}>
                        {getFieldDecorator(`food_time[${record._id}]`, {
                            initialValue: record.food_time || 0
                        })(
                            <Radio.Group onChange={this.onChange}>
                                <Radio value={1}>after</Radio>
                                <Radio value={0}>before</Radio>
                            </Radio.Group>
                        )}
                    </Form.Item>

                </div>
            )

        }, {
            title: '',
            dataIndex: 'action',
            key: 'action',
            render: (instructions, record) => (
                <Form.Item>
                    <Button
                      icon="close"
                      onClick={() => this.removeDrug(record._id)}
                      type="danger"
                      shape="circle"
                      size="small"
                    />
                </Form.Item>
            )
        }];
        const labTablecolums = [{
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => (
                <span>
                <b>{name}</b>
                </span>
            )
        }, {
            title: 'Cost',
            dataIndex: 'cost',
            key: 'cost',
            render: (name, record) => <span>{record.cost}</span>
        }, {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            render: (total, record) => (
                <span>
                {total}
                    <Button
                      icon="close"
                      onClick={() => this.removeLabs(record._id, record)}
                      type="danger"
                      shape="circle"
                      size="small"
                    />
                </span>
            )
        }];

        return (

<Card title={this.props.copy ? "Copying Prescriptions" : `Prescriptions`}>
            <Row>
                <Col span={18}>
                    <Form onSubmit={this.handleSubmit}>
                        <Table
                          pagination={false}
                          bordered={false}
                          columns={drugTableColumns}
                          dataSource={this.state.formDrugList}
                        />


                            {/* <Divider> Lab Test</Divider> */}
                            {/* <Table */}
                            {/*  pagination={false} */}
                            {/*  bordered={false} */}
                            {/*  columns={labTablecolums} */}
                            {/*  dataSource={this.state.formLabList} */}
                            {/* /> */}

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

                                    <Button type="primary" htmlType="submit" style={{margin: 5, float: 'right'}}>
                                        Save
                                    </Button>
                                    {that.props.history ? (
                                        <Button
                                          style={{margin: 5, float: 'right'}}
                                          onClick={() => that.props.history.goBack()}
                                        >
                                            Cancel
                                        </Button>
                                    ) : null}
                                </Card>
                            </Affix>
                    </Form>
                </Col>
                    <Col span={6}>
                        <Tabs type="card">
                            <TabPane tab="Medicine" key="1">
                                <div style={{backgroundColor: '#ddd', padding: 8}}>
                                    <Input.Search
                                      key="Drugs"
                                      placeholder="Search in Medicine..."
                                      onChange={e => this.searchValues("Drugs", e.target.value)}
                                    />
                                </div>
                                <List
                                  size="small"
                                  itemLayout="horizontal"
                                  dataSource={this.state.filteredItems.Drugs}
                                  renderItem={item => (
                                        <List.Item
                                          onClick={() => this.addDrug(item)}
                                          actions={(item.maintain_inventory ? null : [<Tag>Not Sold</Tag>])}
                                        >
                                            <List.Item.Meta
                                              title={item.name}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </TabPane>
                            {/*                        <TabPane tab="Labs" key="2"> */}
                            {/*                            <div style={{backgroundColor: '#ddd', padding: 8}}> */}
                            {/*                                <Input.Search */}
                            {/*                                  key="Labs" */}
                            {/*                                  placeholder="Search in Labs..." */}
                            {/*                                  onChange={e => this.searchValues("Labs", e.target.value)} */}
                            {/*                                /> */}
                            {/*                            </div> */}
                            {/*                            <List */}
                            {/*                              size="small" */}
                            {/*                              itemLayout="horizontal" */}
                            {/*                              dataSource={this.state.filteredItems.Labs} */}
                            {/*                              renderItem={item => ( */}
                            {/*                                      <List.Item onClick={() => this.addLabs(item)}> */}
                            {/*                                          <List.Item.Meta */}
                            {/*                                            title={item.name} */}
                            {/*                                          /> */}
                            {/*                                      </List.Item> */}
                            {/* )} */}
                            {/*                            /> */}
                            {/*                        </TabPane> */}
                            <TabPane tab="Template" key="3">
                                <div>
                                    <Link to={`/erp/patient/${this.props.match.params.id}/prescriptions/template/add`}>
                                        <Button type="primary" block size="small">
                                            <Icon type="plus" />&nbsp;Add Template
                                        </Button>
                                    </Link>
                                </div>
                                <Divider style={{margin: 0}} />
                                <div style={{backgroundColor: '#ddd', padding: 8}}>
                                    <Input.Search
                                      key="Template"
                                      placeholder="Search in Template..."
                                      onChange={e => this.searchValues("Template", e.target.value)}
                                    />
                                </div>
                                <List
                                  size="small"
                                  itemLayout="horizontal"
                                  dataSource={this.state.filteredItems.Template}
                                  renderItem={item => (
                                        <List.Item onConfirm={() => that.deletePrescriptionTemplate(item.id)}>
                                            <List.Item.Meta onClick={() => this.addTemplate(item)} title={item.name} />
                                            <Popconfirm
                                              title="Are you sure delete this item?"
                                              onConfirm={() => that.deletePrescriptionTemplate(item.id)}
                                              okText="Yes"
                                              cancelText="No"
                                            >
                                                <a>Delete</a>
                                            </Popconfirm>
                                        </List.Item>
                                    )}
                                />
                            </TabPane>
                        </Tabs>
                    </Col>
                    <Switch>
                        <Route
                          exact
                          path='/erp/patient/:id/prescriptions/template/add'
                          render={(route) => <PrescriptionTemplate {...this.state} {...route} />}
                        />
                    </Switch>
            </Row>
</Card>
        )
    }
}

export default Form.create()(AddorEditDynamicPatientPrescriptions);
