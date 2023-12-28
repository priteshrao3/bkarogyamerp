import React from "react";
import {Avatar, Dropdown, Icon, Select, Layout, Menu} from "antd";
import {Route, Link, Switch} from 'react-router-dom';
import Applogo from '../../../assets/img/kidneycarelogo.png'
import {
    displayMessage,
    getAPI,
    interpolate,
    postOuterAPI,
    startLoadingMessage,
    stopLoadingMessage
} from "../../../utils/common";
import {ERROR_MSG_TYPE, SUCCESS_MSG_TYPE} from "../../../constants/dataKeys";
import {CREDENTIALS, SAVE_CREDENTIALS} from "../../../constants/api";

const {Header} = Layout;

class AppHeader extends React.Component {
    constructor(props) {
        super(props);
    }

    setUserCredentials(email, password) {
        let that = this;
        let msg = startLoadingMessage("Waiting for authentication from server...");
        sessionStorage.removeItem('token');
        let reqData = {
            email: email,
            password: password
        };
        let successFn = function (data) {
            if (data.success) {
                stopLoadingMessage(msg, SUCCESS_MSG_TYPE, " Authentication Successfully!!");
                sessionStorage.setItem("token", data.token);
            }
            if (sessionStorage.getItem('token')) {
                window.open('/task/');
            } else {
                stopLoadingMessage(msg, ERROR_MSG_TYPE, "Authentication failed. User not found.");
            }

        };
        let errorFn = function () {

        };
        if (sessionStorage.getItem('token') == null) {
            postOuterAPI(CREDENTIALS, reqData, successFn, errorFn);
        }

    };

    switchPortal = () => {
        let that = this;
        let successFn = function (data) {
            if (data) {
                that.setUserCredentials(data.login, data.password);
                // that.setUserCredentials(data.email,data.password);
            }

        };
        let errorFn = function () {
            displayMessage(ERROR_MSG_TYPE, "Something went wrong.");
        };

        getAPI(interpolate(SAVE_CREDENTIALS, [that.props.user.user.id]), successFn, errorFn);
    };

    render() {
        const userMenu = (
            <Menu>
                {/*<Menu.Item>*/}
                {/*UserName*/}
                {/*</Menu.Item>*/}
                <Menu.Item key="profile">
                    <Link to="/profile">Profile</Link>
                </Menu.Item>
                <Menu.Divider/>
                <Menu.Item key={"website"} onClick={this.switchPortal}>
                    <small>Switch to Tasks </small>
                </Menu.Item>
                <Menu.Divider/>
                <Menu.Item key="logout">
                    <a onClick={this.props.logout}>Log out</a>
                </Menu.Item>
            </Menu>
        );
        return <Header style={{padding: 0, boxShadow: '0 2px 4px 0 rgba(38,50,69,.2)', zIndex: 1}}>
            {/* <div style={{float: 'left', margin: '0px 20px'}}>
                <Icon
                    className="trigger"
                    type={this.props.collapsed ? 'menu-unfold' : 'menu-fold'}
                    onClick={()=>this.props.toggleSider(!this.props.collapsed)}
                />
            </div> */}
            <div style={{float: 'left', margin: '0px 20px', display: 'inline-flex'}}>
                <img src={Applogo} alt="" style={{maxWidth: '100%', maxHeight: 60,padding:5}}/> <h2
                style={{color: 'white',lineHeight:'50px'}}>&nbsp;&nbsp;&nbsp;Advisor&nbsp;Panel</h2>
            </div>

            <Menu mode="horizontal"
                  theme={"dark"}
                  style={{lineHeight: '64px'}}>

                <Menu.Item key="4">
                    {/* <Link to="/">
                        <div className="logo"/>
                    </Link> */}

                </Menu.Item>

                {/*<Menu.Item key="3"><Search*/}
                {/*placeholder="Search"*/}
                {/*onSearch={value => console.log(value)}*/}
                {/*style={{width: 200}}*/}
                {/*/></Menu.Item>*/}

                <div style={{float: 'right', margin: '0px 20px'}}>
                    <Dropdown overlay={userMenu} placement="bottomRight">
                        <Avatar style={{backgroundColor: '#87d068'}} icon="user"/>
                    </Dropdown>
                </div>

            </Menu>
        </Header>
    }
}

export default AppHeader;
