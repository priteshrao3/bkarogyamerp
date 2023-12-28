import React from "react";
import { Route, Switch } from 'react-router-dom';
import { Layout } from "antd";
import PracticeDetails from "./options/practice-detail/PracticeDetails"
import PracticeStaff from "./options/practice-staff/PracticeStaff";
import AddEditDoctor from "./options/practice-staff/AddEditDoctor";
import AddEditStaff from "./options/practice-staff/AddEditStaff";
import EditGroupPermission from "./options/practice-staff/EditGroupPermission";
import AddPracticeDetails from "./options/practice-detail/AddPracticeDetails";
import CommunicationSettings from "./options/communication-settings/CommunicationSettings";
import RecentProcedure from "./options/procedure-catalog/RecentProcedure";
import BillingSettings from "./options/billing/BillingSettings";
import EMRSettings from "./options/emr/EMRSettings";
import EditPracticeDetail from "./options/practice-detail/EditPracticeDetail";
import Prescriptions from "./options/prescriptions/Prescriptions";
import ExpensesTypes from "./options/expenses-types/ExpensesTypes";
import MedicalHistory from "./options/medical-history/MedicalHistory";
import Error404 from "../common/errors/Error404";
import CalendarSettings from "./options/calendar/CalendarSettings"
import SettingSider from "./SettingSider";
import PermissionDenied from "../common/errors/PermissionDenied";
import MlmBase from "./options/mlm/MlmBase";
import Printout from "./options/printout/Printout";
import IntegrationHome from "./options/integration/IntegrationHome";
import MailPDFSettings from "./options/mailPDF/MailPDFSettings";
import BedPackages from "./options/bed-packages/BedPackages";
import RoomTypes from "./options/roomtypes/RoomTypes";
import LoyaltySettings from "./options/loyalty/LoyaltySettings";
import LabTracking from "./options/labs/LabTracking";
import MedicinePackages from "./options/medicine-packages/MedicinePackages";
import DiseaseList from "./options/disease-list/DiseaseList";
import AgentRolesList from "./options/agent-roles/AgentRoles";
import AddressSettings from "./options/address-settings";
import AssignManagerToEmployee from "./options/practice-staff/AssignManagerToEmployee";
import DropdownSettings from "./options/hr-settings/DropdownSettings";
import AddOrEditPractice from './options/practice-detail/AddOrEditPractice';

const { Content } = Layout;


