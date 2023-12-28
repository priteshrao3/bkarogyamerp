import React from "react";
import { Button, Card, Form, Icon, Row } from "antd";
import { Redirect } from 'react-router-dom'
import { Route } from "react-router";
import DynamicFieldsForm from "../../../common/DynamicFieldsForm";
import {
    CHECKBOX_FIELD,
    SUCCESS_MSG_TYPE,
    INPUT_FIELD,
    RADIO_FIELD,
    SELECT_FIELD,
    SINGLE_CHECKBOX_FIELD,
    COLOR_PICKER,
    EMAIL_FIELD
} from "../../../../constants/dataKeys";
import { ALL_PRACTICE_STAFF, DRUG_CATALOG, SINGLE_PRACTICE_STAFF_API, STAFF_ROLES, HR_SETTING } from "../../../../constants/api";
import { getAPI, displayMessage, interpolate } from "../../../../utils/common";

class AddEditDoctor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            editStaff: null,
            roles: [],
            deginationData: [],
            departmentData: []
        }
        this.changeRedirect = this.changeRedirect.bind(this);
        this.loadEditPracticeStaff = this.loadEditPracticeStaff.bind(this);
        if (this.props.match.params.doctorid) {
            this.loadEditPracticeStaff();
        }
        this.staffRoles();
    }

    componentDidMount() {
        this.loadDesignation();
        this.loadDepartment();
    }

    loadDesignation() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                deginationData: data,
            })
        }
        const errorFn = function () {
        }
        const apiParams = {
            name: 'Designation'
        }
        getAPI(HR_SETTING, successFn, errorFn, apiParams)
    }

    loadDepartment() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                departmentData: data,
            })
        }
        const errorFn = function () {
        }
        const apiParams = {
            name: 'Department'
        }
        getAPI(HR_SETTING, successFn, errorFn, apiParams)
    }




    staffRoles() {
        const that = this;
        const successFn = function (data) {
            that.setState({
                roles: data
            })
        }
        const errorFn = function () {
        }
        getAPI(STAFF_ROLES, successFn, errorFn)
    }

    loadEditPracticeStaff() {
        const { doctorid } = this.props.match.params;
        console.log(doctorid)
        const that = this;
        const successFn = function (data) {
            that.setState({
                editStaff: data,
            })
        };
        const errorFn = function () {
            that.setState({
            })
        }
        getAPI(interpolate(SINGLE_PRACTICE_STAFF_API, [doctorid]), successFn, errorFn)

    }

    changeRedirect() {
        const redirectVar = this.state.redirect;
        this.setState({
            redirect: !redirectVar,
        });
    }

    render() {
        const that = this;

        const fields = [
            {
                label: "Doctor",
                key: "user.first_name",
                required: true,
                placeholder: "Doctor Name",
                initialValue: this.state.editStaff ? this.state.editStaff.user.first_name : null,
                type: INPUT_FIELD
            }, {
                label: "Mobile Number",
                key: "user.mobile",
                placeholder: "Mobile Number",
                required: true,
                initialValue: this.state.editStaff ? this.state.editStaff.user.mobile : null,
                type: INPUT_FIELD,
                // disabled: !!this.state.editStaff
            }, {
                label: "Email Id",
                key: "user.email",
                placeholder: "Email Id",
                required: true,
                // disabled: !!this.state.editStaff,
                initialValue: this.state.editStaff ? this.state.editStaff.user.email : null,
                type: EMAIL_FIELD
            }, {
                label: "Registration Number",
                key: "registration_number",
                placeholder: "Registration Number",
                initialValue: this.state.editStaff ? this.state.editStaff.registration_number : null,
                type: INPUT_FIELD
            }, {
                label: "Employee Id",
                key: "emp_id",
                required: true,
                initialValue: this.state.editStaff ? this.state.editStaff.emp_id : null,

                type: INPUT_FIELD
            }, {
                label: "Department",
                key: "department",
                required: true,
                type: SELECT_FIELD,
                initialValue: this.state.editStaff ? this.state.editStaff.department : [],
                options: this.state.departmentData.map(option => ({ label: option.value, value: option.id }))
            }, {
                label: "Designation",
                key: "designation",
                required: true,
                type: SELECT_FIELD,
                initialValue: this.state.editStaff ? this.state.editStaff.designation : [],
                options: this.state.deginationData.map(option => ({ label: option.value, value: option.id }))
            }, {
                label: "is manager",
                key: "is_manager",
                initialValue: this.state.editStaff ? this.state.editStaff.is_manager : false,
                type: SINGLE_CHECKBOX_FIELD
            },
            // {
            //     label: "Role",
            //     key: "role",
            //     required: true,
            //     initialValue: this.state.editStaff ? this.state.editStaff.role : null,
            //     type: SELECT_FIELD,
            //     options: this.state.roles.map(role => ({label: role.name, value: [role.id]}))
            // },
            {
                label: "Calendar Colour",
                key: "calendar_colour",
                initialValue: this.state.editStaff ? this.state.editStaff.calendar_colour : null,
                type: COLOR_PICKER,
                required: true

            }, {
                label: "Schedule SMS",
                key: "schedule_sms",
                initialValue: this.state.editStaff ? this.state.editStaff.schedule_sms : false,
                type: SINGLE_CHECKBOX_FIELD,
            }, {
                label: "Confirmation SMS",
                key: "confirmation_sms",
                initialValue: this.state.editStaff ? this.state.editStaff.confirmation_sms : false,
                type: SINGLE_CHECKBOX_FIELD,
            }, {
                label: "Confirmation Email",
                key: "confirmation_email",
                initialValue: this.state.editStaff ? this.state.editStaff.confirmation_email : false,
                type: SINGLE_CHECKBOX_FIELD,
            }, {
                label: "Online Appointment SMS",
                key: "online_appointment_sms",
                initialValue: this.state.editStaff ? this.state.editStaff.online_appointment_sms : false,
                type: SINGLE_CHECKBOX_FIELD,
            },]
        const formProp = {
            successFn(data) {
                displayMessage(SUCCESS_MSG_TYPE, "success");
                that.setState({
                    redirect: true

                });
                that.props.loadData();
                if (that.props.history) {
                    that.props.history.replace("/erp/settings/clinics-staff");
                }
            },
            errorFn() {

            },
            action: ALL_PRACTICE_STAFF,
            method: "post",
        }
        let editformProp;
        if (this.state.editStaff) {

            editformProp = {
                successFn(data) {
                    displayMessage(SUCCESS_MSG_TYPE, "success");
                    that.setState({
                        redirect: true,
                    });
                    that.props.loadData();
                    if (that.props.history) {
                        that.props.history.replace("/erp/settings/clinics-staff");
                    }
                },
                errorFn() {

                },
                action: interpolate(SINGLE_PRACTICE_STAFF_API, [that.props.match.params.doctorid]),
                method: "put",
            }
        }
        const defaultValues = [{ key: 'role', value: [3] }];

        const TestFormLayout = Form.create()(DynamicFieldsForm);
        return (
            <Row>
                <Card>
                    <Route
                      exact
                      path='/erp/settings/clinics-staff/:doctorid/edit'
                      render={(route) => (this.props.match.params.doctorid ? (
                            <TestFormLayout
                              defaultValues={defaultValues}
                              title="Edit Doctor"
                              changeRedirect={this.changeRedirect}
                              formProp={editformProp}
                              fields={fields}
                              {...route}
                            />
                        ) : <Redirect to="/erp/settings/clinics-staff" />)}
                    />

                    <Route
                      exact
                      path='/erp/settings/clinics-staff/adddoctor'
                      render={(route) => (
                            <TestFormLayout
                              defaultValues={defaultValues}
                              changeRedirect={this.changeRedirect}
                              title="Add Doctor "
                              formProp={formProp}
                              fields={fields}
                              {...route}
                            />
                        )}
                    />
                </Card>
                {this.state.redirect && <Redirect to='/erp/settings/clinics-staff' />}

            </Row>
        )
    }
}

export default AddEditDoctor;
