/** *
 * Status Constants
 * */

export const SUCCESS_MSG_TYPE = 'success';
export const WARNING_MSG_TYPE = 'warning';
export const ERROR_MSG_TYPE = 'error';
export const INFO_MSG_TYPE = 'info';

/** *
 * Data Keys Constants
 * */
export const USERNAME = 'username';
export const PASSWORD = 'password';
export const PHONE = 'mob';
export const EMAIL = 'email';
export const DOB = 'dob';
export const GENDER = 'gender';
export const FIRST_NAME = 'firstname';
export const LAST_NAME = 'lastname';
export const AUTH_TOKEN = 'token';
export const ROLE = 'role';
export const GROUP = 'group';
export const PRACTICE = 'practice';
export const MEDICAL_HISTORY_KEY = 'Medical History';
export const PATIENT_GROUP_KEY = 'Patient Group';

/** *
 * Form Data Types
 * */
export const INPUT_FIELD = 'input';
export const RADIO_FIELD = 'radio';
export const SELECT_FIELD = 'select';
export const SEARCH_FIELD = 'search_select';
export const MULTI_SELECT_FIELD = 'multiselect';
export const CHECKBOX_FIELD = 'checkbox';
export const SINGLE_CHECKBOX_FIELD = 'singlecheckbox';
export const NUMBER_FIELD = 'number';
export const DATE_PICKER = 'datepicker';
export const DATE_TIME_PICKER = 'datetimepicker';
export const TEXT_FIELD = 'textfield';
export const TIME_PICKER = 'timepicker';
export const COLOR_PICKER = 'colorpicker';
export const QUILL_TEXT_FIELD = 'quilltextfield';
export const SINGLE_IMAGE_UPLOAD_FIELD = 'singleimageupload';
export const MULTI_IMAGE_UPLOAD_FIELD = 'multiimageupload';
export const COUNTRY_FIELD = 'country';
export const STATE_FIELD = 'state';
export const CITY_FIELD = 'city';
export const PASSWORD_FIELD = 'password';
export const EMAIL_FIELD = 'email';
export const SMS_FIELD = 'sms_field';
export const DIVIDER_FIELD = 'divider_field';
export const MAIL_TEMPLATE_FIELD = 'mail_field';
export const LABEL_FIELD = 'label_field';
export const RATE_FIELD = 'rate_field';
export const FRAME_VIEW = 'frame';
/** *
 *Role
 * */
export const DOCTORS_ROLE = '3';
export const CALENDAR_SETTINGS = 'calendar_settings';

/** *Reports** */

/* Patient Reports */
export const NEW_PATIENTS = 'DETAILED';
export const DAILY_NEW_PATIENTS = 'DAILY';
export const EXPIRING_MEMBERSHIP = 'EXPIRED_MEMBERSHIP';
export const EXPIRING_REGISTRATION = 'EXPIRED_REGISTER';
export const PATIENTS_FIRST_APPOINTMENT = 'patientsfirstappointment';
export const MONTHLY_NEW_PATIENTS = 'MONTHLY';
export const NEW_MEMBERSHIP = 'NEW_MEMBERSHIP';
export const NEW_REGISTRATION = 'NEW_REGISTER';
export const ACTIVE_PATIENTS = 'ACTIVE';
export const FOLLOW_UP = 'FOLLOW_UP';
export const MEDICINE = 'MEDICINE';
export const SOURCE_REPORT = 'SOURCE';
export const PD_DOCTOR = 'PD_DOCTOR';
export const MEDICAL_HISTORY = 'MEDICAL_HISTORY';
export const RELIGION_WISE_PATIENT = 'RELIGION_WISE_PATIENT';
export const GROUP_REPORT_DATA = 'GROUP_REPORT_DATA';
export const PATIENT_CALL_NOTES = 'CALL_NOTES';

/* Appointment Reports */
export const ALL_APPOINTMENT = 'ALL';
export const APPOINTMENT_FOR_EACH_CATEGORY = 'CATEGORY';
export const CANCELLATION_NUMBERS = 'CANCEL_NUMBERS';
export const AVERAGE_WAITING_ENGAGED_TIME_DAY_WISE = 'DAILY_WAIT';
export const AVERAGE_WAITING_ENGAGED_TIME_MONTH_WISE = 'MONTHLY_WAIT';
export const REASONS_FOR_CANCELLATIONS = 'reasonsforcancellations';
export const DAILY_APPOINTMENT_COUNT = 'DAILY';
export const APPOINTMENT_FOR_EACH_DOCTOR = 'DOCTOR';
export const MONTHLY_APPOINTMENT_COUNT = 'MONTHLY';
export const APPOINTMENT_FOR_EACH_PATIENT_GROUP = 'PATIENT_GROUPS';
export const APPOINTMENT_FOR_PATIENT_CONVERSION = 'CONVERSION_REPORT';
export const APPOINTMENT_CANCELATION = 'APPOINTMENT_CANCEL';


/* Amount Due Reports */
export const TOTAL_AMOUNT_DUE = 'ALL';
export const AGEING_AMOUNT_DUE = 'AGEING';
export const AMOUNT_DUE_PER_DOCTOR = 'DOCTOR';
// export const AMOUNT_DUE_PER_PROCEDURE='c';
// export const UNSETTLED_INVOICE='d';


