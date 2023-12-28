import React from 'react';
import {Form, Input, InputNumber, Button, Row, Col} from 'antd';
import {postAPI, interpolate, getAPI, makeURL} from "../../../../utils/common";
import {PRACTICE_PRINT_SETTING_API, PRINT_PREVIEW_RENDER} from "../../../../constants/api";

const {TextArea} = Input;

class FooterSetting extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            type: this.props.type,
            sub_type: this.props.sub_type,
            print_setting: {}

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
                console.log("test", reqData);
                const successFn = function (data) {
                    if (data) {
                        console.log(data)
                    }
                };
                const errorFn = function () {
                };
                postAPI(interpolate(PRACTICE_PRINT_SETTING_API, [this.props.active_practiceId]), reqData, successFn, errorFn);
            }
        });
    }

    loadData() {
        const that = this;
        const successFn = function (data) {
            if (data.length)
                that.setState({
                    print_setting: data[0],
                })
        };
        const errorFn = function () {
        };
        getAPI(interpolate(PRACTICE_PRINT_SETTING_API, [this.props.active_practiceId, that.state.type, that.state.sub_type]), successFn, errorFn);

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
                    <Form onSubmit={this.handleSubmit} />
                </Col>
                <Col span={12} style={{textAlign: 'center'}}>
                    <iframe
                      src={makeURL(PRINT_PREVIEW_RENDER + PreviewParamsURL)}
                      style={{width: '100%', height: '100%', boxShadow: '-2px 0px 4px #B8B8B8'}}
                    />
                </Col>

</Row>

        );
    }
}

export default FooterSetting;
