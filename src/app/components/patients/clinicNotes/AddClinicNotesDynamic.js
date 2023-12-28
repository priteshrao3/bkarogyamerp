import React from "react";
import {
    Row,
    Card,
    Col,
    Form,
    Tabs,
    Button,
    Icon,
    List,
    Input,
    Divider,
    Affix,
    DatePicker,
    Menu,
    Dropdown,
    Modal
} from 'antd';
import moment from "moment";
import { displayMessage, getAPI, interpolate, postAPI } from "../../../utils/common";
import {
    EMR_COMPLAINTS,
    EMR_DIAGNOSES,
    EMR_INVESTIGATIONS, EMR_MEDICATION,
    EMR_OBSERVATIONS,
    EMR_TREATMENTNOTES, PATIENT_CLINIC_NOTES_API
} from "../../../constants/api";
import DynamicFieldsForm from "../../common/DynamicFieldsForm";
import { INPUT_FIELD, SUCCESS_MSG_TYPE } from "../../../constants/dataKeys";
import { CUSTOM_STRING_SEPERATOR } from "../../../constants/hardData";
import { loadDoctors } from "../../../utils/clinicUtils";

const { TabPane } = Tabs;
const tabLists = ['Complaints', 'Observations', 'Diagnoses', 'Investigations', 'Notes', 'Recent Medication'];
const tabResourcesAPI = {
    'Complaints': EMR_COMPLAINTS,
    'Observations': EMR_OBSERVATIONS,
    'Diagnoses': EMR_DIAGNOSES,
    'Investigations': EMR_INVESTIGATIONS,
    'Notes': EMR_TREATMENTNOTES,
    'Recent Medication': EMR_MEDICATION
};
let id = 0;

