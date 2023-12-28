import { BACKEND_BASE_URL } from '../config/connect';

/** *
 * API Connection URLs
 * */
export const API_URL = `${'https://clinic.bkarogyam.com'}/erp-api`;   //edited
export const CONFIG_API = 'users/config/';
export const FILE_UPLOAD_API = 'blogImage/';
export const MULTIPLE_FILE_UPLOAD_API = 'blogImage/multiple/';
export const FILE_UPLOAD_BASE64 = 'blogImage/create_with_base64/';
export const LOGIN_SEND_OTP = 'staff_login/send_otp/';
export const LOGIN_RESEND_OTP = 'staff_login/resend_otp/';
export const SIGNUP_URL = '';
export const RESET_PASSWORD = 'users/reset_password/';
export const CHANGE_PASSWORD = 'users/passwordchange/';
export const RESET_PASSWORD_MAIL = 'users/staff_reset_mail/';
export const LOGIN_URL = 'users/login/';
export const OTP_LOGIN_URL = 'staff_login/verify_otp/';
export const SWITCH_USER_STAFF_LOGIN = 'staff_login/switch/';
export const USER_DATA = 'users/user_clone/';
export const PRACTICESTAFF = 'clinics/%s/practice_staff/';
export const ENABLE_STAFF_IN_PRACTICE = 'staff/%s/practice_list/';
export const DOCTOR_VISIT_TIMING_API = 'clinics/%s/doctor_timing/';
export const USER_PRACTICE_PERMISSIONS = 'user_permissions/?staff=%s&practice=%s';
export const SET_USER_PERMISSION = 'user_permissions/';
export const SET_SPECIFIC_USER_PERMISSION = 'user_permissions/%s/';
export const ALL_PRACTICE = 'clinics/';
export const ALL_PERMISSIONS = 'users/all_permissions/';
export const UPDATE_BULK_PERMISSIONS = 'user_permissions/bulk/';
export const PRACTICE = 'clinics/%s/';
export const PRACTICE_DELETE = 'clinics/%s/delete_clinic/';
export const TAXES = 'clinics/%s/taxes/';
export const HSN_CODES = 'inventory_item/hsn_code/';
export const OFFERS = 'clinics/%s/offers/';
export const PAYMENT_MODES = 'clinics/%s/payment_modes/';
export const PROCEDURE_CATEGORY = 'clinics/%s/procedure_category/';
export const PROMO_CODE = 'promocode/';
export const SINGLE_PROMO_CODE = 'promocode/%s/';
export const SEND_PROMO_CODE_SMS = 'promocode/%s/promo_code_sms/';
export const CHECK_PROMO_CODE = 'promocode/promo_value/';

export const EMR_DIAGNOSES = 'clinics/%s/diagnoses/';
export const EMR_COMPLAINTS = 'clinics/%s/complaints/';
export const EMR_OBSERVATIONS = 'clinics/%s/observations/';
export const EMR_TREATMENTNOTES = 'clinics/%s/treatmentnotes/';
export const EMR_INVESTIGATIONS = 'clinics/%s/investigations/';
export const EMR_FILETAGS = 'clinics/%s/filetags/';
export const EMR_VITAL_SIGNS = 'clinics/%s/vital_sign/';
export const EMR_MEDICATION = 'clinics/%s/medication/';
export const APPOINTMENT_CATEGORIES = 'clinics/%s/appointment_category/';
export const ALL_PRACTICE_STAFF = 'staff/';
export const SINGLE_PRACTICE_STAFF_API = 'staff/%s/';

export const PATIENTS_LIST = 'patients/';
export const PATIENT_PROFILE = 'patients/%s/';
export const MERGE_PATIENTS = 'patients/merge_patients/';
export const STAFF_ROLES = 'staff/roles/';
export const MEDICAL_HISTORY = 'patients/history/?id=%s';
export const MEDICAL_HISTORY_LIST = 'patients/history/?id=1';

