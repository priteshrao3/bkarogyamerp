import React from "react";
import {AutoComplete, Avatar, Button, Dropdown, Icon, Layout, List, Menu, Select, Tag, Modal, Input} from "antd";
import {Link} from 'react-router-dom';
import {
    displayMessage,
    getAPI,
    interpolate,
    makeFileURL,
    postOuterAPI, startLoadingMessage, stopLoadingMessage
} from "../../utils/common";
import {CREDENTIALS, SAVE_CREDENTIALS, SEARCH_PATIENT} from "../../constants/api";
import {hideMobile} from "../../utils/permissionUtils";
import {logInUserWithPhoneNum, loggedInUser, logInSwitchedUserWithPhoneNum} from "../../utils/auth";
import {ERROR_MSG_TYPE, SUCCESS_MSG_TYPE} from "../../constants/dataKeys";
import {CUSTOM_STRING_SEPERATOR} from "../../constants/hardData";

const {Header} = Layout;

class AppHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            patientListData: [],
            showSwitchUserModal: false,
            phoneNum: 0
        }
    }


    searchPatient = (value) => {
        const that = this;
        this.setState(function (prevState) {
            return {
                searchPatientString: value
            }
        });
        const successFn = function (data) {
            that.setState(function (prevState) {
                if (prevState.searchPatientString == value)
                    return {
                        patientListData: [...data.results],
                    }
                return {}
            })
        };
        const errorFn = function (data) {
            that.setState({
                searchPatientString: null,
            })
        };
        if (value) {
            getAPI(interpolate(SEARCH_PATIENT, [value]), successFn, errorFn);
        }

    };

    setUserCredentials(email, password) {
        const msg = startLoadingMessage("Waiting for authentication from server...");
        sessionStorage.removeItem('token');
        const reqData = {
            email,
            password
        };
        const successFn = function (data) {
            if (data.success) {
                stopLoadingMessage(msg, SUCCESS_MSG_TYPE, " Authentication Successfully!!");
                sessionStorage.setItem("token", data.token);
            }
            if (sessionStorage.getItem('token')) {
                window.open('/erp/task/');
            } else {
                stopLoadingMessage(msg, ERROR_MSG_TYPE, "Authentication failed. User not found.");
            }

        };
        const errorFn = function () {

        };
        if (sessionStorage.getItem('token') == null) {
            postOuterAPI(CREDENTIALS, reqData, successFn, errorFn);
        }

    };

    switchPortal = () => {
        const that = this;
        const successFn = function (data) {
            if (data) {
                that.setUserCredentials(data.login, data.password);
            }

        };
        const errorFn = function () {
            displayMessage(ERROR_MSG_TYPE, "Something went wrong.");
        };

        getAPI(interpolate(SAVE_CREDENTIALS, [that.props.user.id]), successFn, errorFn);
    };


    handlePatientSelect = (event) => {
        if (event) {
            this.props.history.push(`/erp/patient/${event.replace(CUSTOM_STRING_SEPERATOR, '')}/profile`);
            this.setState({
                searchPatientString: null,
            });
        }
    }

    handleSwitchUser = () => {
        return (
            this.setState({
                ...this.state,
                showSwitchUserModal: true
            })
        )
    }

    handleSwitchUserMobileChange = e => {
        this.setState({
            ...this.state,
            phoneNum: e.target.value
        })
        console.log(this.state.phoneNum)
    }

    handleSwitchUserSubmit = () => {
        const phone_num = this.state.phoneNum
        console.log(phone_num)
        const that = this;
        const successFn = function () {
            const user = loggedInUser(true);
            that.setState({
                user,
            });
            window.location.reload(false)
        };
        const errorFn = function () {

        };
        logInSwitchedUserWithPhoneNum(phone_num, successFn, errorFn)
    }

    handleSwitchUserCancel = () => {
        this.setState({
            ...this.state,
            showSwitchUserModal: false
        })
    }

    render() {
        const that = this;
        const userMenu = (
            <Menu>
                <Menu.Item key="profile">
                    <Link to="/erp/profile">Profile</Link>
                </Menu.Item>
                <Menu.Divider/>
                {this.props.user.is_superuser?
                <Menu.Item key="switchUser">
                    <a onClick={this.handleSwitchUser}>Switch User</a>
                </Menu.Item>
               :null}
                <Menu.Divider/>
                <Menu.Item key="logout">
                    <a onClick={this.props.logout}>Log out</a>
                </Menu.Item>
            </Menu>
        );
        return (
            <Header style={{background: '#fff', padding: 0, boxShadow: '0 2px 4px 0 rgba(38,50,69,.2)', zIndex: 1}}>
                <div style={{float: 'left', margin: '0px 20px'}}>
                    <Icon
                        className="trigger"
                        type={this.props.collapsed ? 'menu-unfold' : 'menu-fold'}
                        onClick={() => this.props.toggleSider(!this.props.collapsed)}
                    />
                </div>
                <Modal
                    title="Enter Mobile Number"
                    visible={this.state.showSwitchUserModal}
                    onOk={this.handleSwitchUserSubmit}
                    onCancel={this.handleSwitchUserCancel}
                >
                    <Input
                        size="large"
                        prefix={<Icon type="phone" style={{color: 'rgba(0,0,0,.25)'}}/>}
                        placeholder="Mobile Number"
                        onChange={this.handleSwitchUserMobileChange}
                    />
                </Modal>
                <Menu
                    mode="horizontal"
                    style={{lineHeight: '64px'}}
                >
                    <Menu.Item key="5">
                        <AutoComplete
                            placeholder="Patient Name"
                            showSearch
                            dropdownMatchSelectWidth={false}
                            dropdownStyle={{width: 400}}
                            onSearch={this.searchPatient}
                            defaultActiveFirstOption={false}
                            showArrow={false}
                            value={this.state.searchPatientString}
                            filterOption={false}
                            onSelect={this.handlePatientSelect}
                        >
                            {this.state.patientListData.map((option) => (
                                <AutoComplete.Option
                                    value={option.id.toString() + CUSTOM_STRING_SEPERATOR}
                                >
                                    <List.Item style={{padding: 0}}>
                                        <List.Item.Meta
                                            avatar={(option.image ? <Avatar src={makeFileURL(option.image)}/> : (
                                                <Avatar style={{backgroundColor: '#87d068'}}>
                                                    {option.user.first_name ? option.user.first_name.charAt(0) :
                                                        <Icon type="user"/>}
                                                </Avatar>
                                            ))}
                                            title={option.user.first_name}
                                            description={that.props.activePracticePermissions.PatientPhoneNumber ? option.user.mobile : hideMobile(option.user.mobile)}
                                        />
                                        <div>{option.custom_id ? option.custom_id : option.user.id}</div>
                                    </List.Item>
                                </AutoComplete.Option>
                            ))}
                        </AutoComplete>
                    </Menu.Item>
                    <Menu.Item key="4">
                        <Button.Group>
                            {that.props.activePracticePermissions.AddPatient || that.props.allowAllPermissions ? (
                                <Link to="/erp/patients/profile/add">
                                    <Button type="primary">
                                        <Icon type="plus"/>Add Patient
                                    </Button>
                                </Link>
                            ) : null}
                            {that.props.activePracticePermissions.MergePatients || that.props.allowAllPermissions ? (
                                <Link to="/erp/patients/merge">
                                    <Button type="primary">
                                        <Icon type="user-add"/>Merge Patients
                                    </Button>
                                </Link>
                            ) : null}
                        </Button.Group>
                    </Menu.Item>
                    <Menu.Item key="3">
                        <Select
                            onChange={this.props.switchPractice}
                            defaultValue={this.props.active_practiceId}
                            value={this.props.active_practiceId}
                            style={{width: '300px', maxWidth: '70vw'}}
                            optionFilterProp="children"
                            showSearch
                        >
                            {this.props.practiceList && this.props.practiceList.map((option) => (
                                <Select.Option
                                    key={option.practice.id}
                                    value={option.practice.id}
                                >{option.practice.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Menu.Item>
                    {/* <Menu.Item key="3"><Search */}
                    {/* placeholder="Search" */}
                    {/* onSearch={value => console.log(value)} */}
                    {/* style={{width: 200}} */}
                    {/* /></Menu.Item> */}

                    <div style={{float: 'right', margin: '0px 20px'}}>
                        {this.props.user && this.props.user.is_superuser ? <Tag color="red">SuperUser</Tag> : null}
                        <Dropdown overlay={userMenu} placement="bottomRight">
                    <span>
                        <Avatar style={{backgroundColor: '#87d068', marginRight: 5}} icon="user"/>
                        {this.props.user && this.props.user.first_name ?
                            <Tag>{(this.props.user.first_name.split(' '))[0]}</Tag> : null}
                    </span>
                        </Dropdown>
                    </div>

                </Menu>
            </Header>

        )
    }
}

export default AppHeader;
