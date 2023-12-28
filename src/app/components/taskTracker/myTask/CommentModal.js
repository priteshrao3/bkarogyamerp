import React, { Component } from "react";
import { Button, Modal, Form } from "antd";
import TextArea from "antd/lib/input/TextArea";
class CommentModal extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
            }
        });
    };

    render() {

        const { getFieldDecorator } = this.props.form;
        let { title, visible, onCancel } = this.props
        return (
            <Modal
                title={title}
                visible={visible}
                onCancel={onCancel}
                footer={null}
            >
                <div>
                    <Form onSubmit={this.handleSubmit} >
                        <Form.Item key="comments" label="Comments">
                            {getFieldDecorator("comments", {
                                rules: [{ required: true, message: 'This field is required!' }],

                            })(
                                <TextArea placeholder="Comments" />
                            )}
                        </Form.Item>
                        <Form.Item>
                            <Button style={{ margin: 5 }} onClick={() => onCancel()}>
                                Cancel
                                </Button>
                            <Button style={{ margin: 5 }} type="primary" htmlType="submit" loading={this.state.loading}>
                                Save
                            </Button>

                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        )
    }
}

export default Form.create()(CommentModal);
