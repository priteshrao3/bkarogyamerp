import React, { Component, Suspense  } from 'react';
import { Affix, Alert, Layout, Button, Icon,Spin,Form } from 'antd';
import { Route, Switch } from 'react-router';
import ReactGA from 'react-ga';
import momenttz from 'moment-timezone';
import { GoogleReCaptcha } from 'react-google-recaptcha-v3';
import {
    loggedInUser,
    logInUser,
    logInUserWithOtp,
    logOutUser,
    setReCapatchaToken,
} from './app/utils/auth';
import { createFCMToken } from './app/utils/notifications/notifications';
import ChatBot from './app/components/core/ChatBot';
import LoginWithPhone from "./app/components/auth/forms/LogintWithPhone";
import Homebase from './app/components/newwebsite/Homebase';
import AppBaseDoctor from './app/components/doctorpanel/core/AppBase';


const Auth = React.lazy(() => import('./app/components/auth/Auth'));
const AppBase = React.lazy(() => import('./app/components/core/AppBase'));


class App extends Component {
    constructor(props) {
        super(props);
        ReactGA.initialize('UA-143616458-1');
        this.state = {
            user: loggedInUser(),
            redirect: false,
            production: window.location.hostname == 'healdiway.bkarogyam.com',
            reCaptchaToken: null,
            visibleChatBot: false,
        };
        momenttz.tz.setDefault('Asia/Kolkata');

        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        // createFCMToken();
    }

    login(data, withOtp = true) {
        const that = this;
        const successFn = function() {
            const user = loggedInUser();
            that.setState({
                user,
            });
        };
        const errorFn = function() {};
        if (withOtp) logInUser(data, successFn, errorFn);
        else logInUserWithOtp({ ...data }, successFn, errorFn);
    }

    logout() {
        const that = this;
        const successFn = function() {
            that.setState({
                user: null,
            });
        };
        const errorFn = function() {};
        logOutUser(successFn, errorFn);
    }

    setRecaptchaToken = token => {
        this.setState(
            {
                reCaptchaToken: token,
            },
            function() {
                setReCapatchaToken(token);
            },
        );
    };

    updateUserInfo = () => {
        this.setState({
            user: loggedInUser(),
        });
    };
    showMessengerDrawer = () => {
        let { visibleChatBot } = this.state;
        this.setState({
            visibleChatBot: !visibleChatBot,
        });
    };

    render() {
        const LoginWithPhoneLayout = Form.create()(LoginWithPhone);
        const that = this;
        let { visibleChatBot } = this.state;
        ReactGA.pageview(window.location.pathname + window.location.search);
        if (!this.state.reCaptchaToken)
            return <GoogleReCaptcha onVerify={this.setRecaptchaToken} />;
        return (
            <Layout>
                
                {/* {this.state.production ? null : (
                    <Affix>
                        <Alert message="Demo Version (Only for testing purposes)" banner closable />
                    </Affix>
                )} */}
                {this.state.user && this.state.user.switchedUser ? (
                    <Affix>
                        <Alert
                            message={
                                <span>
                                    You have temporary access to user login of{' '}
                                    <b>{this.state.user.first_name}</b>.{' '}
                                    <a onClick={this.logout}>Logout</a> if you no longer require it.
                                </span>
                            }
                            banner
                            type="error"
                        />
                    </Affix>
                ) : null}
                <Switch>
                    <Route
                        exact
                        path="/login"
                        render={() => <Auth {...this.state} login={this.login} />}
                    />
                    <Route
                        exact
                        path="/password-reset/:token"
                        render={route => <Auth {...route} {...this.state} login={this.login} />}
                    />
                    <Route path="/loginwithphone">
                      <LoginWithPhoneLayout {...this.state} login={this.login} />
                    </Route>
                    {/* i have to update this Appbase route to to work on the give web page but in this scenerio i have to change the
                    url of appbase to another url but to work properly and smothly to work it .. */}

                    <Route path={"/erp"}
                        render={route =>
                            this.state.user ? (
                                <AppBase
                                    {...this.state}
                                    {...route}
                                    {...this.props}
                                    logout={this.logout}
                                    updateUserInfo={this.updateUserInfo}
                                />
                            ) : (
                                <Auth {...this.state} login={this.login} />
                            )
                        }
                    />

                    <Route  path={"/doctor"} render={route=>(<AppBaseDoctor {...this.state} {...this.props} {...route} />)} />
                    
                    <Route path={"/"}
                    render={route=>(<> <Homebase {...this.state} {...this.props} {...route}  />
                        
                        </>)}/>



                   


                </Switch>
                
                {visibleChatBot && <ChatBot />}
                <div
                    style={{
                        position: 'fixed',
                        right: '20px',
                        bottom: '20px',
                        zIndex: '20',
                    }}
                >
                    <Button
                        type="primary"
                        shape="circle"
                        icon={visibleChatBot ? 'plus' : 'wechat'}
                        size="large"
                        onClick={this.showMessengerDrawer}
                    />
                </div>
            </Layout>
        );
    }
}

export default App;
