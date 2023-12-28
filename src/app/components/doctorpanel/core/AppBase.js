import React from "react";
import {Route, Switch} from "react-router-dom";
import AppHeader from "./AppHeader";
import {Button, Layout} from "antd";
import AppFooter from "./AppFooter";

import PatientHome from "../patients/PatientHome";
import Error404 from "../common/errors/Error404";

import SuggestionBox from "./SuggestionBox";

class AppBaseDoctor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: false,
            allowAllPermissions: false,
        };
    }

    toggleSider = (option) => {
        this.setState({
            collapsed: !!option,
        });
    };

    showDrawer = () => {
        this.setState({
            visible: true,
        });
    };
    onClose = () => {
        this.setState({
            visible: false,
        });
    };

    render() {
        let that = this;
        return <Layout style={{minHeight: '100vh'}}>
            <div style={{
                position: 'fixed', right: '29px',
                bottom: '23px', zIndex: '20'
            }}>
                <Button type="primary" shape="circle" icon="mail" size={"large"} onClick={this.showDrawer}/>
            </div>
            <Layout>
                <AppHeader {...this.props}
                           {...this.state}
                           switchPractice={this.switchPractice}
                           toggleSider={this.toggleSider}/>
                <Switch>

                    <Route path="/doctor" render={(route) => <PatientHome {...this.state}
                                                                    {...this.props}
                                                                    {...route}
                                                                    key={this.state.active_practiceId}/>}/>


                    <Route component={Error404}/>
                    <AppFooter/>
                </Switch>

            </Layout>
            <SuggestionBox {...this.state} close={this.onClose}/>

        </Layout>;
    }
}

export default AppBaseDoctor;