/* EMR Reports */
export const ALL_TREATMENTS = 'ALL';
export const DAILY_TREATMENT_COUNT = 'DAILY';
export const TREATMENTS_FOR_EACH_DOCTOR = 'DOCTOR';
export const MONTHLY_TREATMENT_COUNT = 'MONTHLY';
export const TREATMENT_FOR_EACH_CATEGORY = 'CATEGORY';

/* Inventory Retails */
export const ALL = 'ALL';

/* Expenses Reports */
export const ALL_EXPENSES = 'ALL';
export const DAILY_EXPENSES = 'DAILY';
export const MONTHLY_EXPENSES = 'MONTHLY';
export const EXPENSES_EACH_TYPE = 'EXPENSE_TYPE';

/* Inventory Reports */
export const ALL_INVENTORY = 'ALL';
export const DAILY_INVENTORY = 'DAILY';
export const MONTHLY_INVENTORY = 'MONTHLY';
export const TOP_INVENTORY = 'TOP';
export const MISMANAGED_INVENTORY = 'MISMANAGED';

/** Bed Booking Reports* */
export const DAILY_BOOKING_COUNT = 'DAILY';
export const MONTHLY_BOOKING_COUNT = 'MONTHLY';
export const MEDICINE_USAGE_COUNT = 'MEDICINE_COUNT';
export const BED_BOOKING_PACKAGE_COUNT = 'BED_PACKAGE_COUNT';

/** MLM Reports** */
export const MARGIN_TYPE_WISE = 'MARGIN';
export const PRODUCT_WISE = 'PRODUCT';
export const WALLET_BALANCE_AMOUNT = 'WALLET';
export const AGENT_TREE_VIEW = 'AGENTVIEW';
export const SEARCH_PATIENT_VALUE = 'SEARCHPATIENT';

/** Payments Reports* */
export const ALL_PAYMENTS = 'ALL';
export const PAYMENT_RECEIVED_PATIENT_GROUP = 'PATIENT_GROUPS';
export const PATIENTS_UNSETTLED_ADVANCE = 'UNSETTLED_ADVANCE';
export const MODE_OF_PAYMENTS = 'MODE_OF_PAYMENTS';

export const PAYMENT_RECEIVED_PER_MONTH = 'MONTHLY';
export const PAYMENT_RECEIVED_PER_DAY = 'DAILY';
export const PAYMENT_RECEIVED_PER_DOCTOR = 'DOCTOR';

export const CREDIT_NOTES = 'NOTES';
export const CREDIT_AMOUNT_PER_DOCTOR = 'DOCTOR';
// export const PATIENTS_UNSETTLED_ADVANCE='ADVANCE';

// export const PAYMENT_RECEIVED_PER_DOCTOR='DOCTOR';

export const PAYMENT_SETTLEMENT = 'SETTLED_ADVANCE';


export const PAYMENT_SETTLEMENT_PER_DOCTOR = 'SETTLEMENT_DOCTOR';
export const PAYMENT_REFUND = 'REFUND';


/* Income Reports */
export const ALL_INVOICE = 'ALL';
export const DAILY_INCOME = 'DAILY';
export const MONTHLY_INCOME = 'MONTHLY';
export const TAXED_INCOME = 'TAX';
export const DOCTOR_EACH_INCOME = 'DOCTOR';
export const PROCEDURE_INCOME = 'PROCEDURE';
export const PRODUCT_INCOME = 'PRODUCT';
export const PATIENT_GROUPS_INCOME = 'PATIENT_GROUPS';

/* Invoice Return Reports */
export const ALL_INVOICE_RETURN = 'ALL';
export const DAILY_WISE_RETURN_INVOICE = 'DAILY';
export const MONTHLY_WISE_RETURN_INVOICE = 'MONTHLY';
export const RETURN_INVOICE_FOR_EACH_TAX = 'TAX';
export const RETURN_INVOICE_FOR_EACH_PROCEDURE = 'PROCEDURE';
export const RETURN_INVOICE_FOR_EACH_PRODUCT = 'PRODUCT';
export const RETURN_INVOICE_FOR_EACH_DOCTOR = 'DOCTOR';
export const RETURN_INVOICE_FOR_EACH_PATIENT_GROUPS = 'PATIENT_GROUPS';

export const RELATION = 'Relation';

export const CHOOSE = 'Choose';

export const OTP_DELAY_TIME = 130;
export const MAX_PARTICIPANT = 100;
export const ASCENDING_ORDER = 'asc';

export const MEMBERSHIP_AMOUNT = 'Membership Amount.';
export const REGISTRATION_AMOUNT = 'Registration Amount';
export const INVOICE = 'Invoice';
export const FCM_TOKEN = 'user_token';
export const RECAPTCHA_TOKEN = 'recaptcha_token';

/* Task Reports */
export const AVG_RATING = 'RATING';
export const TASK_REPORT = 'TASK_REPORT';
export const ALL_USER_TARGET_SUMMARY = 'All_User_Target_Summary';
export const USER_WISE_TARGET_SUMMARY = 'user_wise_target_summary';
export const REMAINDER_DELAY_TIME=2; // in hours
export const REFRESH_TASK_TRACKER='300000'; // in milliseconds example 1sec=1000ms 5minutes=300000ms 15 minutes = 900000 milliseconds
export const REMAINDER_TASK_TRACKER_TITLE="Attention";
export const REMAINDER_TASK_TRACKER_MESSAGE="You have not shared any update in last 2 hours. Kindly update your task. It will be reported to Administration.";

