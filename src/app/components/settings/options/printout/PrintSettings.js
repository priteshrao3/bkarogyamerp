import React from 'react';
import {Row, Form, Col, Radio, Input, Divider, Select, InputNumber, Icon, Button, Upload, Checkbox,message} from "antd";
import {
    CUSTOMIZE_PAPER_TYPE,
    EXCLUDE_PATIENT_DOB, HEADER_INCLUDE, LOGO_ALIGMENT, LOGO_INCLUDE, LOGO_TYPE,
    PAGE_ORIENTATION, PAPER_SIZE, PATIENT_DETAILS_LIST,
    PRINTER_TYPE
} from "../../../../constants/hardData";
import {displayMessage, getAPI, interpolate, makeURL, postAPI} from "../../../../utils/common";
import {
    CLINIC_NOTES_PDF,
    FILE_UPLOAD_API,
    PRACTICE_PRINT_SETTING_API,
    PRINT_PREVIEW_RENDER,
    SAVE_ALL_PRINT_SETTINGS
} from "../../../../constants/api";

import {SINGLE_IMAGE_UPLOAD_FIELD, SUCCESS_MSG_TYPE} from "../../../../constants/dataKeys";
import {BACKEND_BASE_URL} from "../../../../config/connect";

const {TextArea} = Input;
const radioTabList = CUSTOMIZE_PAPER_TYPE.map((radioTab) => <Radio.Button value={radioTab}>{radioTab}</Radio.Button>);


class PrintSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type: this.props.type,
            sub_type: this.props.sub_type,
            selectedFormType: 'PAGE',
            print_setting: {},
            editedPrintSettings: {},
        }
        this.loadData = this.loadData.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    changeFormType = (e) => {
        this.setState({
            selectedFormType: e.target.value
        })

    }

    loadData() {
        const that = this;
        const successFn = function (data) {
            if (data.length)
                that.setState({
                    print_setting: data[0],
                });
        };
        const errorFn = function () {
        };
        getAPI(interpolate(PRACTICE_PRINT_SETTING_API, [this.props.active_practiceId, that.state.type, that.state.sub_type]), successFn, errorFn);
    }

    handleSubmit = (e) => {
        console.log(e);
        e.preventDefault();
        const that = this;

        this.props.form.validateFields((err, formData) => {
            console.log(formData);
            if (!err) {
                let reqData = {
                    type: that.state.type,
                    ...formData
                }

                const key = "logo_path";
                if (reqData[key] && formData[key].file && formData[key].file.response)
                    reqData[key] = formData[key].file.response.image_path;
                else
                    reqData[key] = that.state.print_setting.logo_path;

                if (!reqData.save_for_all) {
                    reqData = {
                        ...reqData,
                        sub_type: that.state.sub_type,
                        id: that.state.print_setting.id
                    }
                }
                delete reqData.save_for_all;
                const successFn = function (data) {
                    displayMessage(SUCCESS_MSG_TYPE, "Settings Saved Successfully!!");
                };
                const errorFn = function () {
                };
                if (formData.save_for_all) {
                    postAPI(interpolate(SAVE_ALL_PRINT_SETTINGS, [this.props.active_practiceId]), reqData, successFn, errorFn);
                } else {
                    postAPI(interpolate(PRACTICE_PRINT_SETTING_API, [this.props.active_practiceId, that.state.type, that.state.sub_type]), reqData, successFn, errorFn);
                }
            }
        });
    }

    handleFormEditSettings = (type, value) => {
        this.setState(function (prevState) {
            return {editedPrintSettings: {...prevState.editedPrintSettings, [type]: value}}
        })
    }

    loadPDF = (path) => {
        const that = this;
        const successFn = function (data) {
            if (data.report)
                window.open(BACKEND_BASE_URL + data.report);
        }
        const errorFn = function () {

        }
        getAPI(path, successFn, errorFn);
    }

    onchangeHandle=(type ,value)=>{
        const that=this;
        this.setState({
            [type]:value
        }
        ,function(){
            if(this.state.is_patient_not){
                this.props.form.resetFields()
            }
        }
        )
    }

    render() {
        console.log(this.state)
        const that = this;
        const formItemLayout = {
            labelCol: {
                xs: {span: 8},
                sm: {span: 8},
                md: {span: 8},
                lg: {span: 8},
            },
            wrapperCol: {
                xs: {span: 16},
                sm: {span: 16},
                md: {span: 16},
                lg: {span: 16},
            },
        };
        const pageSizeOptionList = PAPER_SIZE.map((pageSize) => (
<Select.Option
  value={pageSize}
>{pageSize}
</Select.Option>
))
        const headerInclude = HEADER_INCLUDE.map((header_include) => (
<Radio
  value={header_include.value}
>{header_include.title}
</Radio>
))
        const logoType = LOGO_TYPE.map((logo_type) => <Radio value={logo_type.value}>{logo_type.value}</Radio>)
        const logoAlignment = LOGO_ALIGMENT.map((logo_alignment) => (
<Radio
  value={logo_alignment.value}
>{logo_alignment.value}
</Radio>
))
        const logoInclude = LOGO_INCLUDE.map((logo_include) => (
<Radio
  value={logo_include.value}
>{logo_include.title}
</Radio>
))
        const singleUploadprops = {
            name: 'image',
            data: {
                name: 'hello',
                // logo_path:file.response.image_path,
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
        const patientDetailsList = PATIENT_DETAILS_LIST.map((patient_details) => (
<li>
            <Checkbox value={patient_details.value}>{patient_details.value}</Checkbox>
</li>
))
        const pageOrientation = PAGE_ORIENTATION.map((pageOrientation) => (
<Radio
  value={pageOrientation.value}
>{pageOrientation.value}
</Radio>
))
        const printer_type = PRINTER_TYPE.map((printerType) => (
<Radio
  value={printerType.value}
>{printerType.value}
</Radio>
))
        let PreviewParamsURL = `?preview=true&type=${  this.props.type  }&sub_type=${  this.props.sub_type}`;

        if (this.state.print_setting) {
            const editedObject = {...this.state.print_setting, ...this.state.editedPrintSettings};
            const keys = Object.keys(editedObject);
            keys.forEach(function (key) {
                if (editedObject[key])
                    PreviewParamsURL += `&${  key  }=${  encodeURIComponent(editedObject[key])}`
            });

        }
        const {getFieldDecorator} = this.props.form;
        console.log(PreviewParamsURL)
        return (
<Row>
                <Col span={24}>
                    <Form onSubmit={this.handleSubmit}>


                        <div className="div_padding_top">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <div style={{textAlign: 'center'}}>
                                        <Radio.Group
                                          buttonStyle="solid"
                                          size="small"
                                          onChange={this.changeFormType}
                                          defaultValue={this.state.selectedFormType}
                                        >
                                            {radioTabList}
                                        </Radio.Group>
                                        <br />
                                    </div>
                                    <div hidden={this.state.selectedFormType != 'PAGE'}>

                                        <h2>Page Setup</h2>
                                        <Form.Item key="page_size" {...formItemLayout} label="Paper Size">
                                            {getFieldDecorator('page_size', {
                                                initialValue: this.state.print_setting.page_size
                                            })(<Select
                                              style={{width: '100%'}}
                                              onChange={(value) => this.handleFormEditSettings('page_size', value)}
                                            >
                                                {pageSizeOptionList}
                                               </Select>)}
                                        </Form.Item>

                                        <Form.Item label="Orientation" {...formItemLayout}>
                                            {getFieldDecorator('page_orientation', {
                                                initialValue: this.state.print_setting.page_orientation
                                            })(<Radio.Group
                                              onChange={(e) => this.handleFormEditSettings('orientation', e.target.value)}
                                            >
                                                    {pageOrientation}
                                               </Radio.Group>
                                            )}
                                        </Form.Item>

                                        <Form.Item label={(<span>Printer Type&nbsp;</span>)} {...formItemLayout}>
                                            {getFieldDecorator('page_print_type', {
                                                initialValue: this.state.print_setting.page_print_type
                                            })(<Radio.Group
                                              onChange={(e) => this.handleFormEditSettings('printerType', e.target.value)}
                                            >
                                                    {printer_type}
                                               </Radio.Group>
                                            )}

                                        </Form.Item>

                                        <Form.Item
                                          key="page_margin_top"
                                          label={(<span>Top Margin</span>)}
                                          {...formItemLayout}
                                        >
                                            {getFieldDecorator('page_margin_top', {
                                                initialValue: this.state.print_setting.page_margin_top
                                            })(
                                                <InputNumber
                                                  min={0}
                                                  max={10}
                                                  onChange={(value) => this.handleFormEditSettings('page_margin_top', value)}
                                                />
                                            )}
                                            <span className="ant-form-text">Inches</span>
                                        </Form.Item>

                                        <Form.Item
                                          key="page_margin_left"
                                          label={(<span>Left Margin</span>)}
                                          {...formItemLayout}
                                        >
                                            {getFieldDecorator('page_margin_left', {
                                                initialValue: this.state.print_setting.page_margin_left
                                            })(
                                                <InputNumber
                                                  min={0}
                                                  max={10}
                                                  onChange={(value) => this.handleFormEditSettings('page_margin_left', value)}
                                                />
                                            )}
                                            <span className="ant-form-text">Inches</span>
                                        </Form.Item>

                                        <Form.Item
                                          key="page_margin_bottom"
                                          label={(<span>Bottom Margin</span>)}
                                          {...formItemLayout}
                                        >
                                            {getFieldDecorator('page_margin_bottom', {
                                                initialValue: this.state.print_setting.page_margin_bottom
                                            })(
                                                <InputNumber
                                                  min={0}
                                                  max={10}
                                                  onChange={(value) => this.handleFormEditSettings('page_margin_bottom', value)}
                                                />
                                            )}
                                            <span className="ant-form-text">Inches</span>
                                        </Form.Item>

                                        <Form.Item
                                          key="page_margin_right"
                                          label={(<span>Right Margin</span>)}
                                          {...formItemLayout}
                                        >
                                            {getFieldDecorator('page_margin_right', {
                                                initialValue: this.state.print_setting.page_margin_right
                                            })(
                                                <InputNumber
                                                  min={0}
                                                  max={10}
                                                  onChange={(value) => this.handleFormEditSettings('page_margin_right', value)}
                                                />
                                            )}
                                            <span className="ant-form-text">Inches</span>
                                        </Form.Item>
                                    </div>
                                    <div hidden={this.state.selectedFormType != 'HEADER'}>
                                        <h2>Customize Header</h2>

                                        <Form.Item
                                          key="header_include"
                                          {...formItemLayout}
                                          label={(<span>Include Header&nbsp;</span>)}
                                        >
                                            {getFieldDecorator('header_include', {initialValue: this.state.print_setting.header_include})
                                            (
                                                <Radio.Group
                                                  onChange={(e) => this.handleFormEditSettings('header_include', e.target.value)}
                                                >
                                                    {headerInclude}
                                                </Radio.Group>
                                            )}
                                        </Form.Item>

                                        <Form.Item
                                          key="header_text"
                                          {...formItemLayout}
                                          label={(<span>Header&nbsp;</span>)}
                                        >
                                            {getFieldDecorator('header_text', {
                                                initialValue: this.state.print_setting.header_text
                                            })(
                                                <Input
                                                  onChange={(e) => this.handleFormEditSettings('header_text', e.target.value)}
                                                />
                                            )}
                                        </Form.Item>
                                        <Form.Item
                                          key="header_left_text"
                                          {...formItemLayout}
                                          label={(<span>Left Text&nbsp;</span>)}
                                        >
                                            {getFieldDecorator('header_left_text', {
                                                initialValue: this.state.print_setting.header_left_text
                                            })(
                                                <TextArea
                                                  onChange={(e) => this.handleFormEditSettings('header_left_text', e.target.value)}
                                                />
                                            )}
                                        </Form.Item>

                                        <Form.Item
                                          key="header_right_text"
                                          {...formItemLayout}
                                          label={(<span>Right Text&nbsp;</span>)}
                                        >
                                            {getFieldDecorator('header_right_text', {initialValue: this.state.print_setting.header_right_text})
                                            (<TextArea
                                              onChange={(e) => this.handleFormEditSettings('header_right_text', e.target.value)}
                                            />)}
                                        </Form.Item>

                                        <Form.Item
                                          key="logo_include"
                                          {...formItemLayout}
                                          label={(<span>Include Logo&nbsp;</span>)}
                                        >
                                            {getFieldDecorator('logo_include', {initialValue: this.state.print_setting.logo_include})
                                            (
                                                <Radio.Group
                                                  onChange={(e) => this.handleFormEditSettings('logo_include', e.target.value)}
                                                >
                                                    {logoInclude}
                                                </Radio.Group>
                                            )}
                                        </Form.Item>

                                        <Form.Item
                                          key="logo_path"
                                          {...formItemLayout}
                                          label={(<span>Logo&nbsp;</span>)}
                                        >
                                            {getFieldDecorator('logo_path')
                                            (<Upload {...singleUploadprops}>
                                                <Button>
                                                    <Icon type="upload" /> Click to Upload
                                                </Button>
                                             </Upload>)}
                                            {/* <Avatar style={{backgroundColor: this.state.color}} size="large"> */}
                                            {/* {this.state.user} */}
                                            {/* </Avatar> */}

                                        </Form.Item>

                                        <Form.Item
                                          key="logo_type"
                                          {...formItemLayout}
                                          label={(<span>Type&nbsp;</span>)}
                                        >
                                            {getFieldDecorator('logo_type', {initialValue: this.state.print_setting.logo_type})(
                                                <Radio.Group
                                                  onChange={(e) => this.handleFormEditSettings('logo_type', e.target.value)}
                                                >
                                                    {logoType}
                                                </Radio.Group>
                                            )}
                                        </Form.Item>

                                        <Form.Item
                                          key="logo_alignment"
                                          {...formItemLayout}
                                          label={(<span>Alignment&nbsp;</span>)}
                                        >
                                            {getFieldDecorator('logo_alignment', {initialValue: this.state.print_setting.logo_alignment})
                                            (
                                                <Radio.Group
                                                  onChange={(e) => this.handleFormEditSettings('logo_alignment', e.target.value)}
                                                >
                                                    {logoAlignment}
                                                </Radio.Group>
                                            )}
                                        </Form.Item>
                                    </div>
                                    <div hidden={this.state.selectedFormType != 'PATIENT'}>
                                        <h2>Customize Patient Details</h2>
                                        <Form.Item>
                                            {getFieldDecorator('patient_details', {})(
                                                <Checkbox onChange={(e)=>this.onchangeHandle('is_patient_not',e.target.checked)}>Show Patient Details</Checkbox>)}
                                           
                                        </Form.Item>
                                            <ul className="subLists">
                                                <Form.Item>
                                                    {getFieldDecorator('exclude_history', {})(
                                                        <Checkbox>Exclude Mediacal History</Checkbox>)}
                                                
                                                </Form.Item>

                                                <Form.Item>
                                                    {getFieldDecorator('exclude_phone', {})(
                                                        <Checkbox>Exclude Patient Number</Checkbox>)}
                                                
                                                </Form.Item>
                                                <Form.Item>
                                                    {getFieldDecorator('exclude_email', {})(
                                                        <Checkbox>Exclude Patient Email Id</Checkbox>)}
                                                
                                                </Form.Item>

                                                <Form.Item>
                                                    {getFieldDecorator('exclude_address', {})(
                                                        <Checkbox>Exclude address</Checkbox>)}
                                                
                                                </Form.Item>
                                                <Form.Item>
                                                    {getFieldDecorator('exclude_blood_group', {})(
                                                        <Checkbox>Exclude Blood Group</Checkbox>)}
                                                
                                                </Form.Item>
                                                <Form.Item>
                                                    {getFieldDecorator('exclude_gender_dob', {})(
                                                        <Checkbox>{EXCLUDE_PATIENT_DOB}</Checkbox>
                                                    )}
                                                
                                                </Form.Item>
                                            </ul>
                                       
                                    </div>
                                    <div hidden={this.state.selectedFormType != 'FOOTER'}>
                                        <h2>Footer Setup</h2>
                                        <Form.Item
                                          key="footer_margin_top"
                                          {...formItemLayout}
                                          label={(<span>Top Margin&nbsp;</span>)}
                                        >
                                            {getFieldDecorator('footer_margin_top', {
                                                initialValue: this.state.print_setting.footer_margin_top
                                            })(
                                                <InputNumber
                                                  min={0}
                                                  max={10}
                                                  onChange={(value) => this.handleFormEditSettings('footer_margin_top', value)}
                                                />
                                            )}
                                            <span className="ant-form-text">Inches</span>
                                        </Form.Item>
                                        <Form.Item
                                          key="footer_text"
                                          {...formItemLayout}
                                          label={(<span>Full Width Content&nbsp;</span>)}
                                        >
                                            {getFieldDecorator('footer_text', {
                                                initialValue: this.state.print_setting.footer_text
                                            })(
                                                <TextArea
                                                  rows={3}
                                                  onChange={(e) => this.handleFormEditSettings('footer_text', e.target.value)}
                                                />
                                            )}
                                        </Form.Item>

                                        <Form.Item
                                          key="footer_left_text"
                                          {...formItemLayout}
                                          label={(<span>Left Signature&nbsp;</span>)}
                                        >
                                            {getFieldDecorator('footer_left_text', {
                                                initialValue: this.state.print_setting.footer_left_text
                                            })(
                                                <TextArea
                                                  onChange={(e) => this.handleFormEditSettings('footer_left_text', e.target.value)}
                                                />
                                            )}
                                        </Form.Item>

                                        <Form.Item
                                          key="footer_right_text"
                                          {...formItemLayout}
                                          label={(<span>Right Signature&nbsp;</span>)}
                                        >
                                            {getFieldDecorator('footer_right_text', {
                                                initialValue: this.state.print_setting.footer_right_text
                                            })(
                                                <TextArea
                                                  onChange={(e) => this.handleFormEditSettings('footer_right_text', e.target.value)}
                                                />
                                            )}
                                        </Form.Item>

                                    </div>
                                    <Row>
                                        <Divider />
                                        <Form.Item {...formItemLayout} key="save_for_all">
                                            {getFieldDecorator('save_for_all', {})(
                                                <Checkbox>
                                                    <b> Save for all</b>
                                                </Checkbox>
                                            )}
                                        </Form.Item>
                                        <Form.Item>
                                            <Button
                                              style={{margin: 5}}
                                              type="primary"
                                              htmlType="submit"
                                              value="ALL"
                                            >Save
                                            </Button>
                                            <Button
                                              style={{margin: 5}}
                                              onClick={() => this.loadPDF(`${PRINT_PREVIEW_RENDER + PreviewParamsURL  }&pdf=1`)}
                                            >Show
                                                Print Preview
                                            </Button>
                                        </Form.Item>
                                    </Row>
                                </Col>
                                <Col span={12} style={{textAlign: 'center'}}>
                                    <div style={{
                                        position: 'absolute',
                                        backgroundColor: 'black',
                                        color: 'white',
                                        padding: 10,
                                        right: 20,
                                        top: 50
                                    }}
                                    >
                                        <b>PREVIEW</b>
                                    </div>
                                    <iframe
                                      src={makeURL(PRINT_PREVIEW_RENDER + PreviewParamsURL)}
                                      style={{
                                            width: '100%',
                                            height: '100%',
                                            minHeight: '600px',
                                            boxShadow: '-2px 0px 4px #B8B8B8'
                                        }}
                                    />
                                </Col>

                            </Row>
                        </div>
                    </Form>
                </Col>
</Row>
        );

    }

}

export default Form.create()(PrintSettings);
