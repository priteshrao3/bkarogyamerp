import {Alert, Button, Checkbox, Col, Divider, Modal, Row, Spin} from "antd";
import React from "react";
import {displayMessage, getAPI, interpolate, putAPI} from "../../../utils/common";
import {ALL_PRACTICE, PATIENT_PROFILE} from "../../../constants/api";
import {ERROR_MSG_TYPE, SUCCESS_MSG_TYPE} from "../../../constants/dataKeys";

export default class ManagePatientPractice extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formLoading: false,
            showManageModal: false,
            practicesList: [],
            patientData: null,
            availablePractices: {},
            selectedPractices: []
        }
    }

    componentDidMount() {
        if (this.props.patientData) {
            const availablePractices = {};
            this.props.patientData.practices.forEach(function (practiceData) {
                availablePractices[practiceData.practice] = practiceData;
            });
            this.setState({
                availablePractices,
                patientData: this.props.patientData
            })
        }
        this.loadPracticeList();
    }

    toggleManageModal = (option) => {
        this.setState({
            showManageModal: !!option
        })
    }

    loadPracticeList() {
        const that = this;
        const successFn = function (data) {

            that.setState({
                practicesList: data,
            })
        };
        const errorFn = function () {
        };
        getAPI(ALL_PRACTICE, successFn, errorFn);

    }

    onSelectPractice = (checkedValues) => {
        this.setState({
            selectedPractices: checkedValues
        })
    }

    savePracticeAccessData = () => {
        const {patientData, selectedPractices, availablePractices} = this.state;
        const that = this;
        const practicesDataToSend = [];
        selectedPractices.forEach(function (practice) {
            if (availablePractices[practice]) {
                practicesDataToSend.push(availablePractices[practice]);
            } else {
                practicesDataToSend.push({practice, pd_doctor: null});
            }
        });
        this.setState({
            formLoading: true
        })
        const successFn = function () {
            displayMessage(SUCCESS_MSG_TYPE, "Practices Assigned Successfully!!");
            that.toggleManageModal(false);
            if (that.props.loadData) {
                that.props.loadData();
            }
            that.setState({
                formLoading: false
            })
        }
        const errorFn = function () {
            that.setState({
                formLoading: false
            })
            displayMessage(ERROR_MSG_TYPE, "Practices Assigning Failed!!");
        }
        putAPI(interpolate(PATIENT_PROFILE, [patientData.id]), {practices: practicesDataToSend}, successFn, errorFn)
    }

    render() {
        const {showManageModal, practicesList, availablePractices, formLoading} = this.state;
        const options = practicesList.map(practice => {
            return {label: practice.name, value: practice.id}
        });
        if (!this.state.patientData) {
            return <Spin size="large" />
        }
        ;
        const defaultPractices = Object.keys(availablePractices);
        return (
            <div>

                <Divider />
                <Button onClick={() => this.toggleManageModal(true)} type="primary" block>Manage Practices</Button>
                <Spin spinning={formLoading}>
                    <Modal
                      visible={showManageModal}
                      footer={null}
                      title="Assign Practices to Patient"
                      onCancel={() => this.toggleManageModal(false)}
                    >
                        <Alert
                          type="info"
                          message="If you remove the current practice access. You will not be able to access the patient."
                          showIcon
                          banner
                        />
                        <Divider />
                        <Checkbox.Group
                          options={options}
                          defaultValue={defaultPractices.map(id => parseInt(id))}
                          onChange={this.onSelectPractice}
                        />
                        <Row style={{marginTop: 15}}>
                            <Col span={24}>
                                <Button
                                  style={{margin: 5}}
                                  type="primary"
                                  onClick={() => this.savePracticeAccessData()}
                                >Save
                                </Button>
                                <Button
                                  style={{margin: 5}}
                                  onClick={() => this.toggleManageModal(false)}
                                >Cancel
                                </Button>
                            </Col>
                        </Row>
                    </Modal>
                </Spin>
            </div>
        );
    }

}