// export const PATIENT_MEDICAL_HISTORY = 'patients/history/?id=%s';
export const PATIENT_FILES = 'patients/files/';
export const ALL_PATIENT_FILES = 'patients/files/';
export const PATIENT_LEDGER = 'patients/%s/ledger/';
export const EXPENSE_TYPE = 'clinics/%s/expense_type/';
export const DRUG_CATALOG = 'clinics/%s/drugcatalog/';
export const SINGLE_DRUG_CATALOG = 'clinics/%s/drugcatalog/?id=%s';
export const LABTEST_API = 'clinics/%s/labtest/';
export const COMMUNICATONS_API = 'clinics/%s/communications/';
export const EMAIL_COMMUNICATONS_API = 'clinics/%s/email_communications/';
export const CALENDER_SETTINGS = 'clinics/%s/calender_settings/';
export const ALL_APPOINTMENT_API = 'appointment/';
export const APPOINTMENT_API = 'appointment/%s/';
export const APPOINTMENT_PERPRACTICE_API = 'appointment/?id=%s';
export const SINGLE_APPOINTMENT_PERPRACTICE_API = 'appointment/?id=%s&patient=%s';
export const PATIENT_GROUPS = 'patients/group/';
export const VITAL_SIGNS_API = 'patients/vital_sign/'; // ?patient=patientId&practice=practiceId
export const PRESCRIPTIONS_API = 'patients/prescriptions/'; // ?id=patientId&practice=practiceId
export const SINGLE_REATMENTPLANS_API = 'patients/procedure/?id=%s';
export const BLOCK_CALENDAR = 'appointment/block_calendar/';
export const APPOINTMENT_SCHEDULE = 'appointment/?practice=%s';
export const PATIENT_ALLOPATH_HISTORY = 'patients/allopath/';
export const PATIENT_NOTES = 'patients/patient_notes/?patient=%s&practice=%s';

export const LABPANEL_API = 'clinics/%s/labpanel/';
export const PATIENT_TIMELINE_API = 'patients/%s/combine_patient_report/';
export const PATIENT_TIMELINE_PDF = 'patients/%s/timeline_pdf/';
export const ALL_MEDICAL_CERITICATE_API = 'patients/medical_certificate/?practice=%s&page=%s';
export const MEDICAL_CERTIFICATE_API = 'patients/medical_certificate/?practice=%s&patient=%s';
export const MEDICAL_MEMBERSHIP_CANCEL_API = 'patients/cancel_membership/';
export const PATIENTS_MEMBERSHIP_API = 'patients/membership/?patient=%s';
export const PATIENT_MAILEDFILES = 'patients/files/';
/* DELETE OBJECT */
export const TREATMENTPLANS_API = 'patients/procedure/'; // ?id=patientId&complete=true/false
export const TREATMENTPLANS_MARK_COMPLETE_API = 'patients/complete_procedure/?id=%s&complete=%s';
export const ALL_PRESCRIPTIONS_API = 'patients/prescriptions/%s/';
export const INVOICES_API = 'invoice/';
export const SINGLE_INVOICES_API = 'invoice/%s/';
export const INVOICE_PDF_API = 'invoice/%s/get_pdf';
export const CREATE_OR_EDIT_INVOICES = 'invoice/';
export const SINGLE_INVOICE_API = 'invoice/%s/';
export const PATIENT_CLINIC_NOTES_API = 'patients/clinic_notes/';
export const PATIENT_PAYMENTS_API = 'payment/';
export const SINGLE_PAYMENT_API = 'payment/%s/';
export const BULK_PAYMENT_API = 'payment/bulk_payments/';
export const PRACTICE_PRINT_SETTING_API = 'clinics/%s/practice_print_settings/?type=%s&sub_type=%s';
export const SAVE_ALL_PRINT_SETTINGS = 'clinics/%s/all_print_settings/';
export const PATIENT_COMMUNICATION_HISTORY_API = 'users/sms_status_update/?user=%s';
export const PRESCRIPTION_TEMPLATE = 'clinics/%s/prescription_template/';
export const UNPAID_PRESCRIPTIONS = 'patients/unpaid_prescriptions/?id=%s';
export const CANCELINVOICE_GENERATE_OTP = 'patients/generate_otp/';
export const CANCELINVOICE_VERIFY_OTP = 'patients/verify_otp/';
export const CANCELINVOICE_RESENT_OTP = 'patients/resend_otp/';
export const INVOICE_RETURN_API = 'return/';
export const SINGLE_RETURN_API = 'return/%s/';
export const RETURN_INVOICE_PDF_API = 'return/%s/get_pdf';
// search and advanced search API
export const ADVANCED_SEARCH_PATIENT = 'patients/advance_search/';
export const SEARCH_PATIENT = 'patients/search/?name=%s';
export const PATIENT_PENDING_AMOUNT = 'patients/%s/pending_amount/';
export const AVAILABLE_ADVANCE = 'patients/%s/advance_payment/';
// extra data
export const EXTRA_DATA = 'clinics/extra_data/';
export const COUNTRY = 'patients/country/';
export const STATE = 'patients/state/';
export const CITY = 'patients/city/';
export const SOURCE = 'patients/source/';
export const EMAIL_FRAME_URL = 'patients/print/?type=%s&sub_type=%s&practice=%s&logo_url=%s';
export const REGISTRATION = 'clinics/registration/';
export const PATIENT_REGISTRATION = 'patients/registration/';

