import React from 'react';
import { Layout, Spin, Button, Drawer, Row, Col, Form, Input, Divider, Modal } from 'antd';
import { SUGGESTIONS } from '../../constants/api';
import { displayMessage, interpolate, postAPI } from '../../utils/common';
import { SUCCESS_MSG_TYPE } from '../../constants/dataKeys';

const { TextArea } = Input;

class SuggestionBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    onClose = () => {
        const that = this;
        that.props.close();
    };

    handleSubmit = e => {
        e.preventDefault();
        const that = this;
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                const reqData = {
                    ...values,
                };
                const successFn = function(data) {
                    displayMessage(SUCCESS_MSG_TYPE, 'Save Your Suggestions');
                    that.props.close();
                };
                const errorFn = function() {};
                postAPI(SUGGESTIONS, reqData, successFn, errorFn);
            }
        });
    };

    render() {
        const that = this;
        const { getFieldDecorator } = this.props.form;
        return (
            <div>
                <Modal
                    title="Your Suggestion"
                    width={720}
                    onClose={this.onClose}
                    visible={that.props.visible}
                    footer={null}
                >
                    <Form layout="vertical" onSubmit={this.handleSubmit}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Name">
                                    {getFieldDecorator('name', {
                                        rules: [{ required: true, message: 'Please enter  name' }],
                                    })(<Input placeholder="Please enter user name" />)}
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Email">
                                    {getFieldDecorator('email', {
                                        rules: [{ required: true, message: 'Please enter Email' }],
                                    })(
                                        <Input
                                            style={{ width: '100%' }}
                                            placeholder="Please enter Email"
                                        />,
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Mobile">
                                    {getFieldDecorator('mobile')(
                                        <Input placeholder="Please enter Mobile" />,
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Subject">
                                    {getFieldDecorator('subject')(
                                        <Input
                                            style={{ width: '100%' }}
                                            placeholder="Please enter Email"
                                        />,
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item label="Description">
                                    {getFieldDecorator('description')(
                                        <TextArea
                                            placeholder="Please enter description"
                                            autosize={{ minRows: 4, maxRows: 6 }}
                                        />,
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Divider />
                        <div
                            style={{
                                textAlign: '-webkit-center',
                            }}
                        >
                            <Button onClick={this.onClose} style={{ marginRight: 8 }}>
                                Cancel
                            </Button>
                            <Button htmlType="submit" onSubmit={this.handleSubmit} type="primary">
                                Submit
                            </Button>
                        </div>
                    </Form>
                </Modal>
            </div>
        );
    }
}

export default Form.create()(SuggestionBox);
