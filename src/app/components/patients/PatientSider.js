import React from 'react';
import { Menu, Layout, Icon, Divider, Badge } from 'antd';
import { Link } from 'react-router-dom';
import Hotkeys from 'react-hot-keys';
import { INNER_KEYS_HOTKEYS } from '../../constants/hardData';

const { Sider } = Layout;

class PatientSider extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.onHotKeyInner = this.onHotKeyInner.bind(this);
    }


    onHotKeyInner(keyNm) {
        const that = this;
        switch (keyNm) {
            case 'alt+f':
                return (this.props.currentPatient ? this.props.history.push(`/erp/patient/${this.props.currentPatient.id}/profile`) : this.props.history.push('/patients/profile'));

            case 'alt+a':
                return (this.props.currentPatient ? this.props.history.push(`/erp/patient/${this.props.currentPatient.id}/appointments`) : this.props.history.push('/patients/appointments'));

            case 'alt+o':
                return (this.props.currentPatient ? this.props.history.push(`/erp/patient/${this.props.currentPatient.id}/communications`) : this.props.history.push('/patients/communications'));

            case 'alt+k':
                return (this.props.currentPatient ? this.props.history.push(`/erp/patient/${this.props.currentPatient.id}/booking`) : this.props.history.push('/patients/profile'));

            case 'alt+m':
                return (this.props.currentPatient ? this.props.history.push(`/erp/patient/${this.props.currentPatient.id}/emr/vitalsigns`) : this.props.history.push('/patients/emr/vitalsigns'));

            case 'alt+n':
                return (this.props.currentPatient ? this.props.history.push(`/erp/patient/${this.props.currentPatient.id}/emr/vitalsigns`) : this.props.history.push('/patients/emr/vitalsigns'));

            case 'alt+t':
                return (this.props.currentPatient ? this.props.history.push(`/erp/patient/${this.props.currentPatient.id}/emr/plans`) : this.props.history.push('/patients/emr/plans'));

            case 'alt+l':
                return (this.props.currentPatient ? this.props.history.push(`/erp/patient/${this.props.currentPatient.id}/emr/files`) : this.props.history.push('/patients/emr/files'));

            case 'alt+i':
                return (this.props.currentPatient ? this.props.history.push(`/erp/patient/${this.props.currentPatient.id}/billing/invoices`) : this.props.history.push('/patients/billing/invoices'));

            case 'alt+e':
                return (this.props.currentPatient ? this.props.history.push(`/erp/patient/${this.props.currentPatient.id}/billing/return/invoices`) : this.props.history.push('/patients/billing/return/invoices'));

            case 'alt+y':
                return (this.props.currentPatient ? this.props.history.push(`/erp/patient/${this.props.currentPatient.id}/billing/payments`) : this.props.history.push('/patients/billing/payments'));

            case 'alt+u':
                return (this.props.currentPatient ? this.props.history.push(`/patient/${this.props.currentPatient.id}/emr/workdone`) : this.props.history.push('/patients/emr/workdone'));

            case 'alt+s':
                return (this.props.currentPatient ? this.props.history.push(`/erp/patient/${this.props.currentPatient.id}/emr/prescriptions`) : this.props.history.push('/patients/emr/prescriptions'));

            case 'alt+g':
                return (this.props.currentPatient ? this.props.history.push(`/erp/patient/${this.props.currentPatient.id}/billing/ledger`) : this.props.history.push('/patients/profile'));

            case 'alt+w':
                return (this.props.currentPatient ? this.props.history.push(`/erp/patient/${this.props.currentPatient.id}/emr/timeline`) : this.props.history.push('/patients/profile'));
        }
    }


    render() {
        const that = this;
        return (
            <Hotkeys keyName={INNER_KEYS_HOTKEYS} onKeyDown={(value) => this.onHotKeyInner(value)}>
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={this.props.hideSidePanel}
                    style={{ overflow: 'auto', minHeight: 'calc(100vh - 64px)', background: '#fff' }}
                >
                    {/* <div className="logo"/> */}

                    <Menu mode="inline">
                        <Menu.ItemGroup key="g1" title={<Divider style={{ margin: '0px' }}>Patient</Divider>}>
                            {/* {that.props.activePracticePermissions.ViewPatient || that.props.allowAllPermissions? */}
                            <Menu.Item key="17">
                                <Link
                                    to={this.props.currentPatient ? `/erp/patient/${this.props.currentPatient.id}/profile` : '/erp/patients/profile'}
                                >
                                    <Icon type="user"/><span className="nav-text">Pro<span
                                    className="shortcutLetterHighlight"
                                >f
                                                                                  </span>ile
                                                    </span>
                                </Link>
                            </Menu.Item>
                            {/* :null} */}
                            {that.props.activePracticePermissions.PatientAppointments || that.props.allowAllPermissions ? (
                                    <Menu.Item key="18">
                                        <Link
                                            to={this.props.currentPatient ? `/erp/patient/${this.props.currentPatient.id}/appointments` : '/erp/patients/appointments'}
                                        >
                                            <Icon type="calendar"/><span className="nav-text"><span
                                            className="shortcutLetterHighlight"
                                        >A
                                                                                       </span>ppointments
                                                            </span>
                                        </Link>
                                    </Menu.Item>
                                )
                                : null}
                            {that.props.activePracticePermissions.PatientCommunications || that.props.allowAllPermissions ? (
                                    <Menu.Item key="19">
                                        <Link
                                            to={this.props.currentPatient ? `/erp/patient/${this.props.currentPatient.id}/communications` : '/erp/patients/communications'}
                                        >
                                            <Icon type="message"/><span className="nav-text">C<span
                                            className="shortcutLetterHighlight"
                                        >o
                                                                                       </span>mmunications
                                                           </span>
                                        </Link>
                                    </Menu.Item>
                                )
                                : null}
                            {that.props.activePracticePermissions.PatientCommunications || that.props.allowAllPermissions ? (
                                    <Menu.Item key="allopath">
                                        <Link
                                            to={this.props.currentPatient ? `/erp/patient/${this.props.currentPatient.id}/allopath` : '/erp/patients/allopath'}
                                        >
                                            <Icon type="audit"/><span className="nav-text">Allopath History</span>
                                        </Link>
                                    </Menu.Item>
                                )
                                : null}
                            {that.props.activePracticePermissions.PatientBookings || that.props.allowAllPermissions ? (
                                    <Menu.Item key="booking" disabled={!this.props.currentPatient}>
                                        <Link
                                            to={this.props.currentPatient ? `/erp/patient/${this.props.currentPatient.id}/booking` : '/erp/patients/communications'}
                                        >
                                            <Icon type="book"/><span className="nav-text">Boo<span
                                            className="shortcutLetterHighlight"
                                        >k
                                                                                      </span>ing
                                                        </span>
                                        </Link>
                                    </Menu.Item>
                                )
                                : null}

                        </Menu.ItemGroup>
                        <Menu.ItemGroup key="g2" title={<Divider style={{ margin: '0px' }}>EMR</Divider>}>
                            {/* <SubMenu key="nestedsub1" title={<span>EMR</span>}> */}
                            {that.props.activePracticePermissions.PatientVitalSigns || that.props.allowAllPermissions ? (
                                    <Menu.Item key="20">
                                        <Link
                                            to={this.props.currentPatient ? `/erp/patient/${this.props.currentPatient.id}/emr/vitalsigns` : '/erp/patients/emr/vitalsigns'}
                                        >
                                            <Icon type="heart"/><span className="nav-text">Report <span
                                            className="shortcutLetterHighlight"
                                        >M
                                                                                           </span>anual
                                                         </span>
                                        </Link>
                                    </Menu.Item>
                                )
                                : null}
                            {that.props.activePracticePermissions.PatientClinicalNotes || that.props.allowAllPermissions ? (
                                    <Menu.Item key="21">
                                        <Link
                                            to={this.props.currentPatient ? `/erp/patient/${this.props.currentPatient.id}/emr/clinicnotes` : '/erp/patients/emr/clinicnotes'}
                                        >
                                            <Icon type="solution"/><span className="nav-text">Clinical <span
                                            className="shortcutLetterHighlight"
                                        >N
                                                                                                </span>otes
                                                            </span>
                                        </Link>
                                    </Menu.Item>
                                )
                                : null}
                            {that.props.activePracticePermissions.PatientTreatmentPlans || that.props.allowAllPermissions ? (
                                    <Menu.Item key="30">
                                        <Link
                                            to={this.props.currentPatient ? `/erp/patient/${this.props.currentPatient.id}/emr/plans` : '/erp/patients/emr/plans'}
                                        >
                                            <Icon type="read"/><span className="nav-text"><span
                                            className="shortcutLetterHighlight"
                                        >T
                                                                                   </span>reatment
                                    Plans
                                                        </span>
                                        </Link>
                                    </Menu.Item>
                                )
                                : null}
                            {that.props.activePracticePermissions.PatientCompletedProcedure || that.props.allowAllPermissions ? (
                                    <Menu.Item key="22">
                                        <Link
                                            to={this.props.currentPatient ? `/erp/patient/${this.props.currentPatient.id}/emr/workdone` : '/erp/patients/emr/workdone'}
                                        >
                                            <Icon type="check-circle"/><span className="nav-text">Completed Proced<span
                                            className="shortcutLetterHighlight"
                                        >u
                                                                                                           </span>re
                                                                </span>
                                        </Link>
                                    </Menu.Item>
                                )
                                : null}
                            {that.props.activePracticePermissions.PatientFiles || that.props.allowAllPermissions ? (
                                    <Menu.Item key="23">
                                        <Link
                                            to={this.props.currentPatient ? `/erp/patient/${this.props.currentPatient.id}/emr/files` : '/erp/patients/emr/files'}
                                        >
                                            <Icon type="picture"/><span className="nav-text">Fi<span
                                            className="shortcutLetterHighlight"
                                        >l
                                                                                        </span>es
                                                           </span>
                                        </Link>
                                    </Menu.Item>
                                )
                                : null}
                            {that.props.activePracticePermissions.PatientPrescriptions || that.props.allowAllPermissions ? (
                                    <Menu.Item key="24">
                                        <Link
                                            to={this.props.currentPatient ? `/erp/patient/${this.props.currentPatient.id}/emr/prescriptions` : '/erp/patients/emr/prescriptions'}
                                        >
                                            <Icon type="solution"/><span className="nav-text">Pre<span
                                            className="shortcutLetterHighlight"
                                        >s
                                                                                          </span>criptions
                                                            </span>
                                        </Link>
                                    </Menu.Item>
                                )
                                : null}
                            {that.props.activePracticePermissions.PatientTimeline || that.props.allowAllPermissions ? (
                                    <Menu.Item key="25" disabled={!this.props.currentPatient}>
                                        <Link
                                            to={this.props.currentPatient ? `/erp/patient/${this.props.currentPatient.id}/emr/timeline` : '/erp/patients/profile'}
                                        >
                                            <Icon type="clock-circle"/><span className="nav-text">Timeline <span
                                            className="shortcutLetterHighlight"
                                        >w
                                                                                                    </span>
                                                                </span>
                                        </Link>
                                    </Menu.Item>
                                )
                                : null}
                            {that.props.activePracticePermissions.PatientLabOrders || that.props.allowAllPermissions ? (
                                    <Menu.Item key="26" disabled={!this.props.currentPatient || true}>
                                        <Link
                                            to={this.props.currentPatient ? `/erp/patient/${this.props.currentPatient.id}/emr/labtrackings` : '/erp/patients/profile'}
                                        >
                                            <Icon type="solution"/><span className="nav-text">Lab Orders</span>
                                        </Link>
                                    </Menu.Item>
                                )
                                : null}
                        </Menu.ItemGroup>
                        {/* </SubMenu> */}
                        <Menu.ItemGroup key="g3" title={<Divider style={{ margin: '0px' }}>Billing</Divider>}>

                            {that.props.activePracticePermissions.PatientInvoices || that.props.allowAllPermissions ? (
                                    <Menu.Item key="27">
                                        <Link
                                            to={this.props.currentPatient ? `/erp/patient/${this.props.currentPatient.id}/billing/invoices` : '/erp/patients/billing/invoices'}
                                        >
                                            <Icon type="audit"/><span className="nav-text"><span
                                            className="shortcutLetterHighlight"
                                        >I
                                                                                    </span>nvoices
                                                         </span>
                                        </Link>
                                    </Menu.Item>
                                )
                                : null}

                            {that.props.activePracticePermissions.PatientInvoices || that.props.allowAllPermissions ? (
                                    <Menu.Item key="40">
                                        <Link
                                            to={this.props.currentPatient ? `/erp/patient/${this.props.currentPatient.id}/proforma-invoice` : '/erp/patients/proforma-invoice'}
                                        >
                                            <Icon type="audit"/><span className="nav-text">
                                            {/*<span className="shortcutLetterHighlight">I</span>*/}
                                            Proforma Invoices</span>
                                        </Link>
                                    </Menu.Item>
                                )
                                : null}
                            {that.props.activePracticePermissions.PatientReturns || that.props.allowAllPermissions ? (
                                    <Menu.Item key="31">
                                        <Link
                                            to={this.props.currentPatient ? `/erp/patient/${this.props.currentPatient.id}/billing/return/invoices` : '/erp/patients/billing/return/invoices'}
                                        >
                                            <Icon type="redo"/><span className="nav-text">Invoices R<span
                                            className="shortcutLetterHighlight"
                                        >e
                                                                                             </span>turn
                                                        </span>
                                        </Link>
                                    </Menu.Item>
                                )
                                : null}
                            {that.props.activePracticePermissions.PatientPayments || that.props.allowAllPermissions ? (
                                    <Menu.Item key="28">
                                        <Link
                                            to={this.props.currentPatient ? `/erp/patient/${this.props.currentPatient.id}/billing/payments` : '/erp/patients/billing/payments'}
                                        >
                                            <Icon type="dollar"/><span className="nav-text">Pa<span
                                            className="shortcutLetterHighlight"
                                        >y
                                                                                       </span>ments
                                                          </span>
                                        </Link>
                                    </Menu.Item>
                                )
                                : null}
                            {that.props.activePracticePermissions.PatientLedger || that.props.allowAllPermissions ? (
                                    <Menu.Item key="29" disabled={!this.props.currentPatient}>
                                        <Link
                                            to={this.props.currentPatient ? `/erp/patient/${this.props.currentPatient.id}/billing/ledger` : '/erp/patients/profile'}
                                        >
                                            <Icon type="book"/><span className="nav-text">Led<span
                                            className="shortcutLetterHighlight"
                                        >g
                                                                                      </span>er
                                                        </span>
                                        </Link>
                                    </Menu.Item>
                                )
                                : null}
                            {this.props.currentPatient && this.props.currentPatient.is_agent && (that.props.activePracticePermissions.PatientLedger || that.props.allowAllPermissions) ? (
                                    <Menu.Item key="32" disabled={!this.props.currentPatient}>
                                        <Link
                                            to={this.props.currentPatient ? `/erp/patient/${this.props.currentPatient.id}/billing/wallet` : '/erp/patients/profile'}
                                        >
                                            <Icon type="wallet"/><span className="nav-text">Wallet Ledger</span>
                                        </Link>
                                    </Menu.Item>
                                )
                                : null}
                        </Menu.ItemGroup>
                    </Menu>

                </Sider>
            </Hotkeys>
        );
    }
}

export default PatientSider;