export const PATIENT_REGISTRATION_CANCEL = 'patients/cancel_registration/';
/**
 * Reports API
 * */

/** *Patient Reports* * */
export const PATIENTS_REPORTS = 'patients/new_patients';
export const ACTIVE_PATIENTS_REPORTS = 'patients/active_patients';
export const MEMBERSHIP_REPORT = 'patients/membership_report';
export const FIRST_APPOINTMENT_REPORTS = 'patients/first_appointment';
export const PATIENT_MEDICAL__REPORTS = 'patients/?medical_history';
export const PATIENT_RELIGION_WISE = 'patients/?religions';
export const REGISTRATION_REPORTS = 'patients/registration_report/';
export const MEMBERSHIP_REPORTS = 'patients/membership_report';
/** Appointment Reports* */
export const PATIENT_APPOINTMENTS_REPORTS = 'appointment/appointment_report';

/** EMR Reports* */
export const EMR_REPORTS = 'clinics/%s/emr_report';

/** Inventory Retails Reports* */
export const PRODUCTS_API = 'inventory_item/products/';
export const INVENTORY_RETAILS_REPORT = 'inventory_item/inventory_retail';

/** Expense Reports ** */
export const EXPENSE_PAYMENT_MODE_API = 'expenses';
export const EXPENSE_REPORT_API = 'expenses/report';
/** Inventory Reports** */
export const INVENTORY_REPORT_API = 'inventory_item/inventory_report';

/** MLM Reports* */
export const MLM_REPORTS = 'patients/mlm_report';
export const MLM_AGENT_WALLET = 'patients/agent_wallet_balance';
/** Payment Reports* */
export const PAYMENT_REPORTS = 'payment/payment_reports/';

/** Income Reports* */
export const INCOME_REPORTS = 'invoice/invoice_reports';

/** Return Invoice* */

export const RETURN_INVOICE_REPORTS = 'return/return_reports/';

/** Amount Due Reports * */
export const AMOUNT_DUE_REPORTS = 'invoice/amount_due/';

export const APPOINTMENT_REPORTS = 'clinics/%s/appointment_report/';
export const EXPENSE_REPORT = 'clinics/%s/expense_report/';
export const INVOICE_REPORTS = 'clinics/%s/invoice_report/';
// export const PATIENTS_REPORTS = 'clinics/%s/patients_report/';
export const PAYMENTS_REPORTS = 'clinics/%s/payments_report/';
export const TREATMENT_REPORTS = 'clinics/%s/treatment_report/';
export const DRUG_TYPE_API = 'clinics/%s/drugtype/';
export const DRUG_UNIT_API = 'clinics/%s/drugunit/';
export const PRINT_PREVIEW_RENDER = 'patients/print/';
export const MEMBERSHIP_API = 'clinics/membership/';
export const BED_BOOKING_REPORTS = 'clinics/seat_booking_report';
export const ACCEPT_PAYMENT = 'clinics/payment/';
// export const ACCEPT_PAYMENT = 'clinics/accept_payments/';

export const MAILING_USERS_LIST = '/users/reports_mail/';

/**
 * Blogs API
 * */

