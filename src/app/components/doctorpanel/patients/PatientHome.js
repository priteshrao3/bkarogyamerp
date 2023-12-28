import React from "react";

import {Layout} from "antd";
import {Redirect, Route} from "react-router";
import PatientProfile from "./patient/PatientProfile";
import EditPatientDetails from "./patient/EditPatientDetails";
import {Switch} from "react-router-dom";
import Profile from "../auth/Profile";
import Error404 from "../common/errors/Error404";
import AgentList from "../agents/AgentList";
import PatientWalletLedger from "./wallet-ledger/PatientWalletLedger";
import PermissionDenied from "../common/errors/PermissionDenied";
import MyTree from "../agents/MyTree";
import PatientSider from "./PatientSider";
import IntegrationHome from "./integration/IntegrationHome";
import AddNewPatient from "./patient/AddNewPatient";
import MyPatients from "./patient/MyPatients";
import Dashboard from "./dashboard/Dashboard";

const {Content} = Layout;

class PatientHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPatient: this.props.user,
            active_practiceId: this.props.active_practiceId,
            medicalHistory: [],
            listModalVisible: false
        };
        this.setCurrentPatient = this.setCurrentPatient.bind(this);
        this.togglePatientListModal = this.togglePatientListModal.bind(this);
    }


    setCurrentPatient(patientObj) {
        this.setState({
            currentPatient: patientObj,
            listModalVisible: false
        });
    }

    togglePatientListModal(option) {
        this.setState({
            listModalVisible: !!option
        });
    }

    render() {
        return <Content>
            {/*<PatientHeader {...this.state} togglePatientListModal={this.togglePatientListModal}*/}
            {/*setCurrentPatient={this.setCurrentPatient}/>*/}
            <Layout>
                <PatientSider {...this.state}/>
                <Layout>
                    <Content className="main-container"
                             style={{
                                 // margin: '24px 16px',
                                 padding: 10,
                                 minHeight: 280,
                                 // marginLeft: '200px'
                             }}>
                        <Switch>
                            <Route exact path='/doctor'
                                   render={() => <Dashboard {...this.state}
                                                            key={this.state.currentPatient}
                                                            {...this.props}/>}/>
                            <Route exact path="/doctor/profile"
                                   render={() => <Profile {...this.state}
                                                          key={this.state.currentPatient} {...this.props}/>}/>

                            {/*** Patient Profile Routes*/}
                            <Route exact path='/doctor/me'
                                   render={() => <PatientProfile {...this.state}
                                                                 key={this.state.currentPatient}
                                                                 setCurrentPatient={this.setCurrentPatient} {...this.props}/>}/>
                            <Route exact path='/doctor/profile/:id/edit'
                                   render={() => <EditPatientDetails
                                       key={this.state.currentPatient}{...this.state} {...this.props}
                                       setCurrentPatient={this.setCurrentPatient}/>}/>


                            <Route path="/doctor/agents" render={(route) => <AgentList
                                key={this.state.currentPatient} {...this.state} {...route} />}/>
                            <Route path="/doctor/patient" render={(route) => <MyPatients
                                key={this.state.currentPatient} {...this.state} {...route} />}/>
                            <Route path="/add-patient" render={(route) => <AddNewPatient
                                key={this.state.currentPatient} {...this.state} {...route} />}/>

                            <Route path="/mytree" render={(route) => <MyTree
                                key={this.state.currentPatient} {...this.state} {...route} />}/>

                            <Route path="/billing/wallet"
                                   render={(route) =>
                                       <PatientWalletLedger {...this.state} {...route}
                                                            key={this.state.currentPatient ? this.state.currentPatient.id : null}/>}/>
                            <Route path="/integration"
                                   render={(route) => <IntegrationHome {...this.state}
                                                                       {...this.props}
                                                                       {...route}/>}/>


                            <Route component={Error404}/>
                        </Switch>
                    </Content>
                </Layout>
            </Layout>
        </Content>
    }
}

export default PatientHome;