class SettingsDash extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
    };
  }

  render() {
    return (
      <Content
        className="main-container"
        style={{
          // margin: '24px 16px',
          // padding: 24,
          minHeight: 280,
          // marginLeft: '200px'
        }}
      >
        <Layout>
          <SettingSider {...this.props} />
          <Content style={{
            margin: '24px 16px',
            // padding: 24,
            minHeight: 280,
            // marginLeft: '200px'
          }}
          >
            <Switch>
              <Route
                exact
                path="/erp/settings/clinics-staff/adddoctor"
                render={(route) => (this.props.activePracticePermissions.SettingsPracticeStaff || this.props.allowAllPermissions ?
                  <AddEditDoctor {...this.props} {...route} /> : <PermissionDenied />
                )}
              />
              <Route
                exact
                path="/erp/settings/clinics-staff/:doctorid/edit"
                render={(route) => (this.props.activePracticePermissions.SettingsPracticeStaff || this.props.allowAllPermissions ?
                  <AddEditDoctor {...this.props} {...route} /> : <PermissionDenied />
                )}
              />

              <Route
                exact
                path="/erp/settings/clinics-staff/addstaff"
                render={(route) => (this.props.activePracticePermissions.SettingsPracticeStaff || this.props.allowAllPermissions ?
                  <AddEditStaff {...this.props} {...route} /> : <PermissionDenied />
                )}
              />
              <Route
                exact
                path="/erp/settings/clinics-staff/staff/:staffid/edit"
                render={(route) => (this.props.activePracticePermissions.SettingsPracticeStaff || this.props.allowAllPermissions ?
                  <AddEditStaff {...this.props} {...route} /> : <PermissionDenied />
                )}
              />
               <Route
                exact
                path="/erp/settings/clinics-staff/addgroup"
                render={(route) => (this.props.activePracticePermissions.SettingsPracticeStaff || this.props.allowAllPermissions ?
                  <EditGroupPermission {...this.props} {...route} /> : <PermissionDenied />
                )}
              />
              <Route
                exact
                path="/erp/settings/clinics-staff/group/:id/edit"
                render={(route) => (this.props.activePracticePermissions.SettingsPracticeStaff || this.props.allowAllPermissions ?
                  <EditGroupPermission {...this.props} {...route} /> : <PermissionDenied />
                )}
              />
              {/* <Route
                exact
                path="/settings/clinics-staff/assignemployee"
                render={(route) =>
                  <AssignManagerToEmployee {...this.props} {...route} />
                }
              /> */}

              <Route
                path="/erp/settings/clinics-staff"
                render={(route) => (this.props.activePracticePermissions.SettingsPracticeStaff || this.props.allowAllPermissions ?
                  <PracticeStaff {...this.props} {...route} /> : <PermissionDenied />
                )}
              />
              <Route
                exact
                path="/erp/settings/clinics"
                render={(route) => (this.props.activePracticePermissions.SettingsPracticeDetail || this.props.allowAllPermissions ?
                  <PracticeDetails {...this.props} {...route} /> : <PermissionDenied />
                )}
              />
              <Route
                exact
                path="/erp/settings/clinics/add"
                render={(route) => (this.props.activePracticePermissions.SettingsPracticeDetail || this.props.allowAllPermissions ?
                  <AddOrEditPractice {...this.props} {...route} /> : <PermissionDenied />
                )}
              />
              <Route
                exact
                path="/erp/settings/clinics/:id/edit"
                render={(route) => (this.props.activePracticePermissions.SettingsPracticeDetail || this.props.allowAllPermissions ? (
                  <AddOrEditPractice
                    {...this.props}
                    practiceId={route.match.params.id}
                    {...route}
                  />
                ) :
                  <PermissionDenied />
                )}
              />
              <Route
                exact
                path="/erp/settings/communication-settings"
                render={(route) => (this.props.activePracticePermissions.SettingsCommunincations || this.props.allowAllPermissions ?
                  <CommunicationSettings {...this.props} {...route} /> : <PermissionDenied />
                )}
              />
              <Route
                exact
                path="/erp/settings/calendarsettings"
                render={(route) => (this.props.activePracticePermissions.SettingsCalendar || this.props.allowAllPermissions ?
                  <CalendarSettings {...this.props} {...route} /> : <PermissionDenied />
                )}
              />
              <Route
                path="/erp/settings/procedures"
                render={(route) => (this.props.activePracticePermissions.SettingsProcedureCatalog || this.props.allowAllPermissions ?
                  <RecentProcedure {...this.props} {...route} /> : <PermissionDenied />
                )}
              />
              <Route
                path="/erp/settings/billing"
                render={(route) => (this.props.activePracticePermissions.SettingsBilling || this.props.allowAllPermissions ?
                  <BillingSettings {...this.props} {...route} /> : <PermissionDenied />
                )}
              />
              <Route
                exact
                path="/erp/settings/loyalty"
                render={(route) => (this.props.activePracticePermissions.SettingsLoyalty || this.props.allowAllPermissions ?
                  <LoyaltySettings {...this.props} /> : <PermissionDenied />
                )}
              />
              <Route
                path="/erp/settings/emr"
                render={(route) => (this.props.activePracticePermissions.SettingsEMR || this.props.allowAllPermissions ?
                  <EMRSettings {...this.props} {...route} /> : <PermissionDenied />
                )}
              />
              {/* <Route exact path="/settings/loyalty/add" */}
              {/* render={(route) => (this.props.activePracticePermissions.SettingsLoyalty || this.props.allowAllPermissions ? */}
              {/* <AddOffer  {...this.props} {...route}/> : <PermissionDenied/> */}
              {/* )}/> */}
              <Route
                path="/erp/settings/prescriptions"
                render={(route) => (this.props.activePracticePermissions.SettingsPrescriptions || this.props.allowAllPermissions ?
                  <Prescriptions {...this.props} {...route} /> : <PermissionDenied />
                )}
              />
              <Route
                exact
                path="/erp/settings/expense-types"
                render={(route) => (this.props.activePracticePermissions.SettingsExpenseTypes || this.props.allowAllPermissions ?
                  <ExpensesTypes {...this.props} /> : <PermissionDenied />
                )}
              />
              <Route
                path="/erp/settings/labs"
                render={(route) => (this.props.activePracticePermissions.SettingsLabs || this.props.allowAllPermissions ?
                  <LabTracking {...this.props} {...route} /> : <PermissionDenied />
                )}
              />
              <Route
                exact
                path="/erp/settings/medical-history"
                render={(route) => (this.props.activePracticePermissions.SettingsMedicalHistory || this.props.allowAllPermissions ?
                  <MedicalHistory {...this.props} /> : <PermissionDenied />
                )}
              />
              <Route
                path="/erp/settings/agent-roles"
                render={(route) => (this.props.activePracticePermissions.SettingsAgentRoles || this.props.allowAllPermissions ? (
                  <AgentRolesList
                    {...this.state}
                    {...this.props}
                    {...route}
                    key={this.state.active_practiceId}
                  />
                ) : <PermissionDenied />)}
                            />
                            <Route
                              path="/erp/settings/mlm"
                              render={(route) => (this.props.activePracticePermissions.SettingsMLMSettings || this.props.allowAllPermissions ? (
                                        <MlmBase
                                          {...this.state}
                                          {...this.props}
                                          {...route}
                                          key={this.state.active_practiceId}
                                        />
                                    ) : <PermissionDenied />
                                )}
                            />
                            <Route
                              path="/erp/settings/printout"
                              render={(route) => (this.props.activePracticePermissions.SettingsPrintouts || this.props.allowAllPermissions ? (
                                        <Printout
                                          {...this.state}
                                          {...route}
                                          {...this.props}
                                          key={this.state.active_practiceId}
                                        />
                                    ) : <PermissionDenied />
                                )}
                            />
                            <Route
                              path="/erp/settings/mailpdfsettings"
                              render={(route) => (this.props.activePracticePermissions.SettingsEmailPDFSettings || this.props.allowAllPermissions ? (
                                        <MailPDFSettings
                                          {...this.state}
                                          {...route}
                                          {...this.props}
                                        />
                                    ) : <PermissionDenied />
                                )}
                            />
                            <Route
                              path="/erp/settings/hr"
                              render={(route) => (
                                    <DropdownSettings
                                      {...this.state}
                                      {...this.props}
                                      {...route}
                                    />
                                )}
                            />
                            <Route
                              exact
                              path="/erp/settings/roomtypes"
                              render={(route) => (this.props.activePracticePermissions.SettingsRoomTypes || this.props.allowAllPermissions ?
                                        <RoomTypes {...this.props} /> : <PermissionDenied />
                                )}
                            />
                            <Route
                              exact
                              path="/erp/settings/diseases"
                              render={(route) => (this.props.activePracticePermissions.SettingsDiseaseList || this.props.allowAllPermissions ?
                                        <DiseaseList {...this.props} /> : <PermissionDenied />
                                )}
                            />
                            <Route
                              path="/erp/settings/bed-packages"
                              render={(route) => (this.props.activePracticePermissions.SettingsBedPackages || this.props.allowAllPermissions ?
                                    <BedPackages {...this.state} {...this.props} {...route} /> : <PermissionDenied />)}
                            />

              
              <Route
                path="/erp/settings/mlm"
                render={(route) => (this.props.activePracticePermissions.SettingsMLMSettings || this.props.allowAllPermissions ? (
                  <MlmBase
                    {...this.state}
                    {...this.props}
                    {...route}
                    key={this.state.active_practiceId}
                  />
                ) : <PermissionDenied />
                )}
              />
              <Route
                path="/erp/settings/printout"
                render={(route) => (this.props.activePracticePermissions.SettingsPrintouts || this.props.allowAllPermissions ? (
                  <Printout
                    {...this.state}
                    {...route}
                    {...this.props}
                    key={this.state.active_practiceId}
                  />
                ) : <PermissionDenied />
                )}
              />
              <Route
                path="/erp/settings/mailpdfsettings"
                render={(route) => (this.props.activePracticePermissions.SettingsEmailPDFSettings || this.props.allowAllPermissions ? (
                  <MailPDFSettings
                    {...this.state}
                    {...route}
                    {...this.props}
                  />
                ) : <PermissionDenied />
                )}
              />
              <Route
                path="/erp/settings/integration"
                render={(route) => (
                  <IntegrationHome
                    {...this.state}
                    {...this.props}
                    {...route}
                  />
                )}
              />
              <Route
                exact
                path="/erp/settings/roomtypes"
                render={(route) => (this.props.activePracticePermissions.SettingsRoomTypes || this.props.allowAllPermissions ?
                  <RoomTypes {...this.props} /> : <PermissionDenied />
                )}
              />
              <Route
                exact
                path="/erp/settings/diseases"
                render={(route) => (this.props.activePracticePermissions.SettingsDiseaseList || this.props.allowAllPermissions ?
                  <DiseaseList {...this.props} /> : <PermissionDenied />
                )}
              />
              <Route
                path="/erp/settings/bed-packages"
                render={(route) => (this.props.activePracticePermissions.SettingsBedPackages || this.props.allowAllPermissions ?
                  <BedPackages {...this.state} {...this.props} {...route} /> : <PermissionDenied />)}
              />

              <Route
                path="/erp/settings/medicine-packages"
                render={(route) => (this.props.activePracticePermissions.SettingsMedicinePackages || this.props.allowAllPermissions ?
                  <MedicinePackages {...this.state} {...this.props} {...route} /> :
                  <PermissionDenied />)}
              />


              <Route
                exact
                path="/erp/settings/address-settings"
                render={(route) =>
                  <AddressSettings {...this.props} {...route} />}
              />

              {/* <Route path="/settings/zoom-user" */}
              {/*       render={(route) =>(this.props.activePracticePermissions.SettingsMedicinePackages || this.props.allowAllPermissions ? */}
              {/*           <ZoomUser {...this.state} {...this.props} {...route}/>:<PermissionDenied/>)}/> */}



              <Route component={Error404} />
            </Switch>
          </Content>
        </Layout>
      </Content>
    )
  }
}

export default SettingsDash;
