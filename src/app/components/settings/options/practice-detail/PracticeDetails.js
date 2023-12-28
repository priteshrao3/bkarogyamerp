import React from "react";
import { Avatar, Button, Card, Col, Divider, Icon, Modal, Popconfirm, Row, Table } from "antd";
import { Link } from "react-router-dom";
import { ALL_PRACTICE, PRACTICE_DELETE } from "../../../../constants/api";
import { getAPI, interpolate, makeFileURL, postAPI } from "../../../../utils/common";

const { Meta } = Card;

class PracticeDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            practiceList: [],
            loading: true,
            visible: false,
            practice: {}

        };
        this.deletePractice = this.deletePractice.bind(this);
    }

    componentDidMount() {
        // this.props.refreshClinicData();
        this.admin_practiceData();
    }

    admin_practiceData() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                practiceList: data,
                loading: false
            })
        };
        const errorFn = function () {
            that.setState({
                loading: false
            })
        };
        getAPI(ALL_PRACTICE, successFn, errorFn);

    }

    // clinicData(){
    //   let  practice=loggedInUserPractices();
    //   console.log(practice);
    //   var practiceKeys = Object.keys(practice);
    //   let practiceArray = [];
    //   practiceKeys.forEach(function(key){
    //     let successFn = function (data) {
    //       practiceArray.push(data)
    //       console.log(practiceArray);
    //     }
    //     let errorFn = function () {
    //     };
    //     getAPI(interpolate(PRACTICE,[key]), successFn, errorFn);
    //
    //   });
    //   this.setState({
    //     practiceList:practiceArray
    //   })
    //
    // }

    deletePractice(value) {
        const that = this;
        const successFn = function (data) {
            console.log("data");
            that.admin_practiceData();
            if (that.props.refreshClinicData)
                that.props.refreshClinicData();
        };
        const errorFn = function () {
        };
        postAPI(interpolate(PRACTICE_DELETE, [value]), {}, successFn, errorFn);

    }

    showModal = (item) => {
        console.log(item)
        this.setState(function () {
            return { visible: true, practice: item }
        });
    };

    handleCancel = () => {
        this.setState({ visible: false });
    };

    render() {
        const that = this;
        const columns = [{
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => <a href="#" onClick={() => this.showModal(record)}>{text}</a>,
        }, {
            title: 'Tagline',
            dataIndex: 'tagline',
            key: 'tagline',
        }, {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
        }, {
            title: 'Specialisation',
            key: 'specialisation',
            dataIndex: 'specialisation',
        }, {
            title: 'SMS Language',
            dataIndex: 'language',
            key: 'language',
            // render:(item,record)=>
        }, {
            title: "Default Doctor",
            dataIndex: "default_doctor",
            key: "default_doctor",
            render: (item, record) => <span>{record.doctor_data?record.doctor_data.user.first_name:''}</span>
        }, {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <span>
                    <Link to={`/erp/settings/clinics/${record.id}/edit`}>Edit</Link>
                    <Divider type="vertical" />
                    {that.props.practiceList.length > 1 ? (
                        <Popconfirm
                          title="Are you sure delete this Practice?"
                          onConfirm={() => this.deletePractice(record.id)}
                          okText="Yes"
                          cancelText="No"
                        >
                            <a>Delete</a>
                        </Popconfirm>
                    ) : null}
                </span>
            ),
        }];

        return (
            <Row>
                <h2>Practice Details
                <Link to="/erp/settings/clinics/add">
                        <Button type="primary" style={{ float: 'right' }}>
                            <Icon type="plus" />&nbsp;Add
                        </Button>
                </Link>
                </h2>
                <Card loading={this.state.loading}>
                    <Table pagination={false} columns={columns} dataSource={this.state.practiceList} />
                </Card>
                <Modal
                  visible={this.state.visible}
                  closable={false}
                  width={600}
                  onCancel={this.handleCancel}
                  footer={null}
                >
                    <Button
                      icon="close"
                      type="danger"
                      shape="circle"
                      style={{ position: 'absolute', top: '-50px', right: 0 }}
                      onClick={this.handleCancel}
                    />
                    {/* <Card > */}
                    <Row style={{ paddingBottom: "25px" }}>
                        <Col span={12} offset={10}>
                            {this.state.practice.logo ?
                                <Avatar shape="square" size="large" src={makeFileURL(this.state.practice.logo)} />

                                : null}

                        </Col>
                    </Row>


                    <ProfileTables label="Practice Name : " value={this.state.practice.name} />
                    <ProfileTables label="Tagline : " value={this.state.practice.tagline} />
                    <ProfileTables label="Email Id: " value={this.state.practice.email} />
                    <ProfileTables label="Contact Number : " value={this.state.practice.contact} />
                    <ProfileTables label="Website : " value={this.state.practice.website} />
                    <ProfileTables label="GSTIN : " value={this.state.practice.gstin} />
                    <ProfileTables label="Specialisation" value={this.state.practice.specialisation} />
                    {ProfileTables({
                        label: 'Address',
                        value: this.state.practice.address ? this.state.practice.address : `${'' + ' '}${this.state.practice.locality}` ? this.state.practice.locality : `${'' + ' '}${this.state.practice.city}` ? this.state.practice.city : `${''
                            + ' '}${this.state.practice.state}` ? this.state.practice.state : `${'' + ' '}${this.state.practice.country}` ? this.state.practice.country : `${'' + ' '}${this.state.practice.pincode}` ? this.state.practice.pincode : ''
                    })}


                    {/* </Card> */}


                </Modal>
            </Row>
        )
    }
}

export default PracticeDetails;

function ProfileTables(props) {
    return (
        <Row gutter={16}>
            <Col span={8}>
                <p><b>{props.label}</b></p>
            </Col>
            <Col span={16}>{props.value}</Col>
        </Row>
    )

}
