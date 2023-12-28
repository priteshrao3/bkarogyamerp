import React from 'react'
import {
    BLOOD_GROUP_CONFIG_PARAM,
    FAMILY_RELATION_CONFIG_PARAM,
    GENDER_CONFIG_PARAM,
} from "../../../constants/hardData";
import {
    Button,
    Modal,
    Form, Input,
    Select,
    Checkbox
} from 'antd';
import {
    RELATION
} from '../../../constants/dataKeys';
import {Link} from "react-router-dom";
//import {getAPI, postAPI, interpolate, displayMessage} from '../../../utils/common';
import {loadConfigParameters} from "../../../utils/clinicUtils";
import lockr from 'lockr';
import PrintPatientForm from "./PrintPatientForm";


class EditPrintPatientModal extends React.Component {
    constructor(props) {
        super(props)
    
        this.state = {
            currentPatient: this.props.currentPatient,
            activePracticeData:this.props.activePracticeData,
            [BLOOD_GROUP_CONFIG_PARAM]: [],
            [FAMILY_RELATION_CONFIG_PARAM]: [],
            [GENDER_CONFIG_PARAM]: [],
             onTime:false,
        }
    }
    componentDidMount() {
        loadConfigParameters(this, [BLOOD_GROUP_CONFIG_PARAM,FAMILY_RELATION_CONFIG_PARAM, GENDER_CONFIG_PARAM]);
    }

    cancelPrintPatientForm=(e)=>{
        const that=this;
        that.setState({
            addPrintPatientFormModal:false,
        }) 
    }

    onChangeCheckboxa = () => {
        this.setState({
            allopath_Checked : !this.state.allopath_Checked,
        });
    };
    handleRelation = (e) => {
        if (e) {
            this.setState({
                relation_text: false,
            });
        } else {
            this.setState({
                relation_text: true,
            });
        }

    };

