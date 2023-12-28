import React from 'react';
import { Divider, Icon, Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import Hotkeys from 'react-hot-keys';
import Applogo from '../../assets/img/kidneycarelogo.png';
import { OUTER_KEYS_HOTKEYS } from '../../constants/hardData';

const { Sider } = Layout;
const { SubMenu } = Menu;
const MenuItemGroup = Menu.ItemGroup;

class AppSider extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            openKeys: [],
        };
        this.onHotKeyDown = this.onHotKeyDown.bind(this);
    }

    onOpenChange = (openKeys) => {
        const rootSubmenuKeys = ['sub1', 'sub2'];
        const latestOpenKey = openKeys.find(key => this.state.openKeys.indexOf(key) === -1);
        if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
            this.setState({ openKeys });
        } else {
            this.setState({
                openKeys: latestOpenKey ? [latestOpenKey] : [],
            });
        }
    };

    onHotKeyDown(keyNm) {
        console.log(keyNm);
        const that = this;
        switch (keyNm) {
            case 'alt+c':
                that.props.history.push('/erp/calendar');
                break;
            case 'alt+p':
                that.props.history.push('/erp/patients/profile');
                break;
            case 'alt+r':
                that.props.history.push('/erp/reports/appointments');
                break;
            case 'alt+s':
                that.props.history.push('/erp/settings/clinics');
                break;
            case 'alt+b':
                that.props.history.push('/erp/inventory');
                break;
            case 'alt+w':
                that.props.history.push('/erp/web/videos');
                break;
        }
    }


    render() {
        const that = this;
        return (
            <Hotkeys keyName={OUTER_KEYS_HOTKEYS} onKeyDown={(value) => this.onHotKeyDown(value)}>
                <Sider
                    className={this.props.collapsed ? 'home-sider' : ''}
                    // style={{background: '#fff'}}
                    trigger={null}
                    collapsible
                    collapsed={this.props.collapsed}
                    style={{ zIndex: 1 }}
                    breakpoint="xxl"
                    // collapsedWidth="0"
                    onBreakpoint={(broken) => {
                        // console.log(broken);
                        that.props.toggleSider(broken);
                    }}
                    onCollapse={(collapsed, type) => {
                        // console.log(collapsed, type);
                    }}
                >
                    <img src={Applogo} alt="" style={{ width: '100%', padding: '20px' }}/>

                    <Menu
                        mode="inline"
                        defaultSelectedKeys={['1']}
                        openKeys={this.state.openKeys}
                        onOpenChange={this.onOpenChange}
                        theme="dark"
                    >
                        {this.props.activePracticePermissions.ViewCalendar ? (
                            <Menu.Item key="1">
                                <Link to="/erp/calendar">
                                    <Icon type="schedule"/>
                                    <span className="nav-text"><span
                                        className="shortcutLetterHighlight"
                                    >C
                                                               </span>alendar
                                    </span>
                                </Link>
                            </Menu.Item>
                        ) : null}
                        <Menu.Item key="26">
                            <Link
                                to={this.props.currentPatient ? `/erp/patient/${this.props.currentPatient.id}/profile` : '/erp/patients/profile'}
                            >
                                <Icon type="user"/>
                                <span className="nav-text"><span
                                    className="shortcutLetterHighlight"
                                >P
                                                           </span>atients
                                </span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="27">
                            <Link to="/erp/reports/appointments">
                                <Icon type="bar-chart"/>
                                <span className="nav-text"><span
                                    className="shortcutLetterHighlight">R</span>eports</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="5">
                            <Link to="/erp/settings/clinics">
                                <Icon type="setting"/>
                                <span className="nav-text"><span
                                    className="shortcutLetterHighlight"
                                >S
                                                           </span>ettings
                                </span>
                            </Link>
                        </Menu.Item>
                        <SubMenu
                            key="sub1"
                            title={<span><Icon type="gold"/><span><span className="shortcutLetterHighlight">B</span>ack Office</span></span>}
                        >
                            <Menu.Item key="6">
                                <Link to="/erp/inventory/expenses">
                                    <Icon type="credit-card"/>
                                    <span className="nav-text">Expenses</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="7">
                                <Link to="/inventory/activity">
                                    <Icon type="bell"/>
                                    <span className="nav-text">Activities</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="8">
                                <Link to="/erp/inventory/manufacture">
                                    <Icon type="database"/>
                                    <span className="nav-text">Manufacturers</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="42">
                                <Link to="/erp/inventory/vendor">
                                    <Icon type="database"/>
                                    <span className="nav-text">Vendor</span>
                                </Link>
                            </Menu.Item>
                            {/* <Menu.Item key="9"> */}
                            {/*    <Link to="/inventory/lab"> */}
                            {/*        <Icon type="experiment" /> */}
                            {/*        <span className="nav-text">Labs</span> */}
                            {/*    </Link> */}
                            {/* </Menu.Item> */}
                            <Menu.Item key="10">
                                <Link to="/erp/inventory">
                                    <Icon type="gold"/>
                                    <span className="nav-text">Inventory</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item>
                                <Link to="/erp/inventory/permission">
                                    <Icon type="database"/>
                                    <span className="nav-text">User Permission</span>
                                </Link>
                            </Menu.Item>
                        </SubMenu>

                        {this.props.activePracticePermissions.WebAdmin ? (
                                <Menu.Item key="web-1">
                                    <Link to="/erp/web/videos">
                                        <Icon type="google"/>
                                        <span className="nav-text"><span className="shortcutLetterHighlight">W</span>eb Admin</span>
                                    </Link>
                                </Menu.Item>
                            )
                            : null}
                        <Menu.Item key="11">
                            <Link to="/erp/meeting-booking">
                                <Icon type="reconciliation"/>
                                <span className="nav-text">Meeting Booking</span>
                            </Link>
                        </Menu.Item>
                        {this.props.activePracticePermissions.SettingsAgents ? (
                                <Menu.Item key="adv-1">
                                    <Link to="/erp/advisors/">
                                        <Icon type="apartment"/>
                                        <span className="nav-text">Advisors</span>
                                    </Link>
                                </Menu.Item>
                            )
                            : null}
                        <Menu.Item key="13">
                            <Link to="/erp/tasktracker/mytask">
                                <Icon type="check-circle"/>
                                <span className="nav-text">Task Tracker</span>
                            </Link>
                        </Menu.Item>

                        <Menu.Item key="12">
                            <Link to="/erp/conversion">
                                <Icon type="swap"/>
                                <span className="nav-text">Allopath to Ayurveda</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="help">
                            <a href={process.env.REACT_APP_CONFLEUNCE_DOC} target="__blank">
                        <span><Icon
                            type="question-circle"
                        /><span>Help</span>
                        </span>
                            </a>
                        </Menu.Item>
                        <Menu.Item key={'suggestion'}>
                            <a onClick={that.props.showDrawer}>
                                <Icon type={'mail'}/>
                                <span>Suggestion</span>
                            </a>
                        </Menu.Item>
                    </Menu>
                </Sider>
            </Hotkeys>
        );
    }
}

export default AppSider;
