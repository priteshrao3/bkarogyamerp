import React from 'react';
import {Form, Input, Radio, Avatar, Button, Upload, Icon, message, Row, Col} from 'antd';
import {postAPI, interpolate, getAPI, makeURL} from "../../../../utils/common";
import {PRACTICE_PRINT_SETTING_API, FILE_UPLOAD_API, PRINT_PREVIEW_RENDER} from "../../../../constants/api";
import {HEADER_INCLUDE, LOGO_TYPE, LOGO_ALIGMENT, LOGO_INCLUDE} from "../../../../constants/hardData";

const UserList = ['U', 'Lucy', 'Tom', 'Edward'];
const colorList = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae'];

class HeaderSettingForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            type: this.props.type,
            sub_type: this.props.sub_type,
            user: UserList[0],
            color: colorList[0],
            print_setting: {}
        };

        this.loadData = this.loadData.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    changeImage = () => {
        const index = UserList.indexOf(this.state.user);
        this.setState({
            user: index < UserList.length - 1 ? UserList[index + 1] : UserList[0],
            color: index < colorList.length - 1 ? colorList[index + 1] : colorList[0],
        });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const that = this;
        const data = {};
        this.props.form.validateFields((err, formData) => {
            if (!err) {
                const image = null;
                // if (formData['logo_path'].file.response)
                //     image = formData['logo_path'].file.response.image_path;

                const reqData = {
                    type: this.state.type,
                    sub_type: this.state.sub_type,
                    id: this.state.print_setting.id, ...formData,
                    logo_path: image
                }

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




    onChanged = (name, value) => {
        this.setState({
            [name]: value
        });

    }

    render() {
        const that = this;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 8},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 16},
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
                    <Form onSubmit={this.handleSubmit} key={this.state.print_setting.id} />
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

export default HeaderSettingForm;
