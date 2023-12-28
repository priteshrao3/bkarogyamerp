import React from "react";
import {Avatar, Input, Card, Col, Icon, Radio, Row, Button, Spin} from "antd";
import {getAPI, interpolate, postAPI} from "../../../utils/common";
import {PATIENT_GROUPS, SEARCH_PATIENT, PATIENTS_LIST} from "../../../constants/api";

const {Meta} = Card;
const Search = Input.Search;

class PatientSelection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            patientListData: [],
            patientGroup: [],
            morePatients: null,
            loading: true
        }
        this.getPatientListData = this.getPatientListData.bind(this);
        this.searchPatient = this.searchPatient.bind(this);
        this.getMorePatient = this.getMorePatient.bind(this);
    }

    componentDidMount() {
        this.getPatientListData();
        this.getPatientGroup();
    }

    getPatientGroup() {
        let that = this;
        let successFn = function (data) {
            that.setState({
                patientGroup: data,
                loading: false
            });
        };
        let errorFn = function () {
            that.setState({
                loading: false
            })

        };
        getAPI(interpolate(PATIENT_GROUPS, [this.props.active_practiceId]), successFn, errorFn);
    }

    getPatientListData() {
        let that = this;
        let successFn = function (data) {
            that.setState({
                patientListData: data.results,
                morePatients: data.next,
                currentPage: data.current,
                loading: false
            })
        };
        let errorFn = function () {
            that.setState({
                loading: false
            })

        };
        getAPI(PATIENTS_LIST, successFn, errorFn);
    }

    searchPatient(e) {
        console.log(e.target.value);
        let that = this;
        let successFn = function (data) {
            if (data) {
                that.setState({
                    patientListData: data
                })
            }
        };
        let errorFn = function () {

        };
        getAPI(interpolate(SEARCH_PATIENT, [e.target.value]), successFn, errorFn);
    }

    getMorePatient() {
        let that = this;
        let current = this.state.currentPage;
        let successFn = function (data) {
            if (data.current == current + 1)
                that.setState(function (prevState) {
                    return {
                        patientListData: [...prevState.patientListData, ...data.results],
                        morePatients: data.next,
                        currentPage: data.current
                    }
                })
        }
        let errorFn = function () {

        }
        getAPI(PATIENTS_LIST, successFn, errorFn, {page: parseInt(current) + 1});
    }

    render() {
        let that = this;
        return <Row>
            <Col span={5}
                 style={{
                     height: 'calc(100vh - 55px)',
                     overflow: 'auto',
                     padding: '10px',
                     // backgroundColor: '#e3e5e6',
                     borderRight: '1px solid #ccc'
                 }}>
                <Radio.Group buttonStyle="solid" defaultValue="all">
                    <h2>Patients</h2>
                    <Radio.Button style={{width: '100%', backgroundColor: 'transparent', border: '0px'}} value="all">
                        All Patents
                    </Radio.Button>
                    <Radio.Button style={{width: '100%', backgroundColor: 'transparent', border: '0px'}} value="b">
                        Recently Visited
                    </Radio.Button>
                    <Radio.Button style={{width: '100%', backgroundColor: 'transparent', border: '0px'}} value="c">
                        Recently Added
                    </Radio.Button>
                    <p><br/></p>
                    <h2>Groups</h2>
                    <p><b>My Groups</b></p>
                    {this.state.patientGroup.map((group) => <Radio.Button
                        style={{width: '100%', backgroundColor: 'transparent', border: '0px'}} value={group.id}>
                        {group.name}
                    </Radio.Button>)}

                    <p><br/></p>
                    <p><b>Membership</b></p>
                </Radio.Group>
            </Col>
            <Col span={19} style={{overflow: 'scroll'}}>
                <Search placeholder="input search text"
                        onChange={value => this.searchPatient(value)}
                        enterButton/>
                <Spin spinning={this.state.loading}>
                    {this.state.patientListData.length ?
                        this.state.patientListData.map((patient) => <PatientCard {...patient}
                                                                                 setCurrentPatient={that.props.setCurrentPatient}/>) :
                        <p style={{textAlign: 'center'}}>No Data Found</p>
                    }
                </Spin>
                {this.state.morePatients ?
                    <div style={{textAlign: 'center'}}><Button type="primary" disabled={this.state.loading}
                                                               onClick={this.getMorePatient}>Load
                        More...</Button></div> : null}

            </Col>
        </Row>
    }
}

export default PatientSelection;

function PatientCard(patient) {
    return <Col xs={24} sm={24} md={12} lg={8} xl={8} xxl={6}>
        <Card onClick={() => patient.setCurrentPatient(patient)} style={{margin: '5px'}}>
            <Meta avatar={(patient.image ? <Avatar src={patient.image}/> :
                <Avatar style={{backgroundColor: '#87d068'}}>
                    {patient.user.first_name ? patient.user.first_name.charAt(0) :
                        <Icon type="user"/>}
                </Avatar>)}
                  title={patient.user.first_name}
                  description={<span>{patient.user.mobile}<br/>{patient.user.email}</span>}/>
        </Card>
    </Col>;
}
