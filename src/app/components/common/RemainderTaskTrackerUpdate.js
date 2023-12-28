import React from 'react';
import { Icon, Modal } from 'antd';
import { REMAINDER_TASK_TRACKER_MESSAGE, REMAINDER_TASK_TRACKER_TITLE } from '../../constants/dataKeys';
class RemainderTaskTrackerUpdate extends React.Component {
    constructor(props) {
        super(props);
        this.state={

        }

    }
     error=() =>{
        let that=this
        Modal.warning({
            title: REMAINDER_TASK_TRACKER_TITLE,
            content: REMAINDER_TASK_TRACKER_MESSAGE,
            onOk() {
                that.props.onCancel();
            },

            style:{background:'red',padding:20}

        });
    }
    render() {
        return (
            <div>
                {this.error()}
                {/*<Modal*/}

                {/*    title={<p><Icon type="exclamation-circle" style={{color:'red'}} /> Title</p>}*/}
                {/*    visible={true}*/}
                {/*    onCancel={this.props.onCancel}*/}
                {/*    footer={null}*/}
                {/*    maskClosable={false}*/}

                {/*>*/}
                {/*    <p>Some contents...</p>*/}
                {/*    <p>Some contents...</p>*/}
                {/*    <p>Some contents...</p>*/}
                {/*</Modal>*/}
            </div>
        );
    }

}


export default RemainderTaskTrackerUpdate;
