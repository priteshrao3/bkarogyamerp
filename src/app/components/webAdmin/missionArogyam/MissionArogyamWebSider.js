import React from "react";
import {Divider, Icon, Menu, Layout} from "antd";
import {Link} from "react-router-dom";

const {Sider} = Layout;
export default class MissionArogyamWebSider extends React.Component {
    render() {
        return (
            <Sider
                trigger={null}
                collapsible
                style={{overflow: 'auto', minHeight: '100vh', background: '#fff'}}
            >
                <Menu mode="inline" defaultSelectedKeys={['web-1']}>
                    <Menu.ItemGroup key="g1" title={<Divider style={{margin: '0px'}}>Web Settings</Divider>}>
                        <Menu.Item key="translations">
                            <Link to="/mission/translations">
                                <Icon type="message" />
                                <span className="nav-text">Translations</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="web-1">
                            <Link to="/mission/videos">
                                <Icon type="youtube" />
                                <span className="nav-text">Videos</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="web-2">
                            <Link to="/mission/disease">
                                <Icon type="bell" />
                                <span className="nav-text">Disease</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="web-3">
                            <Link to="/mission/blog">
                                <Icon type="pic-right" />
                                <span className="nav-text">Blogs</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="web-4">
                            <Link to="/mission/event">
                                <Icon type="notification" />
                                <span className="nav-text">Events</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="web-5">
                            <Link to="/mission/contact">
                                <Icon type="phone" />
                                <span className="nav-text">Contacts</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="web-6">
                            <Link to="/mission/pageseo">
                                <Icon type="search" />
                                <span className="nav-text">Page SEO</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="web-7">
                            <Link to="/mission/slider-image">
                                <Icon type="picture" />
                                <span className="nav-text">Slider Image</span>
                            </Link>
                        </Menu.Item>
                    {/*    <Menu.Item key="web-8">*/}
                    {/*        <Link to="/mission/facilities">*/}
                    {/*            <Icon type="gift" />*/}
                    {/*            <span className="nav-text">Facilities</span>*/}
                    {/*        </Link>*/}
                    {/*    </Menu.Item>*/}
                    {/*    <Menu.Item key="web-9">*/}
                    {/*        <Link to="/mission/landingpagevideo">*/}
                    {/*            <Icon type="video-camera" />*/}
                    {/*            <span className="nav-text">Landing Page Videos</span>*/}
                    {/*        </Link>*/}
                    {/*    </Menu.Item>*/}
                    {/*    <Menu.Item key="web-10">*/}
                    {/*        <Link to="/mission/landingpagecontent">*/}
                    {/*            <Icon type="read" />*/}
                    {/*            <span className="nav-text">Landing Page Content</span>*/}
                    {/*        </Link>*/}
                    {/*    </Menu.Item>*/}
                    {/*    <Menu.Item key="web-11">*/}
                    {/*        <Link to="/mission/manageproduct">*/}
                    {/*            <Icon type="hdd" />*/}
                    {/*            <span className="nav-text">Manage Product</span>*/}
                    {/*        </Link>*/}
                    {/*    </Menu.Item>*/}
                    {/*    <Menu.Item key="web-12">*/}
                    {/*        <Link to="/mission/managetherapy">*/}
                    {/*            <Icon type="box-plot" />*/}
                    {/*            <span className="nav-text">Manage Therapy</span>*/}
                    {/*        </Link>*/}
                    {/*    </Menu.Item>*/}
                    </Menu.ItemGroup>
                </Menu>
            </Sider>
        )
    }
}
