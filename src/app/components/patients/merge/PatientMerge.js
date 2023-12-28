import React from "react";
import {Row, Alert, Card, Col, AutoComplete, List, Avatar, Button, Icon, Spin} from 'antd';
import {displayMessage, getAPI, interpolate, makeFileURL, postAPI} from "../../../utils/common";
import {MERGE_PATIENTS, PATIENT_PROFILE, SEARCH_PATIENT} from "../../../constants/api";
import {ERROR_MSG_TYPE, SUCCESS_MSG_TYPE} from "../../../constants/dataKeys";

export default class PatientMerge extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            patient_from: null,
            patient_to: null,
            loading: false,
            patientListData: [],
        }

    }

    searchPatient = (value) => {
        this.setState({
            searchPatientString: value
        })
        // console.log(e.target.value);
        const that = this;
        const successFn = function (data) {
            if (data) {
                that.setState({
                    patientListData: data.results,

                })
                // console.log("list",that.state.patientListData);
            }
        };
        const errorFn = function () {
        };
        if (value){
            getAPI(interpolate(SEARCH_PATIENT, [value]), successFn, errorFn);
        }

    };

    removePatient = (type) => {
        this.setState({
            [type]: null
        })
    };

    handlePatientSelect = (event, type) => {
        console.log(event);
        if (event) {
            const that = this;
            const successFn = function (data) {
                that.setState({
                    [type]: data

                });
                // console.log("event",that.state.patientDetails);
            };
            const errorFn = function () {
            };
            getAPI(interpolate(PATIENT_PROFILE, [event]), successFn, errorFn);
        }
    }

    mergePatient = () => {
        this.setState({
            loading: true
        })
        const that = this;
        const reqData = {
            patient_from: this.state.patient_from.id,
            patient_to: this.state.patient_to.id
        }
        const successFn = function (data) {
            displayMessage(SUCCESS_MSG_TYPE, "Patients Merged Successfully!!");
            that.setState({
                loading: false,
                patient_from: null,
                patient_to: null
            });
        }
        const errorFn = function () {
            displayMessage(ERROR_MSG_TYPE, "Patients Merging Failed!!");
            that.setState({
                loading: false,
            })
        }
        postAPI(MERGE_PATIENTS, reqData, successFn, errorFn);
    }

    render() {
        const that = this;
        return (
<div>

            <h2>Merge Patients</h2>
            <Card>
                <Alert
                  message="Profile details and records of Patient 1 will be moved to Patient 2. You cannot undo this action once done."
                  type="warning"
                />
                <Spin spinning={this.state.loading}>

                    <Row gutter={16} style={{marginTop: 10}}>
                        <Col span={12} style={{textAlign: 'center'}}>
                            <h3>Patient 1</h3>
                            {this.state.patient_from ? (
                                <Card bordered={false} style={{background: '#ECECEC', textAlign: 'left'}}>
                                    <Card.Meta
                                      avatar={(this.state.patient_from.image ? <Avatar src={makeFileURL(this.state.patient_from.image)} /> : (
                                            <Avatar style={{backgroundColor: '#87d068'}}>
                                                {this.state.patient_from.user.first_name ? this.state.patient_from.user.first_name.charAt(0) :
                                                    <Icon type="user" />}
                                            </Avatar>
                                          ))}

                                      title={this.state.patient_from.user.first_name}
                                      description={this.state.patient_from.user.mobile}

                                    />

                                    <Button
                                      type="primary"
                                      style={{float: 'right'}}
                                      onClick={() => this.removePatient('patient_from')}
                                    >Select Different
                                        Patient
                                    </Button>
                                </Card>
                              ) : (
                                <AutoComplete
                                  placeholder="Patient Name"
                                  showSearch
                                  onSearch={this.searchPatient}
                                  defaultActiveFirstOption={false}
                                  showArrow={false}
                                    // value={this.state.patient_from}
                                  filterOption={false}
                                  onChange={this.handleChange}
                                  onSelect={(e) => this.handlePatientSelect(e, 'patient_from')}
                                >
                                    {this.state.patientListData.map((option) => (
<AutoComplete.Option
  value={option.id.toString()}
>
                                        <List.Item style={{padding: 0}}>
                                            <List.Item.Meta
                                              avatar={(option.image ? <Avatar src={makeFileURL(option.image)} /> : (
                                                    <Avatar style={{backgroundColor: '#87d068'}}>
                                                        {option.user.first_name ? option.user.first_name.charAt(0) :
                                                            <Icon type="user" />}
                                                    </Avatar>
                                                  ))}
                                              title={`${option.user.first_name  } (${  option.user.id  })`}
                                              description={<small>{option.user.mobile}</small>}
                                            />

                                        </List.Item>
</AutoComplete.Option>
))}
                                </AutoComplete>
                              )}
                            {/* {this.state.patient_from ? <List.Item style={{padding: 0}}> */}
                            {/* <List.Item.Meta */}
                            {/* avatar={<Avatar */}
                            {/* src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"/>} */}
                            {/* title={that.state.patient_from.user.first_name + " (" + that.state.patient_from.user.id + ")"} */}
                            {/* description={<small>{that.state.patient_from.user.mobile}</small>} */}
                            {/* /> */}

                            {/* </List.Item>:null} */}
                        </Col>
                        <Col span={12} style={{textAlign: 'center'}}>
                            <h3>Patient 2</h3>
                            {this.state.patient_to ? (
                                <Card bordered={false} style={{background: '#ECECEC', textAlign: 'left'}}>
                                    <Card.Meta
                                      avatar={(this.state.patient_to.image ? <Avatar src={makeFileURL(this.state.patient_to.image)} /> : (
                                            <Avatar style={{backgroundColor: '#87d068'}}>
                                                {this.state.patient_to.user.first_name ? this.state.patient_to.user.first_name.charAt(0) :
                                                    <Icon type="user" />}
                                            </Avatar>
                                          ))}
                                      title={this.state.patient_to.user.first_name}
                                      description={this.state.patient_to.user.mobile}

                                    />

                                    <Button
                                      type="primary"
                                      style={{float: 'right'}}
                                      onClick={() => this.removePatient('patient_to')}
                                    >Select Different
                                        Patient
                                    </Button>
                                </Card>
                              ) : (
                                <AutoComplete
                                  placeholder="Patient Name"
                                  showSearch
                                  onSearch={this.searchPatient}
                                  defaultActiveFirstOption={false}
                                  showArrow={false}
                                    // value={this.state.patient_from}
                                  filterOption={false}
                                  onChange={this.handleChange}
                                  onSelect={(e) => this.handlePatientSelect(e, 'patient_to')}
                                >
                                    {this.state.patientListData.map((option) => (
<AutoComplete.Option
  value={option.id.toString()}
>
                                        <List.Item style={{padding: 0}}>
                                            <List.Item.Meta
                                              avatar={(option.image ? <Avatar src={makeFileURL(option.image)} /> : (
                                                    <Avatar style={{backgroundColor: '#87d068'}}>
                                                        {option.user.first_name ? option.user.first_name.charAt(0) :
                                                            <Icon type="user" />}
                                                    </Avatar>
                                                  ))}
                                              title={`${option.user.first_name  } (${  option.user.id  })`}
                                              description={<small>{option.user.mobile}</small>}
                                            />

                                        </List.Item>
</AutoComplete.Option>
))}
                                </AutoComplete>
                              )}
                            {/* {this.state.patient_to ? <List.Item style={{padding: 0}}> */}
                            {/* <List.Item.Meta */}
                            {/* avatar={<Avatar */}
                            {/* src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"/>} */}
                            {/* title={that.state.patient_to.user.first_name + " (" + that.state.patient_to.user.id + ")"} */}
                            {/* description={<small>{that.state.patient_to.user.mobile}</small>} */}
                            {/* /> */}

                            {/* </List.Item>:null} */}
                        </Col>
                        <Col span={24} style={{textAlign: 'center', marginTop: 30}}>
                            <Button
                              disabled={this.state.loading || !this.state.patient_from || !this.state.patient_to}
                              type="primary"
                              onClick={this.mergePatient}
                            >
                                <Icon type="plus" />Merge Patients
                            </Button>
                        </Col>
                    </Row>

                </Spin>
            </Card>
</div>
)
    }
}