    handlePrintPatientSubmit = e => {
        const that=this;
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        lockr.set("patientProfile",values);
        that.setState({
            onTime:true,
        })
        that.props.history.push(`/erp/patients/${that.state.currentPatient.id}/patientprintform`)
      }
      else{
          console.log(err)
      }
    });
    this.props.onCancelModal();
  };
    render() {
        const that=this;
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 18 },
        };
        const {visibleModal,currentPatient,onTime,patientProfile,activePracticeData}=this.props;
        console.log(activePracticeData);
        return (
            <div>
                 <Modal
                         visible={visibleModal}
                         onCancel={() => that.props.onCancelModal()}
                         footer={null}
                         title="Edit Print Patient Form"
                        >
                       <Form title="Edit Value" onSubmit={this.handlePrintPatientSubmit} key="printForm">
                        <Form.Item label="Name" {...formItemLayout}>
                            {getFieldDecorator('first_name', {
                                initialValue: this.state.currentPatient ? this.state.currentPatient.user.first_name : null,
                            })
                            (<Input/>)}
                        </Form.Item>
                        <Form.Item label="Patient Id" {...formItemLayout}>
                            {getFieldDecorator('custom_id', {
                                initialValue: this.state.currentPatient ? this.state.currentPatient.custom_id : null,
                            })
                            (<Input/>)}
                        </Form.Item>
                        <Form.Item label="Patient Address" {...formItemLayout}>
                            {getFieldDecorator('address', {
                                initialValue: this.state.currentPatient ? this.state.currentPatient.address: null,
                            })
                            (<Input/>)}
                        </Form.Item>
                        <Form.Item label="Blood Group" {...formItemLayout}>
                            {getFieldDecorator('blood_group', {
                                initialValue: this.state.currentPatient ? this.state.currentPatient.blood_group: null,
                            })
                            (<Select placeholder="Blood Group">
                            {this.state[BLOOD_GROUP_CONFIG_PARAM].map((option) => (
                                <Select.Option
                                  value={option}
                                >{option}
                                </Select.Option>
                            ))}
                         </Select>)
                         }
                        </Form.Item>
                        <Form.Item label="D.O.B" {...formItemLayout}>
                            {getFieldDecorator('dob', {
                                initialValue: this.state.currentPatient ? this.state.currentPatient.dob: null,
                            })
                            (<Input/>)}
                        </Form.Item>
                        <Form.Item label="Gender" {...formItemLayout}>
                            {getFieldDecorator('gender', {
                                initialValue: this.state.currentPatient ? this.state.currentPatient.gender: null,
                            })
                            (<Select placeholder="Select Gender">
                            {this.state[GENDER_CONFIG_PARAM].map((option) => (
                                <Select.Option value={option.value}>
                                    {option.label}
                                </Select.Option>
                            ))}
                         </Select>)}
                        </Form.Item>
                        <Form.Item label="Attendee Name" {...formItemLayout}>
                            {getFieldDecorator('attendee1', {
                                initialValue: this.state.currentPatient ? this.state.currentPatient.attendee1: null,
                            })
                            (<Input/>)}
                        </Form.Item>
                        <Form.Item label="Attendee Relation" {...formItemLayout}>
                            {getFieldDecorator('family_relation1', {
                                initialValue:this.state.currentPatient && this.state.currentPatient.family_relation1 != null ? this.state.currentPatient.family_relation1 : RELATION
                            })
                            (<Select onChange={(value) => this.handleRelation(value)}>
                                 <Select.Option value="">{RELATION}</Select.Option>
                            {this.state[FAMILY_RELATION_CONFIG_PARAM].map((option) => (
                                <Select.Option
                                  value={option.value}
                                >{option.name}
                                </Select.Option>
                            ))}
                         </Select>)}
                        </Form.Item>
                        <Form.Item label="Email" {...formItemLayout}>
                            {getFieldDecorator('email', {
                                initialValue: this.state.currentPatient ? this.state.currentPatient.user.email: null,
                            })
                            (<Input/>)}
                        </Form.Item>
                        <Form.Item label="Weight" {...formItemLayout}>
                            {getFieldDecorator('weight', {
                                initialValue:null,
                            })
                            (<Input/>)}
                        </Form.Item>
                        <Form.Item label="Height" {...formItemLayout}>
                            {getFieldDecorator('height', {
                                initialValue:null,
                            })
                            (<Input/>)}
                        </Form.Item>
                        <Form.Item label="Blood Sugar" {...formItemLayout}>
                            {getFieldDecorator('blood_sugar', {
                                initialValue:null,
                            })
                            (<Input/>)}
                        </Form.Item>
                        <Form.Item label="Blood Pressure" {...formItemLayout}>
                            {getFieldDecorator('blood_pressure', {
                                initialValue:null,
                                
                            })
                            (<Input/>)}
                        </Form.Item>
                        <Form.Item label="cr" {...formItemLayout}>
                            {getFieldDecorator('cr', {
                                initialValue:null,
                            })
                            (<Input/>)}
                        </Form.Item>
                        <Form.Item label="Dialysis" {...formItemLayout}>
                            {getFieldDecorator('on_dialysis', {
                                initialValue: this.state.currentPatient.on_dialysis ? "Yes" : "No",
                            })
                            (<Input/>)}
                        </Form.Item>
                        <Form.Item label="Urea" {...formItemLayout}>
                            {getFieldDecorator('urea', {
                                initialValue:null,
                            })
                            (<Input/>)}
                        </Form.Item>
                        <Form.Item label="Other" {...formItemLayout}>
                            {getFieldDecorator('other', {
                                initialValue:null,
                            })
                            (<Input.TextArea rows={3}/>)}
                        </Form.Item>
                      
                        <Form.Item label="Taken treatment before here:" {...formItemLayout}>
                            <br/>
                            {getFieldDecorator('treatment_before', {
                                initialValue:null,
                            })
                            (<Input.TextArea rows={3}/>)}
                        </Form.Item>
                        <Form.Item label="Allopath" {...formItemLayout}>
                            {getFieldDecorator('allopath_Checked', {
                                initialValue:null,
                            })
                            (<Checkbox onChange={(e) => this.onChangeCheckboxa(e)}/>)}
                             {getFieldDecorator('allopath_Desp', {
                                initialValue:null,
                            })
                            (<Input.TextArea rows={3}/>)}
                        </Form.Item>
                        <Form.Item label="Any bad habit" {...formItemLayout}>
                            {getFieldDecorator('bad_habit', {
                                initialValue:null,
                            })
                            (<Input.TextArea rows={3}/>)}
                        </Form.Item>
                        <Form.Item {...formItemLayout}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{ marginLeft: 210 }}
                                loading={this.state.formLoading}
                            >
                                Submit
                            </Button>
                            </Form.Item>
                            </Form>
                        </Modal>
               {/*   {this.state.onTime?  <PrintPatientForm activePracticeData={this.props.activePracticeData}/> :false}
               {this.state.onTime? <Link to={`/patients/${this.state.currentPatient.id}/patientprintform`} activePracticeData={this.props.activePracticeData}> </Link>:false}  */}
                    
                       
            </div>
        )
    }
}

export  default Form.create() (EditPrintPatientModal)
