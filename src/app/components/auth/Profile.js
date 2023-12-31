import {Card, Col, Form, List, Row, Divider,Layout} from "antd";
import React from "react";
import ChangePasswordForm from "./forms/ChangePasswordForm";

import {getAPI, interpolate} from "../../utils/common";
import {USER_DATA} from "../../constants/api";

const {Content} = Layout;
export default class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        console.log(this.state);
    }

    loadProfile() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                userProfile: data,
                loading: false
            });
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        getAPI(USER_DATA, successFn, errorFn);
    }

    render() {
        const that = this;
        const ChangePasswordLayout = Form.create()(ChangePasswordForm);
        return (
<Content
  className="main-container"
  style={{
            margin: '24px 16px',
            // padding: 24,
            minHeight: 280,
            // marginLeft: '200px'
        }}
>
            <Row>
                <Col span={12}>
                    <Card title="Change Password">
                        <ChangePasswordLayout />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="My Permissions">
                        <List
                          size="small"
                          dataSource={that.props.activePracticeData ? that.props.activePracticeData.permissions_data : []}
                          renderItem={item => <List.Item>{item.name}</List.Item>}
                        />
                    </Card>
                </Col>
                <Divider />
                <Col span={12}>
                    <Card title="My Profile">
                        <Row gutter={16}>
                            <Col span={6}>
                                <UsersRow label="Name " value={this.props.user.first_name} />
                                <UsersRow label="Email Id " value={this.props.user.email} />
                                <UsersRow label="Contact No." value={this.props.user.mobile} />
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
</Content>
)
    }
}

function UsersRow(props) {
    return (
<Row gutter={16} style={{marginBottom: '5px'}}>
        <Col span={12} style={{textAlign: 'right'}}>{props.label}:</Col>
        <Col span={12}><strong>{props.value}</strong></Col>
</Row>
)
}
