import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Table, Button, Divider, Modal, Form, Input } from "antd";
import TextArea from "antd/lib/input/TextArea";

class DailyTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visibleCommentModal: false
        }
    }

    openCommentModal = () => {
        console.log("sadasdas")
        const { visibleCommentModal } = this.state;
        this.setState({
            visibleCommentModal: !visibleCommentModal
        })
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
        const { visibleCommentModal } = this.state;
        const { getFieldDecorator } = this.props.form;
        const dataSource = [
            {
                key: '1',
                name: 'Mike',
                age: 32,
                address: '10 Downing Street',
            },
            {
                key: '2',
                name: 'John',
                age: 42,
                address: '10 Downing Street',
            },
        ];

        const columns = [
            {
                title: 'Task Name',
                dataIndex: 'name',
                key: 'name',
                render: (item, record) => (
<Link to="#">
                    <a>{record.name}</a>
</Link>
)
            },
            {
                title: 'Reporter',
                dataIndex: 'age',
                key: 'age',
            },
            {
                title: 'Priority',
                dataIndex: 'address',
                key: 'address',
            },
            {
                title: 'Description',
                dataIndex: 'address',
                key: 'address',
            }, {
                title: 'DeadLine',
                dataIndex: 'address',
                key: 'address',
            }, {
                title: "Action",
                key: "action",
                render: (text, record) => (
                    <span>
                        <Button size="small" type="link">Start</Button>
                        <Divider type="vertical" />
                        <Button size="small" type="link">Stop</Button>
                        <Divider type="vertical" />
                        <Button size="small" type="link">Close</Button>
                        <Divider type="vertical" />
                        <Button size="small" type="link" icon="message" onClick={() => this.openCommentModal()}>Comments</Button>
                    </span>
                )
            }
        ];
        return (
            <div>
                <Table
                  dataSource={dataSource}
                  columns={columns}
                  pagination={false}
                />

                <Modal
                  title="Title"
                  visible={visibleCommentModal}
                  onCancel={this.openCommentModal}
                  footer={null}
                >
                    <div>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Item key="comments" label="Comments">
                                {getFieldDecorator("comments", {
                                    rules: [{ required: true, message: 'This field is required!' }],

                                })(
                                    <TextArea placeholder="Comments" />
                                )}
                            </Form.Item>
                            <Form.Item>
                                <Button style={{ margin: 5 }} onClick={() => this.openCommentModal()}>
                                    Cancel
                                </Button>
                                <Button style={{ margin: 5 }} type="primary" htmlType="submit" loading={this.state.loading}>
                                    Save
                                </Button>

                            </Form.Item>
                        </Form>
                    </div>
                </Modal>
            </div>
        );
    }
}


export default Form.create()(DailyTask);