import React from 'react';
import {Form, Select, Input, Radio, InputNumber, Avatar, Button, Row, Col} from 'antd';
import {postAPI, interpolate, getAPI, makeURL} from "../../../../utils/common";
import {PRACTICE_PRINT_SETTING_API, PRINT_PREVIEW_RENDER} from "../../../../constants/api";
import {PAPER_SIZE, PAGE_ORIENTATION, PRINTER_TYPE} from "../../../../constants/hardData";

const {Option} = Select;
const RadioGroup = Radio.Group;


class PageSettingForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type: this.props.type,
            sub_type: this.props.sub_type,
            loading: true,
            print_setting: {
                page_size: 'A4'
            }

        }
        this.loadData = this.loadData.bind(this);

    }

    componentDidMount() {
        this.loadData();
    }


    handleSubmit = (e) => {
        e.preventDefault();
        const that = this;
        const data = {};
        this.props.form.validateFields((err, formData) => {
            if (!err) {
                const reqData = {
                    type: this.state.type,
                    sub_type: this.state.sub_type,
                    id: this.state.print_setting.id, ...formData
                }
                const successFn = function (data) {
                    if (data) {
                    }
                };
                const errorFn = function () {
                };
                postAPI(interpolate(PRACTICE_PRINT_SETTING_API, [this.props.active_practiceId, that.state.type, that.state.sub_type]), reqData, successFn, errorFn);
            }
        });
    }

    loadData() {
        const that = this;
        const successFn = function (data) {
            if (data.length)
                that.setState({
                    print_setting: data[0],
                    loading: false
                })

        };
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        getAPI(interpolate(PRACTICE_PRINT_SETTING_API, [this.props.active_practiceId, that.state.type, that.state.sub_type]), successFn, errorFn);
    }


    onChanged = (name, value) => {
        this.setState({
            [name]: value,
        });

    }

    render() {
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

        const {getFieldDecorator} = this.props.form;
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
            const keys = Object.keys(this.state.print_setting);
            keys.forEach(function (key) {
                if (that.state.print_setting[key])
                    PreviewParamsURL += `&${  key  }=${  that.state.print_setting[key]}`
            });
        }
        return (
<Row gutter={16}>
                <Col span={12}>
                    <Form onSubmit={this.handleSubmit} key={this.state.print_setting.id}>
                        <h2>Page Setup</h2>
                        <Form.Item key="page_size" {...formItemLayout} label="Paper Size">
                            {getFieldDecorator('page_size', {
                                initialValue: this.state.print_setting.page_size
                            })(<Select style={{width: '100%'}}>
                                    {OptionList}
                               </Select>
                            )}
                        </Form.Item>

                        <Form.Item label="Orientation" {...formItemLayout}>
                            {getFieldDecorator('page_orientation', {
                                initialValue: this.state.print_setting.page_orientation
                            })(<RadioGroup onChange={(e) => this.onChanged('orientation', e.target.value)}>
                                    {pageOrientation}
                               </RadioGroup>
                            )}
                        </Form.Item>

                        <Form.Item label={(<span>Printer Type&nbsp;</span>)} {...formItemLayout}>
                            {getFieldDecorator('page_print_type', {
                                initialValue: this.state.print_setting.page_print_type
                            })(<RadioGroup onChange={(e) => this.onChanged('printerType', e.target.value)}>
                                    {printer_type}
                               </RadioGroup>
                            )}

                        </Form.Item>

                        <Form.Item key="page_margin_top" label={(<span>Top Margin</span>)} {...formItemLayout}>
                            {getFieldDecorator('page_margin_top', {
                                initialValue: this.state.print_setting.page_margin_top
                            })(
                                <InputNumber min={0} max={10} />
                            )}
                            <span className="ant-form-text">Inches</span>
                        </Form.Item>

                        <Form.Item key="page_margin_left" label={(<span>Left Margin</span>)} {...formItemLayout}>
                            {getFieldDecorator('page_margin_left', {
                                initialValue: this.state.print_setting.page_margin_left
                            })(
                                <InputNumber min={0} max={10} />
                            )}
                            <span className="ant-form-text">Inches</span>
                        </Form.Item>

                        <Form.Item key="page_margin_bottom" label={(<span>Bottom Margin</span>)} {...formItemLayout}>
                            {getFieldDecorator('page_margin_bottom', {
                                initialValue: this.state.print_setting.page_margin_bottom
                            })(
                                <InputNumber min={0} max={10} />
                            )}
                            <span className="ant-form-text">Inches</span>
                        </Form.Item>

                        <Form.Item key="page_margin_right" label={(<span>Right Margin</span>)} {...formItemLayout}>
                            {getFieldDecorator('page_margin_right', {
                                initialValue: this.state.print_setting.page_margin_right
                            })(
                                <InputNumber min={0} max={10} />
                            )}
                            <span className="ant-form-text">Inches</span>
                        </Form.Item>


                        <Form.Item {...formItemLayout}>
                            <Button type="primary" htmlType="submit">Submit</Button>
                        </Form.Item>

                    </Form>
                </Col>
                <Col span={12} style={{textAlign: 'center'}}>
                    <iframe
                      src={makeURL(PRINT_PREVIEW_RENDER + PreviewParamsURL)}

                      style={{width: '100%', height: '100%', minHeight: '800px', boxShadow: '-2px 0px 4px #B8B8B8'}}
                    />
                </Col>

</Row>
        );
    }
}

export default PageSettingForm;
