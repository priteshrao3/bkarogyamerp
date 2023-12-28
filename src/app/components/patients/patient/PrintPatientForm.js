import React from "react";
import {Icon} from "antd";
import '../../../assets/printpatientform.css';
import {makeFileURL, getAPI, interpolate} from "../../../utils/common";
import {PATIENT_PROFILE} from "../../../constants/api";
import moment from "moment";
import lockr from 'lockr';
import EditPrintPatientModal from "./EditPrintPatientModal"


export default class PrintPatientForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            patientProfile: lockr.get("patientProfile"),
            activePracticeData: this.props.activePracticeData,
        }
    }

    componentDidMount() {
        setTimeout(function () {
            window.print();
        }, 1000)

    }


    render() {
        let {patientProfile, activePracticeData} = this.state;
        console.log(patientProfile)
        console.log(activePracticeData)
        if (this.props.activePracticeData)
            return (
                <html className="PrintPatientForm">
                <meta httpEquiv="Content-Type" content="text/html; charset=utf-8"/>
                <body style={{margin: '0 auto', marginTop: '20px'}}>
                <div style={{margin: "0px 10%"}}>

                    <table style={{borderBottom: "1px solid #000", width: '100%'}}>
                        <tr>
                            <td style={{width: '150px'}}>
                                <img
                                    style={{width: '150px'}}
                                    src={makeFileURL(this.props.activePracticeData.logo)}
                                />
                            </td>
                            <td>
                                <h2 style={{margin: "5px"}}>{this.props.activePracticeData.name}</h2>
                                <p style={{
                                    margin: "5px",
                                    fontSize: "11px"
                                }}>{this.props.activePracticeData.address}<br/>{this.props.activePracticeData.locality}<br/>{this.props.activePracticeData.city}, {this.props.activePracticeData.state}-
                                    {this.props.activePracticeData.pincode} {this.props.activePracticeData.country}
                                </p>
                                <div style={{margin: "5px", fontSize: "11px"}}>
                                    Email : <strong>{this.props.activePracticeData.email}</strong>
                                    <br/>

                                    Phone : <strong>8081222333</strong>
                                    <br/>

                                    Website : <strong>{this.props.activePracticeData.website}</strong>
                                    <br/>
                                </div>
                            </td>

                            <td style={{width: '150px'}}>
                                <img
                                    style={{width: '150px'}}
                                    src={makeFileURL(patientProfile.image)}
                                />
                            </td>
                        </tr>
                    </table>


                    <h3 className="centeralign">
                        Patient Information
                    </h3>
                    <table>
                        <tr>
                            <td colSpan="2">
                                <h4>Personal Details :- </h4>
                            </td>
                        </tr>

                        {/* <ImageField
                                    key={1}
                                    label={null}
                                    value={makeFileURL(patientProfile.image)}
                                /> */}

                        <TextField
                            key={1}
                            label={"Patient Name"}
                            value={patientProfile ? patientProfile.first_name : ''}
                        />

                        <InlineField
                            label={"Patient ID"}
                            isValue={true}
                            value={patientProfile ? patientProfile.custom_id : ''}
                            data={[
                                {
                                    'label': patientProfile.is_age ? 'Age' : 'D.O.B',
                                    'value': patientProfile.is_age ? moment().diff(patientProfile.dob, 'years') : patientProfile.dob
                                },
                                {'label': 'Gender', value: patientProfile.gender}
                            ]}
                        />

                        <InlineField
                            label={"Attendee Name"}
                            isValue={true}
                            value={patientProfile ? patientProfile.attendee1 : ''}
                            data={[{'label': 'Relation', 'value': patientProfile.family_relation1}

                            ]}

                        />


                        <tr>
                            <td colSpan="2">
                                <h4>Contact Details :- </h4>
                            </td>
                        </tr>


                        <TextField
                            label={"Mobile Number"}
                            value={patientProfile ? patientProfile.mobile : ''}
                        />

                        <TextField
                            label={"Email"}
                            value={patientProfile ? patientProfile.email : ''}
                        />


                        <tr>
                            <td className="rightalign">
                                Address
                            </td>
                            <td>
                                <div className="textarea" style={{height: 55}}>
                                    {patientProfile ? patientProfile.address + ", " : ''}
                                    {patientProfile && patientProfile.city ? patientProfile.city_data.name + ", " : ''}
                                    {patientProfile && patientProfile.state ? patientProfile.state_data.name + "- " : ''}
                                    {patientProfile && patientProfile.pincode ? patientProfile.pincode + ", " : ''}
                                    {patientProfile && patientProfile.country ? patientProfile.country_data.name : ''}
                                </div>

                            </td>
                        </tr>

                        <tr>
                            <td colSpan="2">
                                <h4>General Details :- </h4>
                            </td>
                        </tr>

                        <InlineField
                            label={"Weight"}
                            value={patientProfile ? patientProfile.weight : ''}
                            isValue={true}
                            data={[{
                                'label': 'Height',
                                'value': `${patientProfile.weight}`
                            }]}
                        />

                        <tr>
                            <td colSpan="2">
                                <h4>Medical Details :- </h4>
                            </td>
                        </tr>


                        {/* <InlineField
                                    label={"Dialysis"}
                                    isValue={false}
                                    data={[]}
                                /> */}
                        <InlineField
                            label={"Blood Sugar"}
                            value={patientProfile ? patientProfile.blood_sugar : ''}
                            isValue={true}
                            data={[
                                {'label': 'BP', 'value': `${patientProfile.blood_pressure}`,},
                                {'label': 'Cr', 'value': `${patientProfile.cr}`,},
                            ]}
                        />

                        <InlineField
                            label={"Dialysis"}
                            value={patientProfile ? patientProfile.on_dialysis : ""}
                            isValue={true}
                            data={[
                                {'label': 'Urea', 'value': `${patientProfile.urea}`,},
                            ]}
                        />


                        <TextAreaField
                            label={"Others"}
                            style={{height: 45}}
                            value={patientProfile ? patientProfile.other : ''}
                        />
                        <TextAreaField
                            label={"Taken treatment before here"}
                            style={{height: 55}}
                            value={patientProfile ? patientProfile.treatment_before : ''}
                        />


                        <InlineField
                            label={"Medicine type and duration"}
                            isValue={false}
                            data={[]}
                        />
                        <tr>
                            <td className="rightalign" style={{width: '20%'}}>

                            </td>
                            <td>
                                <label style={{width: '12%', marginLeft: 20}}>Tick </label>

                                <label style={{width: '16%', marginLeft: 0}}>Description </label>
                            </td>
                        </tr>
                        <tr>
                            <td className="rightalign" style={{width: '20%'}}>
                            </td>
                            <label style={{width: '7%'}}>Allopath </label>
                            <div className="radio" style={{marginRight: 20, paddingLeft: 40, marginBottom: 10}}>

                            </div>

                            <div className="radio" style={{marginRight: 20, paddingLeft: 385}}>

                            </div>
                        </tr>

                        <tr>
                            <td className="rightalign" style={{width: '20%'}}>
                            </td>
                            <label style={{width: '7%'}}>Ayurveda </label>
                            <div className="radio" style={{marginRight: 20, paddingLeft: 40, marginBottom: 10}}>

                            </div>

                            <div className="radio" style={{marginRight: 20, paddingLeft: 385}}>

                            </div>

                        </tr>

                        <tr>
                            <td className="rightalign" style={{width: '20%'}}>
                            </td>
                            <label style={{width: '7%'}}>Other </label>
                            <div className="radio" style={{marginRight: 20, paddingLeft: 40}}>

                            </div>

                            <div className="radio" style={{marginRight: 20, paddingLeft: 385}}>

                            </div>

                        </tr>


                        <TextAreaField
                            label={"Any bad habit"}
                            style={{height: 55}}
                            value={patientProfile ? patientProfile.bad_habit : ''}
                        />


                    </table>
                    <p className="agreement"> I am voluntarily taking Treatments and Ayurvedic Medicines for My patient
                        under the above
                        doctor with my own consent I know my patient/I is/am in serious condition, if there shall be any
                        bad incident
                        during the period of treatment Or my patient/I become more serious for that I undertake my own
                        responsibility. I have
                        got good faith in my doctor and in his ayurvedic treatment. During the treatment If the doctor
                        finds that the patient’s condition is beyond control, he may refer the patient for better
                        treatment. During the treatment, all expenses and deposits shall not be refundable.
                        I accept & agree to term and condition to BK Arogyam and Research Pvt. Ltd.
                    </p>

                    <div className="currentDate">
                        {moment().format('DD-MM-YYYY')}
                    </div>
                    <div className="date"> Date</div>
                    <div className="signature">Authorized signature patient/attendee</div>
                </div>
                <script>
                    {/* var items = document.getElementsByClassName(“ant-btn-circle”);for(var i=0;i<items.length, i++){ items[i].style.display = “none”; } */}
                </script>


                </body>

                </html>
            )
        return null;
    }
}


