import {Button, Card, Form, Modal, Popconfirm, Spin, Table} from "antd";
import React from "react";
import {displayMessage, getAPI, postAPI} from "../../../utils/common";
import {CONVERSION_DISEASE_API, PATIENT_ALLOPATH_HISTORY} from "../../../constants/api";
import InfiniteFeedLoaderButton from "../../common/InfiniteFeedLoaderButton";
import {Link} from "react-router-dom";
import moment from "moment";
import {
    DATE_PICKER,
    INPUT_FIELD,
    MULTI_SELECT_FIELD,
    SELECT_FIELD,
    SUCCESS_MSG_TYPE,
    TEXT_FIELD
} from "../../../constants/dataKeys";
import DynamicFieldsForm from "../../common/DynamicFieldsForm";
import {DOSE_REQUIRED} from "../../../constants/hardData";
import CustomizedTable from "../../common/CustomizedTable";

export default class AllopathHistory extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            history: []
        }
    }

    componentDidMount() {
        if (this.props.currentPatient && this.props.currentPatient.id) {
            this.loadData();
        }
    }

    loadData = (page = 1) => {
        let that = this;
        this.setState({
            loading: true
        })
        let successFn = function (data) {
            if (data.current == 1) {
                that.setState({
                    history: data.results,
                    nextPage: data.next,
                    loading: false
                })
            } else {
                that.setState(function (prevState) {
                    return {
                        history: [...prevState.history, ...data.results],
                        loading: false,
                        nextPage: data.next
                    }
                })
            }
        }
        let errorFn = function () {

        }
        let apiParams = {
            page,
            page_size:2000,
            patient:this.props.currentPatient.id
        }
        getAPI(PATIENT_ALLOPATH_HISTORY, successFn, errorFn, apiParams);
    }

    deleteRecord = (record) => {
        let reqData = [{
            ...record,
            is_active: false
        }];
        let that = this;
        let successFn = function () {
            displayMessage(SUCCESS_MSG_TYPE, "Record Deleted successfully!!");
            that.loadData();
        }
        let errorFn = function () {

        }
        postAPI(PATIENT_ALLOPATH_HISTORY, reqData, successFn, errorFn);

    }

    editRecord(value) {
        this.setState({
            editingId: value.id,
            editingValues: value,
            visible: true,
        });
    }

    handleCancel = () => {
        this.setState({visible: false});
    };

    render() {
        if (this.props.currentPatient && this.props.currentPatient.id) {
            const {loading, history, nextPage} = this.state;
            let that = this;
            const coloumn = [
                {
                    title: 'Medicine Name',
                    dataIndex: 'name',
                    key: 'name'
                }, {
                    title: 'Medicine Formula',
                    dataIndex: 'formula',
                    key: 'formula'
                }, {
                    title: 'Medicine Dosage',
                    dataIndex: 'dosage_details',
                    key: 'dosage_details'
                }, {
                    title: 'Start Date',
                    dataIndex: 'start',
                    key: 'start',
                    render: (value, record) => <span>{value ? moment(value).format('LL') : '--'}</span>,
                    export :(value,record)=>value ? moment(value).format('LL') : '--'
                }, {
                    title: 'End Date',
                    dataIndex: 'end',
                    key: 'end',
                    render: (value, record) => <span>{value ? moment(value).format('LL') : '--'}</span>,
                    export :(value,record)=>value ? moment(value).format('LL') : '--'
                }, {
                    title: 'Remarks',
                    dataIndex: 'remarks',
                    key: 'remarks'
                }, {
                    title: 'Action',
                    dataIndex: 'action',
                    key: 'action',
                    render: (value, record) => <Button.Group size={"small"}>
                        <Button type={"link"} onClick={()=>this.editRecord(record)}>Edit</Button>
                        <Popconfirm onConfirm={() => this.deleteRecord(record)}
                                    title={"Are you to delete this record?"}>
                            <Button type={"link"}>Delete</Button>
                        </Popconfirm>
                    </Button.Group>
                }];
            const editfields = [{
                label: 'Medicine Name',
                key: 'name',
                placeholder: 'Medicine Name',
                initialValue: this.state.editingValues ? this.state.editingValues.name : null,
                required: true,
                type: INPUT_FIELD,
            }, {
                label: 'Medicine Formula',
                key: 'formula',
                placeholder: 'Medicine Formula',
                initialValue: this.state.editingValues ? this.state.editingValues.formula : null,
                required: true,
                type: INPUT_FIELD,
            }, {
                label: 'Medicine Dosage',
                key: 'dosage_details',
                initialValue: this.state.editingValues ? this.state.editingValues.dosage_details : null,
                required: true,
                type: SELECT_FIELD,
                options: DOSE_REQUIRED,
            }, {
                label: 'Medicine Start Date',
                key: 'start',
                initialValue: this.state.editingValues && this.state.editingValues.start ? moment(this.state.editingValues.start) : null,
                format: "YYYY-MM-DD",
                type: DATE_PICKER,
            }, {
                label: 'Medicine End Date',
                key: 'end',
                initialValue: this.state.editingValues && this.state.editingValues.end ? moment(this.state.editingValues.end) : null,
                format: "YYYY-MM-DD",
                type: DATE_PICKER,
            }, {
                label: 'Remarks',
                key: 'remarks',
                initialValue: this.state.editingValues ? this.state.editingValues.remarks : null,
                type: TEXT_FIELD,

            }];
            const formProp = {
                beforeSend(values) {
                    return [{...values}]
                },
                successFn(data) {
                    that.handleCancel();
                    that.loadData();
                    displayMessage(SUCCESS_MSG_TYPE, 'Record Updated successfully!!');
                },
                errorFn() {

                },
                action: PATIENT_ALLOPATH_HISTORY,
                method: 'post',
            };
            const defaultValues = [];
            const editFormDefaultValues = [{
                'key': 'id',
                'value': this.state.editingId,
            }];
            const TestFormLayout = Form.create()(DynamicFieldsForm);
            return <div>
                <Card title={"Allopath History"}
                      extra={<Link to={`/erp/patient/${this.props.currentPatient.id}/allopath/addbulk`}>
                          <Button type="primary" icon={"plus"}>Add</Button>
                      </Link>}>
                    <CustomizedTable columns={coloumn} dataSource={history} pagination={false}/>
                    <InfiniteFeedLoaderButton loading={loading} loaderFn={() => this.loadData(nextPage)}
                                              hidden={!nextPage}/>
                </Card>
                <Modal
                    title="Edit Allopath Medicine Record"
                    visible={this.state.visible}
                    footer={null}
                    onCancel={this.handleCancel}
                >
                    <TestFormLayout defaultValues={editFormDefaultValues} formProp={formProp} fields={editfields}/>
                    <Button key="back" onClick={this.handleCancel}>Return</Button>,
                </Modal>
            </div>
        }
        return <Spin>
            <Card/>
        </Spin>
    }
}
