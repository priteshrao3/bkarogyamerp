import React from "react";
import {Button, Card, Col, Progress, Row, Table} from "antd";
import CommentTaskModal from "../common/CommentTaskModal";

export default class AssignRating extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }


    render() {
        const {ratingTaskModalOpen} = this.state;
        const coloumn = [];
        return (
            <div>
                <Card>
                    <Row>
                        <Col span={24}>
                            <Table columns={coloumn} />
                        </Col>
                    </Row>
                    <CommentTaskModal
                      open={!!ratingTaskModalOpen}
                      key={ratingTaskModalOpen}
                      cancelFn={() => this.toggleCommentTask(false)}
                      taskId={completeTaskModalOpen}
                    />
                </Card>
            </div>
        )
    }
}
