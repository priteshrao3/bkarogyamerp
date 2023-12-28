import React from "react";
import {Card, Layout, Tabs} from "antd";
import {Route, Switch} from "react-router-dom";
import Error404 from "../common/errors/Error404";
import BKKidneyCareHome from "./bkKidneyCare/BKKidneyCareHome";
import MissionArogyamWebHome from "./missionArogyam/MIssionArogyamWebHome";

const {Content} = Layout;


export default class WebAdminHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTab: "/web"
        }
    }
    componentDidMount() {
        const that = this
        this.setState({
            currentTab:that.props.match.path
        })
    }

    changeTab = (option) => {
        const that = this
        this.setState({
            currentTab: option
        }, function () {
            that.props.history.push(option);
        })
    }

    render() {
        const {currentTab} = this.state;
        return (
            <div style={{
                margin: '24px 16px',
                // padding: 24,
                minHeight: 280,
                // marginLeft: '200px'
            }}>

                    <Tabs onChange={this.changeTab} size={"large"} type="card" activeKey={currentTab}>
                        <Tabs.TabPane tab={"BK Arogyam"} key={"/web"}/>
                        <Tabs.TabPane tab={"Mission Arogyam"} key={"/mission"}/>
                    </Tabs>
                <Switch>
                    <Route path="/web" render={(route) => <BKKidneyCareHome/>}/>
                    <Route path="/mission" render={(route) => <MissionArogyamWebHome/>}/>

                    <Route component={Error404}/>
                </Switch>
            </div>

        )
    }
}
