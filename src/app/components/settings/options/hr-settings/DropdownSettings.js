import React from "react";
import {Card, Spin, Tabs} from "antd";
import {DROPDOWN_SETTINGS_TABS} from '../../../../constants/hardData';
import SettingTabPane from "./SettingTabPane";
import {displayMessage, getAPI} from "../../../../utils/common";
import {ERROR_MSG_TYPE} from "../../../../constants/dataKeys";
import {HR_SETTINGS, HR_SETTINGS_DROPDOWN_LIST} from "../../../../constants/api";

const {TabPane} = Tabs;
export default class DropdownSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTab: null,
            dropdownList: [],
            listLoading: false
        }
    }

    componentDidMount() {
        this.loadDropdownSettingsList();
    }

    loadDropdownSettingsList = () => {
        const that = this;
        that.setState({
            listLoading: true,
        });
        const successFn = function (data) {
            that.setState({
                listLoading: false,
                dropdownList: data,
                currentTab: data[0]
            });
        }
        const errorFn = function () {
            that.setState({
                listLoading: false,
            });
            displayMessage(ERROR_MSG_TYPE, "HR Settings loading failed!!");
        }
        getAPI(HR_SETTINGS_DROPDOWN_LIST, successFn, errorFn);
    }

    changeTab = (value) => {
        this.setState({
            currentTab: value
        })
    }

    render() {
        const {currentTab, listLoading, dropdownList} = this.state;
        return (
            <div>
                <h2>HR Settings</h2>
                <Card>
                    <Spin spinning={listLoading}>
                        <Tabs onChange={this.changeTab}>

                            {dropdownList.map(item => (
                                <TabPane key={item} tab={item}>
                                    {item === currentTab ?
                                        <SettingTabPane key={item} item={{label: item, api: HR_SETTINGS}} /> : null}
                                </TabPane>
                            ))}
                        </Tabs>
                    </Spin>
                </Card>
            </div>
        )
    }
}
