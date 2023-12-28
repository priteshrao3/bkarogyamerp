import React from "react";
import {Button, Card, Col, Icon, Radio, Row, Table, Divider, Select} from "antd";
import {PATIENTS_REPORTS, PATIENT_GROUPS, OFFERS, MEDICAL_HISTORY_LIST,HR_SETTING,ALL_PRACTICE_STAFF,
    PATIENTS_LIST,ALL_PRACTICE} from "../../../constants/api";
import {
    NEW_PATIENTS,
    DAILY_NEW_PATIENTS,
    PATIENTS_FIRST_APPOINTMENT,
    MONTHLY_NEW_PATIENTS,
    NEW_MEMBERSHIP,
    PATIENT_CALL_NOTES,
    EXPIRING_MEMBERSHIP,
    ACTIVE_PATIENTS,
    FOLLOW_UP,
    MEDICINE,
    SOURCE_REPORT,
    PD_DOCTOR,
    MEDICAL_HISTORY,
    RELIGION_WISE_PATIENT,
    GROUP_REPORT_DATA,
    NEW_REGISTRATION, EXPIRING_REGISTRATION,
} from '../../../constants/dataKeys';
import {BLOOD_GROUPS, PATIENTS_RELATED_REPORT,GROUP_TYPE,CALL_TYPE,CALL_RESPONSE} from "../../../constants/hardData";
import {getAPI, displayMessage, interpolate} from "../../../utils/common";
import DailyNewPatientReports from "./DailyNewPatientsReports";
import ExpiringMembership from "./ExpiringMembership";
import MonthlyNewPatients from "./MonthlyNewPatients";
import NewMembership from "./NewMembership";
import NewPatientReports from "./NewPatientReport";
import PatientsFirstAppointment from "./PatientsFirstAppointment";
import ActivePatients from "./ActivePatients";
import PatientFollowUp from "./PatientFollowUp";
import PatientMedicine from "./PatientMedicine";
import SourceWisePatientReport from "./SourceWisePatientReport";
import PDDoctorWisePatient from "./PDDoctorWisePatient";
import MedicalHistoryWisePatient from "./MedicalHistoryWisePatient";
import ReligionWisePatient from "./ReligionWisePatient";
import {loadAllDoctors} from "../../../utils/clinicUtils";
import GroupReport from "./GroupReport";
import PatientCallReport from "./PatientCallReport";
import NewRegisterPatient from './NewRegisterPatient';
import ExpiringRegistration from './ExpiringRegistration';
export default class PatientsReportHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type: 'DETAILED',
            advancedOptionShow: true,
            sidePanelColSpan: 4,
            patientGroup: [],
            offerOption: [],
            medicalHistory: [],
            practiceDoctors: [],
            religionData: [],
            staff:[],
            patient:[],
            clinic:[],
        }
        this.loadPatientGroup = this.loadPatientGroup.bind(this);
        this.loadMedicalHistory = this.loadMedicalHistory.bind(this)
        this.getReligions = this.getReligions.bind(this);
        this.staffData=this.staffData.bind(this);
        this.patientData=this.patientData.bind(this);
        this.clinicData=this.clinicData.bind(this);
    }

    componentDidMount() {
        this.loadPatientGroup();
        this.loadMedicalHistory();
        this.getReligions();
        this.staffData();
        this.patientData();
        this.clinicData();
        loadAllDoctors(this)
    }

    loadPatientGroup() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                patientGroup: data,
            });
        };
        const errorFn = function () {

        }
        getAPI(interpolate(PATIENT_GROUPS, [this.props.active_practiceId]), successFn, errorFn)
    }

    loadMedicalHistory() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                medicalHistory: data,
            });
        };
        const errorFn = function () {

        }
        getAPI(MEDICAL_HISTORY_LIST, successFn, errorFn)
    }
    patientData(){
        const that=this;
    const successFn=function(data){
        that.setState({
            patient:data.results
        })
    };
    const errorFun = function () {
  };
  getAPI(PATIENTS_LIST, successFn, errorFun);
}
clinicData(){
    const that=this;
    const successFn=function(data){
        that.setState({
            clinic:data
        })
    };
    const errorFun = function () {
  };
  getAPI(ALL_PRACTICE, successFn, errorFun);

}
staffData(){
    const that=this;
    const successFn=function(data){
        that.setState({
            staff:data
        })
    };
    const errorFun = function () {
  };
  getAPI(ALL_PRACTICE_STAFF, successFn, errorFun);
}


    getReligions(){
        const that=this;
        const successFn=function(data){
            that.setState({
                religionData:data
            })
        };
        const errorFun = function () {
      };
      getAPI(HR_SETTING, successFn, errorFun,{name:"Religion"});
    }

    // loadOffer(){
    //     let that=this;
    //     let successFun=function (data) {
    //         that.setState({
    //             offerOption:data,
    //         })
    //     };
    //     let errorFn =function () {
    //
    //     }
    //     getAPI(interpolate(OFFERS ,[this.props.active_practiceId]),successFun,errorFn);
    // }

    onChangeHandle = (type, value) => {
        const that = this;
        this.setState({
            [type]: value.target.value,
        })
    }

    advancedOption(value) {
        this.setState({
            advancedOptionShow: value,
        })
    }

    changeSidePanelSize = (sidePanel) => {
        this.setState({
            sidePanelColSpan: sidePanel ? 0 : 4
        })
    }

    handleChangeOption = (type, value) => {
        const that = this;
        this.setState({
            [type]: value,
        })
    }

    render() {
        return (
            <div>
                <h2>Patients Report <Button
                  type="primary"
                  shape="round"
                  icon={this.state.sidePanelColSpan ? "double-right" : "double-left"}
                  style={{float: "right"}}
                  onClick={() => this.changeSidePanelSize(this.state.sidePanelColSpan)}
                >Panel
                                    </Button>
                </h2>
                <Card>
                    <Row gutter={16}>
                        <Col span={(24 - this.state.sidePanelColSpan)}>

                            {this.state.type == NEW_PATIENTS ?
                                <NewPatientReports {...this.props} {...this.state} /> : null}

                            {this.state.type == DAILY_NEW_PATIENTS ?
                                <DailyNewPatientReports {...this.props} {...this.state} /> : null}

                            {this.state.type == EXPIRING_MEMBERSHIP ?
                                <ExpiringMembership {...this.props} {...this.state} /> : null}
                            {this.state.type == PATIENTS_FIRST_APPOINTMENT ?
                                <PatientsFirstAppointment {...this.props} {...this.state} /> : null}
                            {this.state.type == MONTHLY_NEW_PATIENTS ?
                                <MonthlyNewPatients {...this.props} {...this.state} /> : null}
                            {this.state.type == NEW_MEMBERSHIP ?
                                <NewMembership {...this.props} {...this.state} /> : null}

                            {this.state.type == ACTIVE_PATIENTS ?
                                <ActivePatients {...this.props} {...this.state} /> : null}
                            {this.state.type == SOURCE_REPORT ?
                                <SourceWisePatientReport {...this.props} {...this.state} /> : null}

                            {this.state.type == FOLLOW_UP ?
                                <PatientFollowUp {...this.props} {...this.state} /> : null}

                            {this.state.type == MEDICINE ?
                                <PatientMedicine {...this.props} {...this.state} /> : null}

                            {this.state.type == PD_DOCTOR ?
                                <PDDoctorWisePatient {...this.props} {...this.state} /> : null}

                            {this.state.type == MEDICAL_HISTORY ?
                                <MedicalHistoryWisePatient {...this.props} {...this.state} /> : null}

                            {this.state.type == RELIGION_WISE_PATIENT ?
                                <ReligionWisePatient {...this.props} {...this.state} /> : null}
                            {this.state.type == GROUP_REPORT_DATA ?
                            <GroupReport {...this.props} {...this.state}/>:null}
                            {this.state.type== PATIENT_CALL_NOTES?
                            <PatientCallReport {...this.props}{...this.state}/>:null}
                            {this.state.type==NEW_REGISTRATION ?<NewRegisterPatient {...this.props} {...this.state}/>:null}
                            {this.state.type==EXPIRING_REGISTRATION ?<ExpiringRegistration {...this.props} {...this.state}/>:null}
                        </Col>


                        <Col span={this.state.sidePanelColSpan}>
                            <Radio.Group
                              buttonStyle="solid"
                              defaultValue={NEW_PATIENTS}
                              onChange={(value) => this.onChangeHandle('type', value)}
                            >
                                <h2>Patients</h2>
                                <Radio.Button
                                  style={{width: '100%', backgroundColor: 'transparent', border: '0px'}}
                                  value={NEW_PATIENTS}
                                >
                                    New Patients
                                </Radio.Button>
                                <p><br /></p>
                                <h2>Related Reports</h2>
                                {PATIENTS_RELATED_REPORT.map((item) => (
                                    <Radio.Button
                                      style={{width: '100%', backgroundColor: 'transparent'}}
                                      value={item.value}
                                    >
                                        {item.name}
                                    </Radio.Button>
                                ))}
                            </Radio.Group>

                            <br />
                            <br />
                                    {this.state.advancedOptionShow ? (
                                        <>
                                            <Button type="link" onClick={(value) => this.advancedOption(false)}>Hide
                                                Advanced Options
                                            </Button>
                                            {this.state.type == MEDICAL_HISTORY ? (
                                                <Col>
                                                    <br />
                                                    <h4>Medical History</h4>
                                                    <Select
                                                      style={{minWidth: '200px'}}
                                                      mode="multiple"
                                                      placeholder="Select Medical History"
                                                      onChange={(value) => this.handleChangeOption('medical_history', value)}
                                                    >
                                                        {this.state.medicalHistory.map((item) => (
                                                            <Select.Option value={item.id}>
                                                                {item.name}
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                </Col>
                                            ) : null}
                                            {this.state.type == RELIGION_WISE_PATIENT ? (
                                                <Col>
                                                    <br />
                                                    <h4>Religion</h4>
                                                    <Select
                                                      style={{minWidth: '200px'}}
                                                      mode="multiple"
                                                      placeholder="Select Religion"
                                                      onChange={(value) => this.handleChangeOption('religions', value)}
                                                    >
                                                        {this.state.religionData.map((item) => (
                                                            <Select.Option value={item.id}>
                                                                {item.value}
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                </Col>
                                            ) : null}
                                       {this.state.type == GROUP_REPORT_DATA ?  (
                                            <Col>
                                            <h4>Group Type</h4>
                                            <Select
                                              style={{minWidth: '200px'}}
                                              placeholder="Select Group"
                                              onChange={(value) => this.handleChangeOption('groupvalue', value)}
                                              allowClear
                                            >
                                              {GROUP_TYPE.map((item) => (
                                                            <Select.Option value={item.value}>
                                                                {item.name}
                                                            </Select.Option>
                                                        ))}
                                            </Select>
                                            </Col>
                                            ):null}
                                            {this.state.type == NEW_PATIENTS || this.state.type == DAILY_NEW_PATIENTS || this.state.type == MONTHLY_NEW_PATIENTS || this.state.type == ACTIVE_PATIENTS || this.state.type == FOLLOW_UP
                                            || this.state.type == MEDICINE || this.state.type == SOURCE_REPORT ? (
                                                <Col> <br />
                                                    <h4>Patient Groups</h4>
                                                    <Select
                                                      style={{minWidth: '200px'}}
                                                      mode="multiple"
                                                      placeholder="Select Patient Groups"
                                                      onChange={(value) => this.handleChangeOption('patient_groups', value)}
                                                    >
                                                        {this.state.patientGroup.map((item) => (
                                                            <Select.Option value={item.id}>
                                                                {item.name}
                                                            </Select.Option>
                                                        ))}
                                                    </Select>

                                                    <br />
                                                    <h4>Blood Groups</h4>
                                                    <Select
                                                      style={{minWidth: '200px'}}
                                                      placeholder="Select Blood Group"
                                                      onChange={(value) => this.handleChangeOption('blood_group', value)}
                                                      allowClear
                                                    >
                                                        {BLOOD_GROUPS.map((item) => (
                                                            <Select.Option value={item.value}>
                                                                {item.name}
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                    <br />
                                                </Col>
                                                ) : null}
                                            {this.state.type == PD_DOCTOR ? (
                                                <Col>
                                                    <h4>PD Doctor</h4>
                                                    <Select
                                                      style={{minWidth: '200px'}}
                                                      placeholder="Select PD Doctor"
                                                      onChange={(value) => this.handleChangeOption('pd_doctor', value)}
                                                      allowClear
                                                    >
                                                        {this.state.practiceDoctors.map((item) => (
                                                            <Select.Option
                                                              value={item.id}
                                                            >{item.user.first_name}
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                </Col>
                                            ) : null}
                                              {this.state.type == PATIENT_CALL_NOTES? (
                                                  <Row>
                                                <Col>
                                                    <h4>Staff</h4>
                                                    <Select
                                                      style={{minWidth: '200px'}}
                                                      placeholder="staff name"
                                                      onChange={(value) => this.handleChangeOption('practice_staff', value)}
                                                      allowClear
                                                    >
                                                        {this.state.staff.map((item) => (
                                                            <Select.Option
                                                              value={item.id}
                                                            >{item.user.first_name}
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                    </Col>
                                                    <Col>
                                                    <h4>Patient</h4>
                                                    <Select
                                                      style={{minWidth: '200px'}}
                                                      placeholder="patient name"
                                                      onChange={(value) => this.handleChangeOption('patient_name', value)}
                                                      allowClear
                                                    >
                                                        {this.state.patient.map((item) => (
                                                            <Select.Option
                                                              value={item.id}
                                                            >{item.user.first_name}
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                </Col>
                                                <Col>
                                                <h4>Practice</h4>
                                                    <Select
                                                      style={{minWidth: '200px'}}
                                                      placeholder="Practice"
                                                      onChange={(value) => this.handleChangeOption('practice_name', value)}
                                                      allowClear
                                                    >
                                                        {this.state.clinic.map((item) => (
                                                            <Select.Option
                                                              value={item.id}
                                                            >{item.name}
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                </Col>
                                                <Col>
                                                <h4>Call Type </h4>
                                                    <Select
                                                      style={{minWidth: '200px'}}
                                                      placeholder="Practice"
                                                      onChange={(value) => this.handleChangeOption('call_type', value)}
                                                      allowClear
                                                    >
                                                        {CALL_TYPE.map((item) => (
                                                            <Select.Option
                                                              value={item.value}
                                                            >{item.name}
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                </Col>
                                                <Col>
                                                <h4>Response Type </h4>
                                                    <Select
                                                      style={{minWidth: '200px'}}
                                                      placeholder="Practice"
                                                      onChange={(value) => this.handleChangeOption('response_type', value)}
                                                      allowClear
                                                    >
                                                        {CALL_RESPONSE.map((item) => (
                                                            <Select.Option
                                                              value={item.value}
                                                            >{item.name}
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                </Col>
                                                </Row>
                                            ) : null}

                                        </>
                                    ) : (
                                        <Button type="link" onClick={(value) => this.advancedOption(true)}>Show Advanced
                                            Options
                                        </Button>
                                    )}
                        </Col>

                    </Row>
                </Card>
            </div>
        )
    }
}
