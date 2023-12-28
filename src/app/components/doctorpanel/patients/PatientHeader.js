import React from "react";
import {Avatar, Button, Drawer, Icon, Layout, Tooltip} from "antd";
import PatientSelection from "./PatientSelection";
import {Link} from "react-router-dom";

const {Header, Content, Sider} = Layout;


class PatientHeader extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let that = this;
        return <Header className="header" style={{background: '#e4e4e4'}}>
            <div>
                {this.props.currentPatient ?
                    <div style={{display: 'inline'}}>
                        <div style={{display: 'inline', textSize: '25px'}}>
                            <Tooltip title="Switch Back to All Patients">
                                <Button onClick={() => this.props.setCurrentPatient(null)} type="primary" ghost>
                                    <Icon type="solution"/> &nbsp;
                                    Back
                                </Button>
                            </Tooltip>
                        </div>
                        <a style={{padding: '8px', fontSize: '20px'}}
                           onClick={() => this.props.togglePatientListModal(true)}>
                            {(this.props.currentPatient.image ? <Avatar src={this.props.currentPatient.image}/> :
                                <Avatar style={{backgroundColor: '#87d068'}}>
                                    {this.props.currentPatient.user.first_name ? this.props.currentPatient.user.first_name.charAt(0) :
                                        <Icon type="user"/>}
                                </Avatar>)}
                            &nbsp;&nbsp;{that.props.currentPatient.user.first_name}
                        </a>
                    </div> :
                    <a style={{padding: '8px', fontSize: '20px'}}
                       onClick={() => this.props.togglePatientListModal(true)}>
                        <div style={{display: 'inline'}}><Icon type="solution"/> &nbsp; All Patient</div>
                    </a>}
                <Link to="/patients/profile/add"><Button type="primary"
                                                         style={{float: 'right', marginTop: '10px'}}><Icon
                    type="plus"/> Add Patient</Button></Link>
            </div>
            <Drawer
                title="Select Patient"
                width={1220}
                placement="left"
                onClose={() =>
                    this.props.togglePatientListModal(false)
                }
                maskClosable={false}
                visible={this.props.listModalVisible}
                style={{
                    height: 'calc(100% - 55px)',
                    overflow: 'auto',
                    paddingBottom: 53,
                }}>
                <PatientSelection {...this.props}/>
            </Drawer>
        </Header>
    }
}

export default PatientHeader;