export const WEB_DYNAMIC_CONTENT = 'dynamic-data/';
export const WEB_DYNAMIC_SINGLE_CONTENT = 'dynamic-data/%s/';
export const APPLIED_CANDIDATES = 'apply-online/';
export const APPLIED_SINGLE_CANDIDATE = 'apply-online/%s/';
export const BLOG_POST = 'post/';
export const SINGLE_POST = 'post/%s/';
export const BLOG_VIDEOS = 'video/';
export const SINGLE_VIDEO = 'video/%s/';
export const BLOG_DISEASE = 'disease/';
export const SINGLE_DISEASE = 'disease/%s/';
export const BLOG_EVENTS = 'events/';
export const SINGLE_EVENTS = 'events/%s/';
export const BLOG_CONTACTUS = 'contactus/';
export const SINGLE_CONTACT = 'contactus/%s/';
export const BLOG_PAGE_SEO = 'page_seo/';
export const SINGLE_PAGE_SEO = 'page_seo/%s/';
export const BLOG_SLIDER = 'slider/';
export const SINGLE_SLIDER = 'slider/%s/';
export const BLOG_FACILITY = 'facility/';
export const SINGLE_FACILITY = 'facility/%s/';
export const LANDING_PAGE_CONTENT = 'landing_page_content/';
export const SINGLE_LANDING_PAGE_CONTENT = 'landing_page_content/%s/';
export const LANDING_PAGE_VIDEO = 'landing_page_video/';
export const SINGLE_LANDING_PAGE_VIDEO = 'landing_page_video/%s/';
export const MANAGE_PRODUCT = 'product_content/';
export const MANAGE_SINGLE_PRODUCT = 'product_content/%s/';
export const MANAGE_THERAPY = 'therapy_content/';
export const MANAGE_SINGLE_THERAPY = 'therapy_content/%s/';

/**
 * Mission Arogyam API
 * */
export const MISSION_BLOG_POST = 'arogyam_post/';
export const MISSION_SINGLE_POST = 'arogyam_post/%s/';
export const MISSION_BLOG_VIDEOS = 'arogyam_video/';
export const MISSION_SINGLE_VIDEO = 'arogyam_video/%s/';
export const MISSION_BLOG_DISEASE = 'arogyam_disease/';
export const MISSION_SINGLE_DISEASE = 'arogyam_disease/%s/';
export const MISSION_BLOG_EVENTS = 'arogyam_events/';
export const MISSION_SINGLE_EVENTS = 'arogyam_events/%s/';
export const MISSION_BLOG_CONTACTUS = 'arogyam_contactus/';
export const MISSION_SINGLE_CONTACT = 'arogyam_contactus/%s/';
export const MISSION_BLOG_PAGE_SEO = 'arogyam_page_seo/';
export const MISSION_SINGLE_PAGE_SEO = 'arogyam_page_seo/%s/';
export const MISSION_BLOG_SLIDER = 'arogyam_slider/';
export const MISSION_SINGLE_SLIDER = 'arogyam_slider/%s/';
export const MISSION_BLOG_FACILITY = 'arogyam_facility/';
export const MISSION_SINGLE_FACILITY = 'arogyam_facility/%s/';
export const MISSION_LANDING_PAGE_CONTENT = 'arogyam_landing_page_content/';
export const MISSION_SINGLE_LANDING_PAGE_CONTENT = 'arogyam_landing_page_content/%s/';
export const MISSION_LANDING_PAGE_VIDEO = 'arogyam_landing_page_video/';
export const MISSION_SINGLE_LANDING_PAGE_VIDEO = 'arogyam_landing_page_video/%s/';
export const MISSION_MANAGE_PRODUCT = 'arogyam_product_content/';
export const MISSION_MANAGE_SINGLE_PRODUCT = 'arogyam_product_content/%s/';
export const MISSION_MANAGE_THERAPY = 'arogyam_therapy_content/';
export const MISSION_MANAGE_SINGLE_THERAPY = 'arogyam_therapy_content/%s/';


/**
 * INVENTORY API
 * */

