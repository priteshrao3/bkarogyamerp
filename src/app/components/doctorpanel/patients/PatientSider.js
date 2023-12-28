import React from "react";
import {Button, Divider, Drawer, Icon, Layout, Menu} from "antd";
import {Link} from "react-router-dom";

const {Header, Content} = Layout;
const Sider = Layout.Sider;

class PatientSider extends React.Component {
    state = {
        collapsed: false,
        showDrawer: false
    };

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };
    toggleDrawer = (value) => {
        this.setState({
            showDrawer: !!value
        })
    }

    render() {
        return <>
            <Sider trigger={null}
                   collapsible
                   breakpoint="sm"

                   style={{overflow: 'auto', minHeight: 'calc(100vh - 64px)', background: '#fff'}}>
                {/* <div className="logo"/> */}

                <Menu mode="inline">
                    {/*</SubMenu>*/}
                    <Menu.ItemGroup key="g3">
                        <Menu.Item key="agent-0">
                            <Link
                                to={"/"}>
                                <Icon type="home"/>
                                <span className="nav-text">Dashboard</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="agent-1">
                            <Link
                                to={"/me"}>
                                <Icon type="user"/>
                                <span className="nav-text">Profile</span>
                            </Link>
                        </Menu.Item>

                        <Menu.Item key="agent-2">
                            <Link to="/agents/">
                                <Icon type="usergroup-add"/>
                                <span className="nav-text">My Advisor</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="agent-5">
                            <Link to="/patient/">
                                <Icon type="robot"/>
                                <span className="nav-text">My Patient</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="agent-3">
                            <Link
                                to={"/mytree"}>
                                <Icon type="deployment-unit"/>
                                <span className="nav-text">My Advisor Tree</span>
                            </Link>
                        </Menu.Item>


                        <Menu.Item key="agent-4">
                            <Link
                                to={"/billing/wallet"}>
                                <Icon type="wallet"/>
                                <span className="nav-text">Wallet Ledger</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="20">
                            <Link to="/integration">
                                <Icon type="link"/>
                                <span className="nav-text">My Integrations</span>
                            </Link>
                        </Menu.Item>
                    </Menu.ItemGroup>
                </Menu>
            </Sider>
            <div className={"responsive-drawer-menu"}>
                <Button icon={"menu"} size="large" style={{position: 'fixed', left: 0, top: 200, zIndex: 999}}
                        onClick={() => this.toggleDrawer(!this.state.showDrawer)}/>
                <Drawer visible={this.state.showDrawer} width={200} placement={"left"} bodyStyle={{padding: 0}}
                        onClose={() => this.toggleDrawer(false)} closable={false}>

                    <Menu mode="inline" onSelect={() => this.toggleDrawer(false)}>
                        {/*</SubMenu>*/}
                        <Menu.ItemGroup key="g3">
                            <Menu.Item key="agent-0">
                                <Link
                                    to={"/"}>
                                    <Icon type="home"/>
                                    <span className="nav-text">Dashboard</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="agent-1">
                                <Link
                                    to={"/me"}>
                                    <Icon type="user"/>
                                    <span className="nav-text">Profile</span>
                                </Link>
                            </Menu.Item>

                            <Menu.Item key="agent-2">
                                <Link to="/agents/">
                                    <Icon type="usergroup-add"/>
                                    <span className="nav-text">My Advisor</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="agent-5">
                                <Link to="/patient/">
                                    <Icon type="robot"/>
                                    <span className="nav-text">My Patient</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="agent-3">
                                <Link
                                    to={"/mytree"}>
                                    <Icon type="deployment-unit"/>
                                    <span className="nav-text">My Advisor Tree</span>
                                </Link>
                            </Menu.Item>


                            <Menu.Item key="agent-4">
                                <Link
                                    to={"/billing/wallet"}>
                                    <Icon type="wallet"/>
                                    <span className="nav-text">Wallet Ledger</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="20">
                                <Link to="/integration">
                                    <Icon type="link"/>
                                    <span className="nav-text">My Integrations</span>
                                </Link>
                            </Menu.Item>
                        </Menu.ItemGroup>
                    </Menu>
                </Drawer>
            </div>
        </>

    }
}

export default PatientSider;
