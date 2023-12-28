import React, { Component } from "react";
import { Button, Pagination, List, Row, Icon, Form, Popconfirm, Modal, Select, Input } from "antd";
import { getAPI, displayMessage, postAPI } from "../../../utils/common";
import { PATIENT_CALL_NOTES } from "../../../constants/api";
import moment from "moment";
import { SUCCESS_MSG_TYPE } from "../../../constants/dataKeys";
const { Option } = Select;


class PatientCallNotes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            callNotes: [],
            editCallNote: null,
            visibleModal: false
        }
    }

    componentDidMount() {
        this.loadPatientCallNotes();
    }

    loadPatientCallNotes = (page, pageSize = 5) => {
        const that = this;
        that.setState({
            loading: true,
        });
        const successFn = function (data) {

            that.setState(function (prevState) {
                return {
                    callNotes: [...data.results],
                    currentCallNotes: data.current,
                    totalCallNotes: data.count,
                    loading: false,
                };
            });

        };
        const errorFn = function (data) {
            that.setState({
                loading: false,
            });
        };
        const apiParams = {
            patient: this.props.patientId,
            page,
            page_size: pageSize,
        };
        getAPI(PATIENT_CALL_NOTES, successFn, errorFn, apiParams);
    };
    onVisibleModal = (item = null) => {
        let that = this;
        let { visibleModal } = that.state;
        that.setState({
            visibleModal: !visibleModal,
            editCallNote: item
        })
    }
    handleSubmit = (e) => {
        const that = this;
        e.preventDefault();
        const { editCallNote } = this.state;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const reqData = {
                    ...values,
                    patient: that.props.patientId,
                    practice: that.props.active_practiceId,
                    practice_staff: that.props.user.staff.id,
                };
                that.setState({
                    loading: true,
                })
                const successFn = function (data) {
                    that.props.form.resetFields()
                    that.onVisibleModal();
                    displayMessage(SUCCESS_MSG_TYPE, `Call Note Successfully ${editCallNote ? 'edided' : 'Created'}`);
                    that.loadPatientCallNotes();
                    that.setState({
                        loading: false,
                    })
                };
                const errorFn = function (error) {
                    that.setState({
                        loading: false,
                    })
                };
                if (editCallNote) {
                    reqData.id = editCallNote.id
                    postAPI(PATIENT_CALL_NOTES, reqData, successFn, errorFn);
                } else {
                    postAPI(PATIENT_CALL_NOTES, reqData, successFn, errorFn);
                }

            }
        });
    }
    deleteCallNote = (item) => {
        const that = this;
        const reqData = {
            id: item.id,
            is_active: false,
            patient: that.props.patientId,
        };
        const successFn = function (data) {
            that.setState({
                loading: false,
            });
            that.loadPatientCallNotes();
        };
        const errorFn = function () {
            that.setState({
                loading: false,
            });
        };
        postAPI(PATIENT_CALL_NOTES, reqData, successFn, errorFn);
    };



    render() {
        let that = this;
        let { visibleModal, editCallNote, loading } = that.state;
        let { activePracticePermissions, config_call_types, config_call_response } = that.props;
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 18 },
        };


        const renderCallNotes = (item) => {
            const noteAction = [];
            if (activePracticePermissions.DeletePatientNotes) {
                noteAction.push(
                    <Popconfirm
                        title="Are you sure delete this item?"
                        onConfirm={() => that.deleteCallNote(item)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <a><Icon type="delete" style={{ color: 'red' }} /></a>
                    </Popconfirm>,
                );
            }
            if (activePracticePermissions.DeletePatientNotes) {
                noteAction.push(
                    <a key="list-loadmore-edit" onClick={() => this.onVisibleModal(item)}> <Icon type='edit' /> </a>,
                );
            }
            return noteAction;
        };

        return (
            <div>
                <h2> Voice Call Notes
                    <Button type="primary" style={{ float: 'right' }} onClick={() => this.onVisibleModal()}>
                        <Icon type="plus" />
                    </Button></h2>
                <Row>
                    <Pagination disabled={loading} current={this.state.currentCallNotes}
                        size="small" total={this.state.totalCallNotes} pageSize={5}
                        onChange={this.loadPatientCallNotes} style={{ float: 'right' }} />
                </Row>
                {this.state.callNotes.length ? (
                    <List
                        size="small"
                        loading={loading}
                        dataSource={this.state.callNotes}
                        renderItem={item => (
                            <List.Item actions={renderCallNotes(item)}>
                                <List.Item.Meta
                                    title={item.remarks}
                                    description={`by ${item.practice_staff ? item.practice_staff.user.first_name : '--'}  on ${moment(item.created_at).format('lll')}`}
                                />
                            </List.Item>
                        )}
                    />
                ) : null}
                <Row>
                    <Pagination disabled={loading} current={this.state.currentCallNotes}
                        size="small" total={this.state.totalCallNotes} pageSize={5}
                        onChange={this.loadPatientCallNotes} style={{ float: 'right' }} />
                </Row>

                <Modal
                    visible={visibleModal}
                    onCancel={() => this.onVisibleModal()}
                    footer={null}
                    title={editCallNote ? "Edit Patient Call Notes" : "Add Patient Call Notes"}
                >
                    <Form onSubmit={this.handleSubmit}>
                        <Form.Item key={"calltype"} label="Call Type"  {...formItemLayout}>
                            {getFieldDecorator('calltype', {
                                initialValue: editCallNote ? editCallNote.type : null,
                                rules: [{ required: true }],
                            })(
                                <Select
                                    placeholder="Please Select the call type"
                                >
                                    {config_call_types && config_call_types.map(item =>
                                        <Option value={item}>{item}</Option>
                                    )
                                    }
                                </Select>,
                            )}
                        </Form.Item>
                        <Form.Item key={'response'} label="Call Status"  {...formItemLayout}>
                            {getFieldDecorator('response', {
                                initialValue: editCallNote ? editCallNote.response : null,
                                rules: [{ required: true }],
                            })(
                                <Select
                                    placeholder="Please Select the Status type"
                                    rows={5}
                                >
                                    {config_call_response && config_call_response.map(item =>
                                        <Option value={item}>{item}</Option>
                                    )
                                    }
                                </Select>,
                            )}
                        </Form.Item>
                        <Form.Item key={'remarks'} label="Call Note" {...formItemLayout} >
                            {getFieldDecorator('remarks', {
                                initialValue: editCallNote ? editCallNote.remarks : null,
                            })
                                (<Input.TextArea rows={5} />)}
                        </Form.Item>
                        <Form.Item {...formItemLayout}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{ marginLeft: 200 }}
                                loading={this.state.loading}
                            >
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>


            </div >
        );
    }

}


export default Form.create()(PatientCallNotes);
