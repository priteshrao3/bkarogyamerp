import React from "react";
import {Layout, Spin} from "antd";
import {Route, Switch} from "react-router-dom";
import moment from 'moment';
import ReportsHeader from "./ReportsHeader";
import AmountDueReportHome from "./amountdue/AmountDueReportHome";
import AppointmentsReportHome from "./appointments/AppointmentsReportHome";
import EMRReportHome from "./emr/EMRReportHome";
import ExpensesReportHome from "./expenses/ExpensesReportHome";
import IncomeReportHome from "./income/IncomeReportHome";
import InventoryReportHome from "./inventory/InventoryReportHome";
import PatientsReportHome from "./patients/PatientsReportHome";
import PaymentsReportHome from "./payments/PaymentsReportHome";
import DailySummaryReport from "./summary/DailySummaryReport";
import BedBookingHome from "./booking/BedBookingHome";
import PermissionDenied from "../common/errors/PermissionDenied";
import InventoryDetailsReportHome from "./inventorydetails/InventoryDetailsReportHome";
import MlmReportHome from "./mlm/MlmReportHome";
import SuggestionHome from "./suggestions/SuggestionHome";
import InvoiceReturnHome from "./invoiceReturn/InvoiceReturnHome";
import {loadMailingUserListForReportsMail} from "../../utils/clinicUtils";
import TasksReportHome from "./tasks/TasksReportHome";

const {Content} = Layout;

class ReportsHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: moment(),
            endDate: moment(),
            active_practiceId: this.props.active_practiceId,
            mailingUsersList: []
        }
        this.reportsDateRange = this.reportsDateRange.bind(this);
    }

    componentDidMount() {
        loadMailingUserListForReportsMail(this);
    }

    reportsDateRange(dateString) {
        this.setState({
            startDate: moment(dateString[0], 'DD/MM/YYYY'),
            endDate: moment(dateString[1], 'DD/MM/YYYY'),
        });
    }

    render() {

        const that = this;
        return (
            <Layout>
                <ReportsHeader reportsDateRange={this.reportsDateRange} {...this.props} />
                <Spin spinning={this.state.loadingMailingUserList}>
                    <Content style={{margin: '16px'}} key={this.state.loadingMailingUserList}>
                        <Switch>
                            <Route
                              exact
                              path="/erp/reports/amountdue"
                              render={(route) => (that.props.activePracticePermissions.ReportsAmountDue || that.props.allowAllPermissions ?
                                        <AmountDueReportHome {...this.props} {...this.state} {...route} /> :
                                        <PermissionDenied />
                                )}
                            />

                            <Route
                              exact
                              path="/erp/reports/emr"
                              render={(route) => (that.props.activePracticePermissions.ReportsEMR || that.props.allowAllPermissions ?
                                        <EMRReportHome {...this.props} {...this.state} {...route} /> :
                                        <PermissionDenied />
                                )}
                            />
                            <Route
                              exact
                              path="/erp/reports/expenses"
                              render={(route) => (that.props.activePracticePermissions.ReportsExpenses || that.props.allowAllPermissions ?
                                        <ExpensesReportHome {...this.props} {...this.state} {...route} /> :
                                        <PermissionDenied />
                                )}
                            />
                            <Route
                              exact
                              path="/erp/reports/income"
                              render={(route) => (that.props.activePracticePermissions.ReportsIncome || that.props.allowAllPermissions ?
                                        <IncomeReportHome {...this.props} {...this.state} {...route} /> :
                                        <PermissionDenied />
                                )}
                            />
                            <Route
                              exact
                              path="/erp/reports/inventory"
                              render={(route) => (that.props.activePracticePermissions.ReportsInventory || that.props.allowAllPermissions ?
                                        <InventoryReportHome {...this.props} {...this.state} {...route} /> :
                                        <PermissionDenied />
                                )}
                            />

                            <Route
                              exact
                              path="/erp/reports/inventoryretails"
                              render={(route) => (that.props.activePracticePermissions.ReportsInventoryRetail || that.props.allowAllPermissions ?
                                        <InventoryDetailsReportHome {...this.props} {...this.state} {...route} /> :
                                        <PermissionDenied />
                                )}
                            />

                            <Route
                              exact
                              path="/erp/reports/patients"
                              render={(route) => (that.props.activePracticePermissions.ReportsPatients || that.props.allowAllPermissions ?
                                        <PatientsReportHome {...this.props} {...this.state} {...route} /> :
                                        <PermissionDenied />
                                )}
                            />
                            <Route
                              exact
                              path="/erp/reports/payments"
                              render={(route) => (that.props.activePracticePermissions.ReportsPayments || that.props.allowAllPermissions ?
                                        <PaymentsReportHome {...this.props} {...this.state} {...route} /> :
                                        <PermissionDenied />
                                )}
                            />
                            <Route
                              exact
                              path="/erp/reports/summary"
                              render={(route) => (that.props.activePracticePermissions.ReportsDailySummary || that.props.allowAllPermissions ?
                                        <DailySummaryReport {...this.props} {...this.state} {...route} /> :
                                        <PermissionDenied />
                                )}
                            />
                            <Route
                              exact
                              path="/erp/reports/bed_booking"
                              render={(route) => (that.props.activePracticePermissions.ReportsBedBooking || that.props.allowAllPermissions ?
                                        <BedBookingHome {...this.props} {...this.state} {...route} /> :
                                        <PermissionDenied />
                                )}
                            />
                            <Route
                              exact
                              path="/erp/reports/mlm"
                              render={(route) => (that.props.activePracticePermissions.ReportsMLMReport || that.props.allowAllPermissions ?
                                        <MlmReportHome {...this.props} {...this.state} {...route} /> :
                                        <PermissionDenied />
                                )}
                            />

                            <Route
                              exact
                              path="/erp/reports/invoice-return"
                              render={(route) => (that.props.activePracticePermissions.ReportsMLMReport || that.props.allowAllPermissions ?
                                        <InvoiceReturnHome {...this.props} {...this.state} {...route} /> :
                                        <PermissionDenied />
                                )}
                            />
                            <Route
                                exact
                                path="/erp/reports/tasks"
                                render={(route) => (that.props.activePracticePermissions.ReportsTaskTrack || that.props.allowAllPermissions ?
                                        <TasksReportHome {...this.props} {...this.state} {...route} /> :
                                        <PermissionDenied />
                                )}
                            />

                            {/* <Route exact path="/reports/agent/tree" */}
                            {/*       render={(route) => (that.props.activePracticePermissions.ReportsMLMReport || that.props.allowAllPermissions ? */}
                            {/*               <AgentTree {...this.props} {...this.state} {...route}/> : <PermissionDenied/> */}
                            {/*       )}/> */}

                            <Route
                              exact
                              path="/erp/reports/suggestions"
                              render={(route) => (that.props.activePracticePermissions.ReportsSuggestions || that.props.allowAllPermissions ?
                                        <SuggestionHome {...this.props} {...this.state} {...route} /> :
                                        <PermissionDenied />
                                )}
                            />
                            <Route
                              render={(route) => (that.props.activePracticePermissions.ReportsAppointments || that.props.allowAllPermissions ?
                                        <AppointmentsReportHome {...this.props} {...this.state} {...route} /> :
                                        <PermissionDenied />
                                )}
                            />
                        </Switch>
                    </Content>
                </Spin>
            </Layout>
        )
    }
}

export default ReportsHome;
