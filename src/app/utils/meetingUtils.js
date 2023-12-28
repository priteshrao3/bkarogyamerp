export const joineeName = function (joineeObject) {
    if (joineeObject.id) {
        let userObject = null;
        if (joineeObject.staff && joineeObject.staff.id) {
            userObject = joineeObject.staff.user;
        } else if (joineeObject.patient && joineeObject.patient.id) {
            userObject = joineeObject.patient.user;
        }

        if (userObject && userObject.first_name) {
            return userObject.first_name;
        }
    }
    return null
}

export const joineeAvatar = function (joineeObject) {
    if (joineeObject.id) {
        let userObject = null;
        if (joineeObject.staff && joineeObject.staff.id) {
            userObject = joineeObject.staff.user;
        } else if (joineeObject.patient && joineeObject.patient.id) {
            userObject = joineeObject.patient.user;
        }

        if (userObject && userObject.first_name) {
            return userObject.first_name;
        }
    }
    return null
}
