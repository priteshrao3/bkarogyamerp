import React from 'react';
import { Divider, Icon, Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';

const { Sider } = Layout;

class AdvisorSider extends React.Component {
    render() {
        return (
            <Sider
                trigger={null}
                collapsible
                style={{ overflow: 'auto', minHeight: '100vh', background: '#fff' }}
            >
                <Menu mode="inline" defaultSelectedKeys={['1']}>
                    <Menu.ItemGroup
                        key="g1"
                        title={<Divider style={{ margin: '0px' }}>Advisor Panel</Divider>}
                    >

                        {this.props.activePracticePermissions.SettingsAgents ||
                        this.props.allowAllPermissions ? (
                            <Menu.Item key="1">
                                <Link to="/erp/advisors/">
                                    <Icon type="usergroup-add" />
                                    <span className="nav-text">Advisor List</span>
                                </Link>
                            </Menu.Item>
                        ) : null}
                        <Menu.Item key="2">
                            <Link to="/erp/advisors/tnc">
                                <Icon type="safety-certificate" />
                                <span className="nav-text">Terms & Conditions</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="3">
                            <Link to="/erp/advisors/offers">
                                <Icon type="rocket" />
                                <span className="nav-text">Schemes & Offers</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="4">
                            <Link to="/erp/advisors/calldata">
                                <Icon type="phone" />
                                <span className="nav-text">Call Data</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="5">
                            <Link to="/erp/advisors/teamanalysis">
                                <Icon type="usergroup-add" />
                                <span className="nav-text">Team Analysis</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="6">
                            <Link to="/erp/advisors/bankdetails">
                                <Icon type="book" />
                                <span className="nav-text">Bank Details</span>
                            </Link>
                        </Menu.Item>
                    </Menu.ItemGroup>
                </Menu>
            </Sider>
        );
    }
}

export default AdvisorSider;