export const EXPENSES_API = 'expenses/';
export const SINGLE_EXPENSES_API = 'expenses/%s/';
export const VENDOR_API = 'clinics/%s/vendor/';
export const SINGLE_VENDOR_API = 'vendor/%s/';
export const ACTIVITY_API = 'activity/';
export const SUB_CATEGORY = 'activity/subcategory/';

export const CATEGORY = 'activity/category/';
export const SINGLE_ACTIVITY_API = 'activity/%s/';
export const LAB_API = 'lab/';
export const SINGLE_LAB_API = 'lab/%s/';
export const MANUFACTURER_API = 'manufacturer/';
export const SINGLE_MANUFACTURER_API = 'manufacturer/%s/';
export const INVENTORY_ITEM_API = 'inventory_item/';
export const SINGLE_INVENTORY_ITEM_API = 'inventory_item/%s/';
export const INVENTORY_API = 'inventory/';
export const SINGLE_INVENTORY_API = 'inventory/%s/';
export const ITEM_TYPE_STOCK = 'item_type_stock/';
export const SINGLE_ITEM_TYPE_STOCK = 'item_type_stock/%s/';
export const STOCK_ENTRY = 'stock_entry/%s/';
export const BULK_STOCK_ENTRY = 'stock_entry/bulk/';
export const SUPPLIER_API = 'stock_entry/practice_supplier';
export const SEARCH_THROUGH_QR = 'item_type_stock/find_item';
export const BILL_SUPPLIER = 'stock_entry/bills_suppliers/';
export const INVENTORY_ITEM_EXPORT = 'inventory_item/export';
export const INVENTORY_STOCK_TOTAL_COST = 'inventory_item/inventory_total/';
export const MIS_INVENTORY_REPORT = 'inventory_item/match_inventory/?practice=1';

// export const INVENTORY_STOCK_TOTAL_COST = 'inventory_item/inventory_total/';

/**
 * MLM API
 * */
export const ROLE_COMMISION = 'role_commission/';
export const PRODUCT_LEVEL = 'product_level';
export const PRODUCT_MARGIN = 'product_margin/';
export const SINGLE_PRODUCT_MARGIN = 'product_margin/%s/';
export const GENERATE_MLM_COMMISSON = 'product_margin/generate_mlm/';
export const AGENT_ROLES = 'role_commission/agent_roles/';
export const AGENT_WALLET = 'patient_wallet/?patient=%s';
export const WALLET_LEDGER = 'wallet_ledger/?patient=%s';
export const WALLET_LEDGER_SUM = 'wallet_ledger/ledger_sum/?patient=%s';
export const MY_AGENTS = 'patients/%s/my_agents/';
export const WALLET_LEDGER_REPORT = 'wallet_ledger/export';
export const WALLET_LEDGER_TOP_ADVISOR= 'wallet_ledger/top_advisor/';
/**
 * PDFs Links
 * */

export const PRESCRIPTION_PDF = 'patients/prescriptions_pdf/?id=%s';
export const VITAL_SIGN_PDF = 'patients/vital_sign_pdf/?id=%s';
export const CLINIC_NOTES_PDF = 'patients/clinic_notes_pdf/?id=%s';
export const TREATMENTPLANS_PDF = 'patients/treatment_plan_pdf/?id=%s';
export const MEDICAL_CERTIFICATE_PDF = 'patients/medical_certificate_pdf/?id=%s';
export const PAYMENT_PDF = 'payment/%s/get_pdf/';
export const BOOKING_PDF = 'clinics/%s/booking_pdf/?id=%s';
export const ADDRESS_TICKET_PDF = 'patients/%s/print_ticket/';
/**
 * Reservation System
 * */
export const ROOM_TYPE = 'clinics/%s/room_types/';
export const BED_PACKAGES = 'clinics/%s/bed_packages/';
export const MEDICINE_PACKAGES = 'clinics/%s/medicine_packages/';
export const BOOK_SEAT = 'clinics/%s/seat_booking/';
export const CHECK_SEAT_AVAILABILITY = 'clinics/%s/seat_availability/';
export const DISEASE_LIST = 'clinics/%s/other_diseases/';

/** Agent Tree** */
export const AGENT_TREE = 'patients/%s/agents_chain/';

/** suggestions* */
export const SUGGESTIONS = 'suggestions/';