function TextField(props) {
    console.log("personan details", props);
    return (
        <tr id={props.key}>
            <td className="rightalign" style={{width: '20%'}}>
                {props.label}
            </td>
            <td>
                <div className="textfield">
                    {props.value}

                </div>
                <span className="leftrightmargin_10">
                    {props.leftElement ? props.leftElement : ''}
                </span>
            </td>
        </tr>
    );
}

function TextAreaField(props) {

    return (
        <tr id={props.key}>
            <td className="rightalign">
                {props.label}
            </td>
            <td>
                <div className="textarea" style={props.style}>
                    {props.value}
                </div>
                <span className="leftrightmargin_10">
                    {props.leftElement ? props.leftElement : ''}
                </span>
            </td>
        </tr>
    );
}

function CheckField(props) {
    return (
        <tr id={props.key}>
            <td className="rightalign">
                {props.label}
            </td>
            <td>
                <div className="radio">
                    {props.male &&
                    <Icon type="check"/>
                    }
                </div>
                <label>Male </label>
                <div className="radio">
                    {props.female &&
                    <Icon type="check"/>
                    }
                </div>
                <label>Female </label>
                <div className="radio">
                    {props.other &&
                    <Icon type="check"/>
                    }
                </div>
                <label>Other</label>

            </td>
        </tr>
    )
}

function InlineField(props) {
    console.log("props", props)
    return (
        <tr id={props.key}>
            <td className="rightalign" style={{width: '20%'}}>
                {props.label}
            </td>
            <td>
                {props.isValue &&
                <div className="radio textValue">
                    {props.value}
                </div>
                }
                {
                    props.data.map(item =>
                        <>
                            <label className="inlinelabel">{item.label} </label>

                            <div className="radio textValue">
                                {item.value}
                            </div>
                        </>
                    )
                }


            </td>
        </tr>
    )
}
