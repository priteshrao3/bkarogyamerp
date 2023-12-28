import React from "react";
import {
    AutoComplete,
    Avatar,
    Button,
    Card,
    Icon,
    Form,
    Input,
    Upload,
    List,
    Select,
    Spin, message,
} from 'antd';
import {REQUIRED_FIELD_MESSAGE} from "../../../constants/messages";
import {SUCCESS_MSG_TYPE} from "../../../constants/dataKeys";
import {
    PATIENTS_LIST,
    SEARCH_PATIENT,
    PATIENT_PROFILE, AGENT_ROLES, FILE_UPLOAD_API,
} from "../../../constants/api"
import {displayMessage, getAPI, interpolate, makeFileURL, makeURL, postAPI, putAPI} from "../../../utils/common";
import {hideMobile} from "../../../utils/permissionUtils";

const FormItem = Form.Item;
const {Meta} = Card;

class AddOrEditAgent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            saving: false,
            userListData: [],
            agentRoles: [],


        }
        this.changeRedirect = this.changeRedirect.bind(this);
        this.getPatient = this.getPatient.bind(this);
        this.searchPatient = this.searchPatient.bind(this);
        this.loadAgentRoles = this.loadAgentRoles.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this.getPatient();
        this.loadAgentRoles();
    }


    getPatient() {
        const that = this;

        const successFn = function (data) {
            that.setState({
                userListData: data.results,
            })
        };
        const errorFn = function () {

        };
        getAPI(PATIENTS_LIST, successFn, errorFn);
    }

    loadAgentRoles() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                agentRoles: data,
                loading: false
            })
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        getAPI(AGENT_ROLES, successFn, errorFn);

    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    searchPatient(value) {
        const that = this;
        const successFn = function (data) {
            if (data) {
                that.setState({
                    userListData: data.results
                })

            }
        };
        const errorFn = function () {
        };
        if (value){
            getAPI(interpolate(SEARCH_PATIENT, [value]), successFn, errorFn);
        }

    }

    handleSubmit = (e) => {
        const that = this;
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                that.setState({
                    saving: true
                });

                const reqData = {
                    user: {},

                    role: values.role,
                    is_agent: true,
                    aadhar_upload: values.aadhar_upload && values.aadhar_upload.file && values.aadhar_upload.file.response ? values.aadhar_upload.file.response.image_path : values.aadhar_upload,
                    is_approved: true,
                    practice: this.props.active_practiceId
                };
                // if (this.props.editAgentData || !reqData.referal) {
                //     delete reqData.referal;
                // }
                if (!this.state.userDetails) {
                    reqData.user.first_name = values.first_name;
                    reqData.user.email = values.email;
                    reqData.user.mobile = values.mobile;
                } else {
                    reqData.user = this.state.userDetails.user;
                }
                if (values.referal){
                    reqData.referal= values.referal
                }
                const successFn = function (data) {
                    that.setState({
                        saving: false
                    });
                    if (that.props.loadData){
                        that.props.loadData();
                    }

                    if (that.props.history){
                        that.props.history.replace("/erp/advisors");
                    }
                    if (data) {
                        displayMessage(SUCCESS_MSG_TYPE, "Agent Created Successfully");
                    }
                };
                const errorFn = function () {
                    that.setState({
                        saving: false
                    });
                };

                if (this.state.userDetails) {
                    putAPI(interpolate(PATIENT_PROFILE, [this.state.userDetails.id]), reqData, successFn, errorFn);
                } else if (this.props.editAgentData) {
                    putAPI(interpolate(PATIENT_PROFILE, [this.props.editAgentData.id]), reqData, successFn, errorFn);
                } else {
                    postAPI(interpolate(PATIENTS_LIST, [this.props.active_practiceId]), reqData, successFn, errorFn);
                }
            }
        });

    }

    handlePatientSelect = (event) => {
        if (event) {
            const that = this;
            const successFn = function (data) {
                that.setState({
                    userDetails: data
                });
            };
            const errorFn = function () {
            };
            getAPI(interpolate(PATIENT_PROFILE, [event]), successFn, errorFn);
        }
    }

    handleClick = (e) => {

        this.setState({
            userDetails: null
        })

    }


    render() {
        const that = this;
        const formItemLayout = (this.props.formLayout ? this.props.formLayout : {
            labelCol: {span: 6},
            wrapperCol: {span: 14},
        });
        const formPatients = (this.props.formLayout ? this.props.formLayout : {
            wrapperCol: {offset: 6, span: 14},
        });
        const {getFieldDecorator} = this.props.form;
        const singleUploadprops = {
            name: 'image',
            data: {
                name: 'hello'
            },
            action: makeURL(FILE_UPLOAD_API),
            headers: {
                authorization: 'authorization-text',
            },
            onChange(info) {
                if (info.file.status !== 'uploading') {
                    console.log(info.file, info.fileList);
                }
                if (info.file.status === 'done') {
                    message.success(`${info.file.name} file uploaded successfully`);
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`);
                }
            },
        };
        return (
<Card>
            <Spin spinning={this.state.saving}>
                <Form onSubmit={this.handleSubmit}>
                    {this.props.title ? <h2>{this.props.title}</h2> : null}

                    {that.state.userDetails ? (
                        <FormItem key="id" value={this.state.userDetails.id} {...formPatients}>
                            <Card bordered={false} style={{background: '#ECECEC'}}>
                                <Meta
                                  avatar={(this.state.userDetails.image ? <Avatar src={makeFileURL(this.state.userDetails.image)} /> : (
                                        <Avatar style={{backgroundColor: '#87d068'}}>
                                            {this.state.userDetails.user.first_name ? this.state.userDetails.user.first_name.charAt(0) :
                                                <Icon type="user" />}
                                        </Avatar>
                                      ))}
                                  title={this.state.userDetails.user.first_name}
                                  description={(
                                        <span>{that.props.activePracticePermissions.PatientPhoneNumber ? this.state.userDetails.user.mobile : hideMobile(this.state.userDetails.user.mobile)}<br />
                                    <Button type="primary" style={{float: 'right'}} onClick={this.handleClick}>Select Different</Button>
                                        </span>
                                      )}
                                />


                            </Card>
                        </FormItem>
                      )
                        : (
<div>
                            <FormItem key="name" label="Advisor Name" {...formItemLayout}>
                                {getFieldDecorator("first_name", {
                                    initialValue: that.props.editAgentData ? that.props.editAgentData.user.first_name : ''
                                })(
                                    <AutoComplete
                                      placeholder="Advisor Name"
                                      showSearch
                                      disabled={!!that.props.editAgentData}
                                      onSearch={this.searchPatient}
                                      defaultActiveFirstOption={false}
                                      showArrow={false}
                                      filterOption={false}
                                      onSelect={this.handlePatientSelect}
                                    >
                                        {this.state.userListData.map((option) => (
<AutoComplete.Option
  value={option.id.toString()}
>
                                            <List.Item style={{padding: 0}}>
                                                <List.Item.Meta
                                                  avatar={(option.image ? <Avatar src={makeFileURL(option.image)} /> : (
                                                        <Avatar style={{backgroundColor: '#87d068'}}>
                                                            {option.user.first_name ? option.user.first_name.charAt(0) :
                                                                <Icon type="user" />}
                                                        </Avatar>
                                                      ))}
                                                  title={`${option.user.first_name  } (ID:${  option.custom_id?option.custom_id:option.user.id  })`}
                                                  description={that.props.activePracticePermissions.PatientPhoneNumber ? option.user.mobile : hideMobile(option.user.mobile)}

                                                />
                                            </List.Item>
</AutoComplete.Option>
))}
                                    </AutoComplete>
                                )}
                            </FormItem>
                            <FormItem key="mobile" label="Mobile Number" {...formItemLayout}>
                                {getFieldDecorator("mobile", {
                                    initialValue: that.props.editAgentData ? that.props.editAgentData.user.mobile : null,
                                    rules: [{required: true, message: REQUIRED_FIELD_MESSAGE}],
                                })(
                                    <Input placeholder="Mobile Number" disabled={!!that.props.editAgentData} />
                                )}
                            </FormItem>
                            <FormItem key="email" label="Email Address" {...formItemLayout}>
                                {getFieldDecorator("email", {
                                    initialValue: that.props.editAgentData ? that.props.editAgentData.user.email : null,
                                    rules: [{type: 'email', message: 'The input is not valid E-mail!'},
                                        {required: true, message: REQUIRED_FIELD_MESSAGE}],
                                })(
                                    <Input placeholder="Email Address" disabled={!!that.props.editAgentData} />
                                )}
                            </FormItem>
                            {this.state.editAgentData ? null : (
                                <FormItem key="referal" label="Referer Code" {...formItemLayout}>
                                    {getFieldDecorator("referal", {
                                        initialValue: that.props.editAgentData && that.props.editAgentData.user.referer_data.referer ? that.props.editAgentData.user.referer_data.referer.referer_code : '',

                                    })(
                                        <Input placeholder="Referer Code" />
                                    )}
                                </FormItem>
                              )}

</div>
)}

                    <FormItem key="role" {...formItemLayout} label="Role Type">
                        {getFieldDecorator("role", {initialValue: that.props.editAgentData && that.props.editAgentData.role ? that.props.editAgentData.role : null}, {
                            rules: [{required: true, message: REQUIRED_FIELD_MESSAGE}],
                        })(
                            <Select>
                                {this.state.agentRoles.map((option) => (
<Select.Option
  value={option.id}
>{option.name}
</Select.Option>
))}
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="Document Upload" {...formItemLayout}>
                        {getFieldDecorator("aadhar_upload",{initialValue: that.props.editAgentData && that.props.editAgentData.aadhar_upload ? that.props.editAgentData.aadhar_upload : null,
                            rules: [{required: true, message: REQUIRED_FIELD_MESSAGE}],
                            valuePropName: "aadhar_upload",
                        })(
                            <Upload {...singleUploadprops}>
                                <Button>
                                    <Icon type="upload" /> Click to Upload
                                </Button>
                                {that.props.editAgentData && that.props.editAgentData.aadhar_upload ? (
                                    <img
                                      src={makeFileURL(that.props.editAgentData.aadhar_upload)}
                                      style={{maxWidth: '100%'}}
                                    />
                                  ) : null}
                            </Upload>
                        )}
                    </FormItem>

                    <FormItem {...formItemLayout}>
                        <Button type="primary" htmlType="submit" style={{margin: 5}}>
                            Submit
                        </Button>
                        {that.props.history ? (
                            <Button style={{margin: 5}} onClick={() => that.props.history.goBack()}>
                                Cancel
                            </Button>
                          ) : null}
                    </FormItem>
                </Form>
            </Spin>
</Card>
)
    }
}

export default Form.create()(AddOrEditAgent)