/** Credentials Save* */
export const CREDENTIALS = '/api/authenticate';
export const SWITCH_PORTAL = '';
export const SAVE_CREDENTIALS = 'users/%s/task_login/';

/** Meetings* */
export const MEETING_USER = 'meetings/zoom_user/';
export const MEETINGS = 'meetings/';
export const MEETING_DETAILS = 'meetings/details/';
export const SINGLE_MEETING = 'meetings/%s/';
export const MEETING_CHAT = 'meetings/meeting_chat/';
export const MEETING_JOINEE = 'meetings/meeting_joinee/';

/** Alternate Medicine Conversion * */
export const ALTERNATE_MEDICINE = 'conversion/';
export const PATIENT_CALL_NOTES = 'patients/patient_notes_call/';
export const CONVERSION_DISEASE_CATEGORY = 'conversion/disease_category/';
export const CONVERSION_DISEASE_API = 'conversion/disease_list/';
export const CONVERSION_SYMPTOM_API = 'conversion/symptom_list/';
export const CONVERSION_MEDICINE_API = 'conversion/medicines/';
export const CONEVRSION_LIST_API = 'conversion/';
export const CONVERSION_DETAIL_API = 'conversion/%s/';

// hr setting
export const HR_SETTING = 'hr-settings/';
export const MANAGER_EMPLOYEE = 'staff/%s/employees/';
export const MANAGER_ADVISOR = 'staff/%s/advisors/';
export const HR_SETTINGS_DROPDOWN_LIST = 'hr-settings/dropdown/';
export const HR_SETTINGS = 'hr-settings/';

// Task Tracker
export const TASK_DETAILS = 'tasks/%s/details/';
export const TASK = 'tasks/';
export const SINGLE_TASK = 'tasks/%s/';

export const START_TASK = 'tasks/%s/start_task/';
export const STOP_TASK = 'tasks/%s/stop_task/';
export const COMPLETE_TASK = 'tasks/%s/complete_task/';
export const COMMENT_TASK = 'tasks/%s/comment/';
export const TASK_ASSIGNEE = 'tasks/assignee/';
export const TASK_REPORTER = 'tasks/reporter/';
export const RECURRING_TASK = 'tasks/templates/';
export const ASSIGN_RECURRING_TASK = 'tasks/assign_template/';
export const TASK_DATEWISE_RATING = 'tasks/datewise_ratings/';
export const TASK_RATING = 'tasks/rating/';
export const EMPLOYEE_TASK_SUMMARY = 'tasks/day_summary/';
export const RATING_REPORT = 'tasks/rating_reports/';
export const TASK_REPORT = 'tasks/task_reports/';
export const TARGET_HEADS = 'tasks/heads/';
export const TASK_MONTHLY_TARGET = 'tasks/monthly_targets/';
export const TASK_MONTHLY_TARGET_STATUS = 'tasks/month_target_status/';
export const TASK_USER_DAILY_TARGET = 'tasks/user_targets/';
export const TASK_USER_DAILY_TARGET_STATUS = 'tasks/user_target_status/';
export const Task_DEPARTMENT_DAILY_TARGET_STATUS = 'tasks/department_target_status/';

/* Group Report */
export const SINGLE_GROUP_PERMISSION_REPORT = 'staff/permission_group/?id=%s';
export const GROUP_PERMISSION_REPORT = 'staff/permission_group/';
export const SUBMIT_GROUP = 'staff/assign_group/';
export const USER_PERMISSION_VIEW = 'clinics/user_permissions/';


export const CALL_DATA = 'patients/cold_calling/';
export const APPOINTMENT_CANCELATION_REPORT = '/appointment/appointment_report/';
export const GROUP_DATA_REPORT = '/patients/';
export const PATIENT_CALL_DATA = 'patients/calling_report/';
export const TEAM_ANALYSIS_DATA = 'patients/%s/team_analysis/';
export const BANK_DETAILS_DATA = 'patients/bank_details/';
export const PROFORMA_INVOICE = 'proforma/';
export const PROFORMA_INVOICE_DETAIL = 'proforma/%s/';
export const PROFORMA_PDF = 'proforma/%s/get_pdf';
