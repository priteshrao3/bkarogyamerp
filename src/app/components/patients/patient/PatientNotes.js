import React from 'react';
import { Divider, Form, List, Modal, Input, Popconfirm, Icon, Pagination, Tag, Row, Button, Select } from 'antd';
import moment from 'moment';
import { displayMessage, getAPI, interpolate, putAPI, postAPI } from '../../../utils/common';
import { INPUT_FIELD, SUCCESS_MSG_TYPE } from '../../../constants/dataKeys';
import { CALL_NOTES_RESPONSE_CONFIG_PARAMS, CALL_NOTES_TYPE_CONFIG_PARAMS } from '../../../constants/hardData';
import DynamicFieldsForm from '../../common/DynamicFieldsForm';
import { PATIENT_CALL_NOTES, PATIENT_NOTES } from '../../../constants/api';
import { loadConfigParameters } from '../../../utils/clinicUtils';
import InfiniteFeedLoaderButton from '../../common/InfiniteFeedLoaderButton';
import PatientCallNotes from './PatientCallNotes';

const { Option } = Select;

class PatientNotes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            notes: [],
            loading: true,
            notesModalVisible: false,

        };
    }

    componentDidMount() {
        this.loadPatientNotes();
        this.loadPatientCallNotes();
        loadConfigParameters(this, [CALL_NOTES_TYPE_CONFIG_PARAMS, CALL_NOTES_RESPONSE_CONFIG_PARAMS]);
    }

    loadPatientNotes = (page, pageSize = 5) => {
        const that = this;
        that.setState({
            loading: true,
        });
        const successFn = function (data) {

            that.setState(function (prevState) {
                return {
                    notes: [...data.results],
                    totalNotes: data.count,
                    currentNotes: data.current,
                    loading: false,
                };
            });

        };
        const errorFn = function () {
            that.setState({
                loading: false,
            });

        };
        const params = {
            page,
            page_size: pageSize,
        };
        getAPI(interpolate(PATIENT_NOTES, [this.props.patientId, this.props.showAllClinic ? '' :this.props.active_practiceId]), successFn, errorFn, params);
    };

    loadPatientCallNotes = (page, pageSize = 5) => {
        const that = this;
        that.setState({
            callNotesLoading: true,
        });
        const successFn = function (data) {

            that.setState(function (prevState) {
                return {
                    callNotes: [...data.results],
                    currentCallNotes: data.current,
                    totalCallNotes: data.count,
                    callNotesLoading: false,
                };
            });

        };
        const errorFn = function (data) {
            that.setState({
                callNotesLoading: false,
            });
        };
        const apiParams = {
            patient: this.props.patientId,
            page,
            page_size: pageSize,
        };
        getAPI(PATIENT_CALL_NOTES, successFn, errorFn, apiParams);
    };

    showNotesModal = (item) => {
        this.setState({
            notesModalVisible: true,
            editPatientNote: item,
        });
    };
    ShowCallNotesModal = () => {
        console.log("Add");
        this.setState({
            EditcallNoteModalVisible: true,
            editCallNote:null,
        });
    };
    ShowEditCallNotesModal = (item) => {
        console.log(item);
        this.setState({
            EditcallNoteModalVisible: true,
            editCallNote: item,
        });
    };

    handleCancel = (e) => {
        this.setState({
            notesModalVisible: false,
        });
    };

    // updateNotes = (e) => {
    //     const that = this;
    //     const { editPatientNote } = this.state;
    //     e.preventDefault();
    //     this.props.form.validateFields((err, values) => {
    //         if (!err) {

    //             const reqData = {
    //                 ...values,
    //                 id: editPatientNote.id,
    //                 patient: that.props.patientId,
    //                 practice: that.props.active_practiceId,
    //             };

    //             const successFn = function () {
    //                 displayMessage(SUCCESS_MSG_TYPE, 'Patient Note Update');
    //                 that.loadPatientNotes();
    //                 that.handleCancel();

    //             };
    //             const errorFn = function () {
    //                 that.handleCancel();
    //             };

    //             postAPI(interpolate(PATIENT_NOTES, [this.props.patientId, this.props.active_practiceId]), reqData, successFn, errorFn);
    //         }
    //     });
    // };

    deleteNote = (item) => {
        const that = this;
        const reqData = { 'id': item.id, is_active: false };
        const successFn = function (data) {
            that.setState({
                loading: false,
            });
            that.loadPatientNotes();
        };
        const errorFn = function () {
            that.setState({
                loading: false,
            });
        };
        postAPI(interpolate(PATIENT_NOTES, [this.props.patientId, this.props.active_practiceId]), reqData, successFn, errorFn);
    };


    render() {
        const that = this;
        const { activePracticePermissions } = this.props;

        const fields = [{
            key: 'name',
            required: true,
            type: INPUT_FIELD,
            label: 'Note',
        }];


        const EditFields = [{
            key: 'name',
            required: true,
            type: INPUT_FIELD,
            label: 'Note',
            initialValue: that.state.editPatientNote ? that.state.editPatientNote.name : ""
        }];


        const formProp = {
            successFn(data) {
                displayMessage(SUCCESS_MSG_TYPE, 'Patient Note Added');
                that.loadPatientNotes();
                that.setState({
                    notesModalVisible:false
                })
            },
            errorFn() {
                that.setState({
                    notesModalVisible:true
                })
            },
            action: interpolate(PATIENT_NOTES, [this.props.patientId, this.props.active_practiceId]),
            method: 'post',
            beforeSubmit(data) {

            },
        };
        const editformProp = {
            successFn(data) {

                displayMessage(SUCCESS_MSG_TYPE, 'Patient Note Update');
                that.loadPatientNotes();
                that.setState({
                    notesModalVisible:false
                })
            },
            errorFn() {
                that.setState({
                    notesModalVisible:true
                })

            },
            action: interpolate(PATIENT_NOTES, [this.props.patientId, this.props.active_practiceId]),
            method: 'post',
            beforeSubmit(data) {

            },
        }


        const defaultValues = [{ key: 'patient', value: this.props.patientId }, {
            key: 'practice',
            value: this.props.active_practiceId,
        }];

        const editDefaultValues = [
            {
                key: 'patient', value: this.props.patientId
            },
            {
                key: 'practice',
                value: this.props.active_practiceId
            },
            {
                key: "id", value: that.state.editPatientNote && that.state.editPatientNote.id
            }
        ];

        const TestFormLayout = Form.create()(DynamicFieldsForm);


        const layout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 16 },
        };

        const renderActions = (item) => {
            const noteActions = [];
            if (activePracticePermissions.DeletePatientNotes) {
                noteActions.push(
                    <Popconfirm
                        title="Are you sure delete this item?"
                        onConfirm={() => that.deleteNote(item)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <a><Icon type="delete" style={{ color: 'red' }} /></a>
                    </Popconfirm>,
                );
            }
            if (activePracticePermissions.EditPatientNotes) {
                noteActions.push(
                    <a key="list-loadmore-edit" onClick={() => this.showNotesModal(item)}> <Icon type='edit' /> </a>,
                );
            }
            return noteActions;

        };


        return (
            <div>
                <PatientCallNotes
                    key={this.props.patientId}
                    patientId={this.props.patientId}
                    activePracticePermissions={activePracticePermissions}
                    config_call_response={this.state.config_call_response}
                    config_call_types={this.state.config_call_types}
                    user={this.props.user}
                />
                <Divider />

                <h2>Patient Notes</h2>
                <TestFormLayout
                    formProp={formProp}
                    defaultValues={defaultValues}
                    fields={fields}
                />
                <Row>
                    <Pagination disabled={this.state.loading} current={this.state.currentNotes} size="small"

                        total={this.state.totalNotes} pageSize={5}
                        onChange={this.loadPatientNotes} style={{ float: 'right' }} />
                </Row>
                {this.state.notes.length ? (
                    <List
                        size="small"
                        loading={this.state.loading}
                        dataSource={this.state.notes}
                        renderItem={item => (
                            <List.Item actions={renderActions(item)}>
                                <List.Item.Meta
                                    title={item.name}
                                    description={<span>by {item.staff ? item.staff.user.first_name : '--'}  on {moment(item.created_at).format('lll')} <br/>{(that.props.showAllClinic ?<Tag>{item.practice.name}</Tag>:null)}</span>}
                                />
                            </List.Item>
                        )}
                    />
                ) : null}
                <Row>
                    <Pagination disabled={this.state.loading} current={this.state.currentNotes} size="small"
                        total={this.state.totalNotes} pageSize={5}
                        onChange={this.loadPatientNotes} style={{ float: 'right' }} />
                </Row>



                <Modal
                    title="Patient Notes"
                    visible={this.state.notesModalVisible}

                    footer={null}
                    onCancel={this.handleCancel}
                >
                    <TestFormLayout
                        formProp={editformProp}
                        defaultValues={editDefaultValues}
                        fields={EditFields}
                    />
                </Modal>
            </div>
        );
    }
}


export default PatientNotes;
