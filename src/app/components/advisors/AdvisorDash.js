import React from "react";
import { Route, Switch } from 'react-router-dom';
import { Layout } from "antd";

import AgentsList from "./agents/AgentList";
import AdvisorSider from "./AdvisorSider";
import PermissionDenied from "../common/errors/PermissionDenied";
import Error404 from "../common/errors/Error404";
import AdvisorTnC from "./tnc/AdvisorTnC";
import ManageOffersList from "./offers/ManageOffersList";
import AddOrEditCallData from './callData/AddOrEditCallData';
import CallDataList from './callData/CallDataList';
import TeamAnalysis from './teamAnalysis/TeamAnalysis';
import BankDetails from "./bankDetails/BankDetails";

const { Content } = Layout;


class AdvisorDash extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: false,
        };
    }

    render() {
        return (
            <Content
                className="main-container"
                style={{
                    // margin: '24px 16px',
                    // padding: 24,
                    minHeight: 280,
                    // marginLeft: '200px'
                }}
            >
                <Layout>
                    <AdvisorSider {...this.props} />
                    <Content style={{
                        margin: '24px 16px',
                        // padding: 24,
                        minHeight: 280,
                        // marginLeft: '200px'
                    }}
                    >
                        <Switch>
                            <Route
                                path="/erp/advisors/tnc"
                                render={(route) => (this.props.activePracticePermissions.SettingsAgents || this.props.allowAllPermissions ? (
                                    <AdvisorTnC
                                        {...this.state}
                                        {...this.props}
                                        {...route}
                                        key={this.state.active_practiceId}
                                    />
                                ) : <PermissionDenied />)}
                            />
                            <Route
                                path="/erp/advisors/offers"
                                render={(route) => (this.props.activePracticePermissions.SettingsAgents || this.props.allowAllPermissions ? (
                                    <ManageOffersList
                                        {...this.state}
                                        {...this.props}
                                        {...route}
                                        key={this.state.active_practiceId}
                                    />
                                ) : <PermissionDenied />)}
                            />
                            <Route
                            path="/erp/advisors/teamanalysis" render={(route)=>
                            (this.props.activePracticePermissions.SettingsAgents || this.props.allowAllPermissions ? (
                                <TeamAnalysis
                                    {...this.state}
                                    {...this.props}
                                    {...route}
                                    key={this.state.active_practiceId}
                                />
                            ) : <PermissionDenied />)}/>
                            <Route
                            path="/erp/advisors/bankdetails" render={(route)=>
                            (this.props.activePracticePermissions.SettingsAgents || this.props.allowAllPermissions ? (
                                <BankDetails
                                    {...this.state}
                                    {...this.props}
                                    {...route}
                                    key={this.state.active_practiceId}
                                />
                            ) : <PermissionDenied />)}/>
                            <Route path="/erp/advisors/calldata/add" render={(route) => <AddOrEditCallData
                                {...this.props} {...this.state} {...route} />}/>
                            <Route path="/erp/advisors/calldata/:id/edit" render={(route) => <AddOrEditCallData
                                {...this.props}  {...this.state} {...route} />}/>
                            <Route path="/erp/advisors/calldata" render={(route) => <CallDataList
                                {...this.props} {...this.state} {...route} />}/>
                            <Route
                                path="/erp/advisors/"
                                render={(route) => (this.props.activePracticePermissions.SettingsAgents || this.props.allowAllPermissions ? (
                                    <AgentsList
                                        {...this.state}
                                        {...this.props}
                                        {...route}
                                        key={this.state.active_practiceId}
                                    />
                                ) : <PermissionDenied />)}
                            />
                            <Route component={Error404} />
                        </Switch>
                    </Content>
                </Layout>
            </Content>
        )
    }
}

export default AdvisorDash;
;