class AddClinicNotesDynamic extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            resourceList: {},
            filteredResourceList: {},
            filterStrings: {},
            practiceDoctors: [],
            selectedDoctor: {},
            selectedDate: moment(),
            resourceAddModal: null,
            selectedTab: 'Complaints',
            editClinicNotes: this.props.editClinicNotes ? this.props.editClinicNotes : null,

        }
    }

    componentDidMount() {
        loadDoctors(this);
        this.loadRequiredResources(interpolate(EMR_COMPLAINTS, [this.props.active_practiceId]), 'Complaints');
        this.loadRequiredResources(interpolate(EMR_OBSERVATIONS, [this.props.active_practiceId]), 'Observations');
        this.loadRequiredResources(interpolate(EMR_DIAGNOSES, [this.props.active_practiceId]), 'Diagnoses');
        this.loadRequiredResources(interpolate(EMR_INVESTIGATIONS, [this.props.active_practiceId]), 'Investigations');
        this.loadRequiredResources(interpolate(EMR_TREATMENTNOTES, [this.props.active_practiceId]), 'Notes');
        this.loadRequiredResources(interpolate(EMR_MEDICATION, [this.props.active_practiceId]), 'Recent Medication');
        if (this.state.editClinicNotes) {
            this.setInitialData();
        }
    }

    setInitialData = () => {
        const that = this;
        const initialData = this.state.editClinicNotes;
        if (initialData.chief_complaints)
            initialData.chief_complaints.split(CUSTOM_STRING_SEPERATOR).forEach(str => setTimeout(function () {
                if (str.length)
                    that.addValues('Complaints', str)
            }, 500));
        if (initialData.investigations)
            initialData.investigations.split(CUSTOM_STRING_SEPERATOR).forEach(str => setTimeout(function () {
                if (str.length)
                    that.addValues('Investigations', str)
            }, 500));
        if (initialData.diagnosis)
            initialData.diagnosis.split(CUSTOM_STRING_SEPERATOR).forEach(str => setTimeout(function () {
                if (str.length)
                    that.addValues('Diagnoses', str)
            }, 500));
        if (initialData.notes)
            initialData.notes.split(CUSTOM_STRING_SEPERATOR).forEach(str => setTimeout(function () {
                if (str.length)
                    that.addValues('Notes', str)
            }, 500));
        if (initialData.observations)
            initialData.observations.split(CUSTOM_STRING_SEPERATOR).forEach(str => setTimeout(function () {
                if (str.length)
                    that.addValues('Observations', str)
            }, 500));
        if (initialData.medication)
            initialData.medication.split(CUSTOM_STRING_SEPERATOR).forEach(str => setTimeout(function () {
                if (str.length)
                    that.addValues('Recent Medication', str)
            }, 500));

    }

    loadRequiredResources = (API, key) => {
        const that = this;
        const successFn = function (data) {
            that.setState(function (prevState) {
                const newResources = { ...prevState.resourceList, [key]: data }
                return {
                    resourceList: newResources,
                    filteredResourceList: newResources,
                    filterStrings: {}
                }
            })
        }
        const errorFn = function () {
            console.log(`${key} fetching error`);
        }
        getAPI(API, successFn, errorFn);
    }

    add = (tab) => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue(tab);
        const nextKeys = keys.concat(++id);
        // can use data-binding to set
        // important! notify form to detect changes
        form.setFieldsValue({
            [tab]: nextKeys,
        });
    };

    remove = (tab, k) => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue(tab);
        // We need at least one passenger
        if (keys.length === 1) {
            return;
        }

        // can use data-binding to set
        form.setFieldsValue({
            [tab]: keys.filter(key => key !== k),
        });
    };

    addValues = (tab, value) => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue(tab);
        const nextKeys = keys.concat(++id);
        // can use data-binding to set
        // important! notify form to detect changes
        form.setFieldsValue({
            [tab]: nextKeys,
            [`field[${keys[keys.length - 1]}]`]: value,
        });
    }

    changeValues = (tab, id) => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue(tab);
        if (keys.indexOf(id) == keys.length - 1) {
            this.add(tab);
        }
    }

    toggleModal = (option) => {
        let prevsOption = null;
        const that = this;
        this.setState(function (prevState) {
            console.log(prevState.resourceAddModal);
            if (prevState.resourceAddModal)
                prevsOption = prevState.resourceAddModal;
            return { resourceAddModal: option }
        }, function () {
            if (prevsOption) {
                that.loadRequiredResources(interpolate(tabResourcesAPI[prevsOption], [that.props.active_practiceId]), prevsOption);
            }
        });

    }

    searchValues = (type, value) => {
        const that = this;
        this.setState(function (prevState) {
            const searchValues = { ...prevState.searchStrings };
            searchValues[type] = value;
            return { searchStrings: searchValues }
        }, function () {
            that.filterValues(type);
        });
    }

    filterValues = (type) => {
        this.setState(function (prevState) {
            let filteredItemOfGivenType = [];
            if (prevState.resourceList[type]) {
                if (prevState.searchStrings[type]) {
                    prevState.resourceList[type].forEach(function (item) {
                        if (item.name && item.name
                            .toString()
                            .toLowerCase()
                            .includes(prevState.searchStrings[type].toLowerCase())) {
                            filteredItemOfGivenType.push(item);
                        }
                    });
                } else {
                    filteredItemOfGivenType = prevState.resourceList[type];
                }
            }
            return {
                filteredResourceList: { ...prevState.filteredResourceList, [type]: filteredItemOfGivenType }
            }
        });
    }

    handleSubmit = (e) => {
        const that = this;
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                const reqData = {};
                reqData.chief_complaints = values.Complaints.map(id => values.field[id]).join(CUSTOM_STRING_SEPERATOR);
                reqData.investigations = values.Investigations.map(id => values.field[id]).join(CUSTOM_STRING_SEPERATOR);
                reqData.diagnosis = values.Diagnoses.map(id => values.field[id]).join(CUSTOM_STRING_SEPERATOR);
                reqData.notes = values.Notes.map(id => values.field[id]).join(CUSTOM_STRING_SEPERATOR);
                reqData.observations = values.Observations.map(id => values.field[id]).join(CUSTOM_STRING_SEPERATOR);
                reqData.medication = values['Recent Medication'].map(id => values.field[id]).join(CUSTOM_STRING_SEPERATOR);
                reqData.patient = that.props.match.params.id;
                reqData.practice = that.props.active_practiceId;
                reqData.doctor = that.state.selectedDoctor && that.state.selectedDoctor.id ? that.state.selectedDoctor.id : that.state.selectedDoctor;
                reqData.date = that.state.selectedDate && moment(that.state.selectedDate).isValid() ? moment(that.state.selectedDate).format('YYYY-MM-DD') : null
                if (that.state.editClinicNotes)
                    reqData.id = that.state.editClinicNotes.id;
                const successFn = function (data) {
                    if (that.props.loadData) {
                        that.props.loadData();
                    }

                    if (that.props.history) {
                        that.props.history.replace(`/erp/patient/${that.props.match.params.id}/emr/clinicnotes/`);
                    }

                };
                const errorFn = function () {

                }
                postAPI(interpolate(PATIENT_CLINIC_NOTES_API, [this.props.match.params.id]), reqData, successFn, errorFn);
            }
        });

    }

    changeTab = (e, tab) => {
        // this.setState({
        //     selectedTab: tab
        // });


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

    render() {
        const that = this;
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 20 },
            },
        };
        const keysObject = {};
        tabLists.forEach(function (tab) {
            getFieldDecorator(tab, { initialValue: [++id] });
            keysObject[tab] = getFieldValue(tab);
        });


        const keys = keysObject;
        const ResourceAddForm = Form.create()(DynamicFieldsForm);
        return (
            <Card>
                <Row>
                    <Col span={18}>
                        <h2>Clinical Notes</h2>
                        <Form onSubmit={this.handleSubmit}>
                            {tabLists.map(tab => (
                                <div>
                                    <Divider style={{ margin: 5 }}>{tab}</Divider>
                                    <div style={{
                                        backgroundColor: (tab == that.state.selectedTab ? '#ddd' : 'initial'),
                                        padding: 10
                                    }}
                                    >
                                        {keys[tab].map((k, index) => (
                                            <Form.Item
                                                {...formItemLayout}
                                                label={`${tab} ${index + 1}`}
                                                key={k}
                                            >
                                                {getFieldDecorator(`field[${k}]`, {
                                                    validateTrigger: ['onChange', 'onBlur'],
                                                    rules: [{
                                                        whitespace: true,
                                                    }],
                                                })(<Input
                                                    placeholder={tab}
                                                    style={{ width: '60%', marginRight: 8 }}
                                                    key={k}
                                                    onFocus={(e) => that.changeTab(e, tab)}
                                                    onChange={() => that.changeValues(tab, k)}
                                                />)}
                                                {keys[tab].length - 1 != index ? (
                                                    <Button
                                                        shape="circle"
                                                        type="danger"
                                                        size="small"
                                                        icon="delete"
                                                        onClick={() => this.remove(tab, k)}
                                                    />
                                                ) : null}
                                            </Form.Item>
                                        ))}
                                    </div>
                                </div>
                            )
                            )}
                            <Affix offsetBottom={0}>
                                <Card>
                                    <Row>
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
                                            allowClear={false}
                                            onChange={(value) => this.selectedDate(value)}
                                            format="DD-MM-YYYY"
                                        />
                                        <Button type="primary" htmlType="submit" style={{ float: 'right', margin: 5 }}>
                                            Save
                                    </Button>
                                        {that.props.history ? (
                                            <Button
                                                style={{ margin: 5, float: 'right' }}
                                                onClick={() => that.props.history.goBack()}
                                            >
                                                Cancel
                                        </Button>
                                        ) : null}
                                    </Row>
                                    <Row>
                                        Next Follow up
                                </Row>
                                </Card>
                            </Affix>
                        </Form>
                    </Col>
                    <Col span={6}>
                        <Tabs type="card">
                            {tabLists.map(tabList => (
                                <TabPane tab={tabList} key={tabList}>
                                    <div style={{ padding: 5 }}>
                                        <Button type="primary" block size="small" onClick={() => that.toggleModal(tabList)}>
                                            <Icon type="plus" />Add&nbsp;{tabList}
                                        </Button>
                                        <div style={{ backgroundColor: '#ddd', padding: 8 }}>
                                            <Input.Search
                                                placeholder={`Search in ${tabList} ...`}
                                                onChange={e => this.searchValues(tabList, e.target.value)}
                                            />
                                        </div>
                                        <List
                                            key={tabList}
                                            size="small"
                                            dataSource={that.state.filteredResourceList[tabList]}
                                            renderItem={item => (
                                                <List.Item
                                                    key={item.id}
                                                    onClick={() => this.addValues(tabList, item.name)}
                                                >
                                                    {item.name}
                                                </List.Item>
                                            )}
                                        />
                                    </div>
                                </TabPane>
                            ))}
                        </Tabs>
                    </Col>
                    <Modal
                        visible={!!this.state.resourceAddModal}
                        onCancel={() => that.toggleModal(null)}
                        title={`Add ${this.state.resourceAddModal}`}
                        footer={null}
                    >
                        {this.state.resourceAddModal ? (
                            <ResourceAddForm
                                fields={[{
                                    label: this.state.resourceAddModal,
                                    required: true,
                                    type: INPUT_FIELD,
                                    key: 'name'
                                }]}
                                defaultValues={[{ key: 'practice', value: this.props.active_practiceId }]}
                                formProp={{
                                    method: 'post',
                                    action: interpolate(tabResourcesAPI[this.state.resourceAddModal], [this.props.active_practiceId]),
                                    successFn() {
                                        that.toggleModal(null);
                                        displayMessage(SUCCESS_MSG_TYPE, `${that.state.resourceAddModal} added successfully!!`);
                                    },
                                    errorFn(err) {
                                        console.log(err);
                                    }
                                }}
                            />
                        ) : null}
                    </Modal>
                </Row>
            </Card>
        )
    }
}

export default Form.create()(AddClinicNotesDynamic)
