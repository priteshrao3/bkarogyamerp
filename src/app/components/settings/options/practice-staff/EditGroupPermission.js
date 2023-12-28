import React from 'react';
import { SUCCESS_MSG_TYPE } from '../../../../constants/dataKeys';
import { getAPI, interpolate, postAPI, displayMessage } from '../../../../utils/common';
import { GROUP_PERMISSION_REPORT, SINGLE_GROUP_PERMISSION_REPORT, ALL_PERMISSIONS } from '../../../../constants/api';
import { Route } from 'react-router';
import { Redirect } from 'react-router-dom';
import { Form, Card, Checkbox, Row, Input, Icon, Select, Button } from 'antd';
import { REQUIRED_FIELD_MESSAGE } from '../../../../constants/messages';

const { Option } = Select;

export class EditGroupPermission extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editGroup: null,
            allPermissions: [],
            allGlobalPermissions: [],
            categories: [],
            editPermissions: {},
            permissionValue: false,
            permissions: [],
        };
        this.getAllPermissions = this.getAllPermissions.bind(this);
        this.loadEditGroup = this.loadEditGroup.bind(this);
        if (this.props.match.params.id) {
            this.loadEditGroup();
        }
    }

    componentDidMount() {
        this.getAllPermissions();
    }


    onChange = (checkedValues) => {
        this.setState({
            permissions: checkedValues,
        });
    };

    getAllPermissions = () => {
        const that = this;
        const successFn = function(data) {
            that.setState({
                allPermissions: data.practice_permissions,
                allGlobalPermissions: data.global_permissions,
                categories: data.categories,
            });
        };
        const errorFn = function() {
        };
        getAPI(ALL_PERMISSIONS, successFn, errorFn);
    };


    handleSubmit = (e) => {
        e.preventDefault();
        let that = this;
        let { permissions } = this.state;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const apiParam = {
                    ...values,
                    permissions,
                };
                let permissionArrayToSend = permissions.map(perm => {
                    return { codename: perm };
                });
                apiParam.permissions = permissionArrayToSend;
                const successFn = function() {
                    displayMessage(SUCCESS_MSG_TYPE, 'success');
                    that.props.history.push('/erp/settings/clinics-staff#grouppermission');
                };
                const errorFn = function() {

                };
                postAPI(GROUP_PERMISSION_REPORT, apiParam, successFn, errorFn);
            }
        });
    };
    edithandleSubmit = (e) => {
        e.preventDefault();
        let that = this;
        let { permissions } = this.state;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const apiParam = {
                    ...values,
                    id:that.props.match.params.id,
                    permissions,
                };
                let permissionArrayToSend = permissions.map(perm => {
                    return { codename: perm };
                });
                apiParam.permissions = permissionArrayToSend;
                const successFn = function() {
                    displayMessage(SUCCESS_MSG_TYPE, 'success');
                    that.props.history.push('/erp/settings/clinics-staff#grouppermission');
                };
                const errorFn = function() {

                };
                postAPI(GROUP_PERMISSION_REPORT, apiParam, successFn, errorFn);
            }
        });
    };


    permissionFunction = value => {
        this.setState({
            permissionValue: value,
        });
    };

    loadEditGroup() {
        const { id } = this.props.match.params;
        const that = this;
        const successFn = function(data) {
            that.setState({
                editGroup: data[0],
            });
        };
        const errorFn = function() {
            that.setState({});
        };
        getAPI(interpolate(SINGLE_GROUP_PERMISSION_REPORT, [id]), successFn, errorFn);

    }


    render() {
        const that = this;
        const { allPermissions, allGlobalPermissions, editGroup, permissionValue } = this.state;
        if (editGroup) {
            var options2 = editGroup.permissions.map(perm =>
                perm.codename,
            );
        }
        var options = allPermissions.map(option => ({
            label: option.codename, value: option.codename,
        }));
        var options1 = allGlobalPermissions.map(option => ({
            label: option.codename, value: option.codename,
        }));
        const formItemLayout = (this.props.formLayout ? this.props.formLayout : {
            labelCol: { span: 4 },
            wrapperCol: { span: 12 },
        });
        const { getFieldDecorator } = this.props.form;
        return (
            <Row>
                <Card>
                    <Route
                        exact
                        path='/erp/settings/clinics-staff/group/:id/edit'
                        render={(route) => (this.props.match.params.id ? (
                            <div>
                                <h2>Edit Group</h2>
                                <Form onSubmit={this.edithandleSubmit} style={{ margin: 4 }}>
                                    <Form.Item label="Group Name" key="group_name" {...formItemLayout}>
                                        {getFieldDecorator('group_name', {
                                                initialValue: that.state.editGroup ? that.state.editGroup.group_name : '',
                                                rules: [{ message: REQUIRED_FIELD_MESSAGE, required: true }],
                                            },
                                        )(
                                            <Input
                                                // prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                                placeholder="Group Name"
                                            />,
                                        )
                                        }
                                    </Form.Item>
                                    <Form.Item label="Group Description" key="group_description" {...formItemLayout}>
                                        {getFieldDecorator('group_description', {
                                            initialValue: that.state.editGroup ? that.state.editGroup.group_description : '',
                                            rules: [{ message: REQUIRED_FIELD_MESSAGE, required: true }],
                                        })(
                                            <Input.TextArea rows={5}
                                                //     prefix={<Icon type="book" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                                            placeholder="Group Description"
                                            />,
                                        )
                                        }
                                    </Form.Item>
                                    <Form.Item label="Permission Type" key="is_global" {...formItemLayout}>
                                        {getFieldDecorator('is_global', {
                                            initialValue: that.state.editGroup ? that.state.editGroup.is_global : '',
                                            rules: [{ message: REQUIRED_FIELD_MESSAGE, required: true }],
                                        })
                                        (<Select
                                            prefix={<Icon type="book" style={{ color: 'rgba(0,0,0,.25)' }}/>}
                                            placeholder="Permission Type"
                                            onChange={this.permissionFunction}>
                                            <Option value={false}>Practice Setting</Option>
                                            <Option value={true}>Global Setting</Option>
                                        </Select>)
                                        }
                                    </Form.Item>
                                    {editGroup && editGroup.is_global || this.state.permissionValue ?
                                        <Form.Item key="is_glo" {...formItemLayout} style={{ marginLeft: 200 }}>
                                            {getFieldDecorator('is_glo', {
                                                initialValue: that.state.editGroup ? options2 : [],
                                            })(
                                                <diV>
                                                    <h2>Global Setting</h2>
                                                    <Checkbox.Group options={options1} defaultValue={options2}
                                                                    onChange={this.onChange}/>
                                                </diV>,
                                            )}
                                        </Form.Item>
                                        :
                                        <Form.Item key="is_gl" {...formItemLayout} style={{ marginLeft: 200 }}>
                                            {getFieldDecorator('is_gl', {
                                                initialValue: that.state.editGroup ? options2 : [],
                                            })(
                                                <diV>
                                                    <h2>Practice Setting</h2>
                                                    <Checkbox.Group options={options} defaultValue={options2}
                                                                    onChange={this.onChange}/>
                                                </diV>,
                                            )}
                                        </Form.Item>}
                                    <Form.Item {...formItemLayout}>
                                        <Button loading={that.state.loading} type="primary" htmlType="submit"
                                                style={{ marginLeft: 250 }}>
                                            Submit
                                        </Button>
                                        <Button loading={that.state.loading} style={{ margin: 10 }}
                                                onClick={() => that.props.history.goBack()}>
                                            Cancel
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </div>
                        ) : <Redirect to="/erp/settings/clinics-staff"/>)
                        }
                    />
                    <Route
                        exact
                        path='/erp/settings/clinics-staff/addgroup'
                        render={(route) => (
                            <div>
                                <h2>Add Group</h2>
                                <Form onSubmit={this.handleSubmit} style={{ margin: 4 }}>
                                    <Form.Item label="Group Name" key="group_name" {...formItemLayout}>
                                        {getFieldDecorator('group_name', {
                                            rules: [{ message: REQUIRED_FIELD_MESSAGE, required: true }],
                                            required: true,
                                        })(
                                            <Input
                                                //  prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                                placeholder="Group Name"
                                            />,
                                        )
                                        }
                                    </Form.Item>
                                    <Form.Item label="Group Description" key="group_description" {...formItemLayout}>
                                        {getFieldDecorator('group_description', {
                                            rules: [{ message: REQUIRED_FIELD_MESSAGE, required: true }],

                                        })(
                                            <Input.TextArea rows={5}
                                                //    prefix={<Icon type="book" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                                            placeholder="Group Description"
                                            />,
                                        )
                                        }
                                    </Form.Item>
                                    <Form.Item label="Permission Type" key="is_global" {...formItemLayout}>
                                        {getFieldDecorator('is_global', {
                                            //initialValue:
                                            rules: [{ message: REQUIRED_FIELD_MESSAGE, required: true }],
                                        })(
                                            <Select
                                                prefix={<Icon type="book" style={{ color: 'rgba(0,0,0,.25)' }}/>}
                                                placeholder="Permission Type"
                                                onChange={this.permissionFunction}>
                                                <Option value={false}>Practice Setting</Option>
                                                <Option value={true}>Global Setting</Option>
                                            </Select>,
                                        )
                                        }
                                    </Form.Item>
                                    {this.state.permissionValue ?
                                        <Form.Item key="is_glob" {...formItemLayout} style={{ marginLeft: 200 }}>
                                            {getFieldDecorator('is_glob', {
                                                //valuePropName: 'checked',
                                                //initialValue: that.state.timings ? that.state.visting_hour_same_week : false
                                            }, {
                                                rules: [{ message: REQUIRED_FIELD_MESSAGE }],
                                            })(
                                                <diV>
                                                    <h2>Global Setting</h2>
                                                    <Checkbox.Group options={options1} onChange={this.onChange}/>
                                                </diV>,
                                            )}
                                        </Form.Item> :
                                        <Form.Item key="is_globa" {...formItemLayout} style={{ marginLeft: 200 }}>
                                            {getFieldDecorator('is_globa', {
                                                //valuePropName: 'checked',
                                                //initialValue: that.state.timings ? that.state.visting_hour_same_week : false
                                            }, {
                                                rules: [{ message: REQUIRED_FIELD_MESSAGE }],
                                            })(
                                                <diV>
                                                    <h2>Practice Setting</h2>
                                                    <Checkbox.Group options={options} onChange={this.onChange}/>
                                                </diV>,
                                            )}
                                        </Form.Item>
                                    }
                                    <Form.Item {...formItemLayout}>
                                        <Button loading={that.state.loading} type="primary" htmlType="submit"
                                                style={{ margin: 5 ,marginLeft: 250}}>
                                            Submit
                                        </Button>
                                        <Button loading={that.state.loading} style={{ margin: 10 }}
                                                onClick={() => that.props.history.goBack()}>
                                            Cancel
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </div>
                        )}
                    />
                  </Card>
            </Row>
        );
    }
}

export default Form.create()(EditGroupPermission);
