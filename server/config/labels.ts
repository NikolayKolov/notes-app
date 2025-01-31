export const labels = {
    errorCreateDB: 'databaseCreateError',
    errorFindDB: 'databaseSelectError',
    errorDeleteDB: 'databaseDeleteError',
    errorDefaultDB: 'databaseError',
    errorUpdateDB: 'databaseUpdateError',
    errorUserCreate: 'Could not create user, please try again later',
    errorUserExists: (email: string): string => `User with email ${email} already exists in database`,
    errorAuth: 'authenticationError',
    errorAuthDefaultMessage: 'Unauthorized access',
    errorAuthCredentials: 'Invalid login credentials, please logout and login again',
    errorMissingUser: (email: string): string => `User with email ${email} not found in database`,
    errorUnverifiedUser: 'Your account in not yet verified, please click the verification link in your email',
    errorWrongEmailUUID: 'The system could not verify your link, please check if it is copied correctly',
    errorExpiredEmailUUID: 'Your email verification link has expired',
    errorIP: 'Possible malicious login detected, please verify IP in email',
    errorPassword: 'Wrong password',
    errorDefault: 'Could not perform action right now, please try again later',
    errorNoteOwner: 'User has no rights to edit this note',
    errorNoteUpdateMissing: "Could not perform update, note doesn't exist",
    errorNoteItemUpdateMissing: "Could not perform update, note item doesn't exist",
    errorNoteDeleteMissing: "Could not perform deletion, note doesn't exist",
    errorNoteFindMissing: "Could not perform action, note doesn't exist",
    passwordLowerCase: 'Must have at least one lowercase letter',
    passwordUpperCase: 'Must have at least one capital letter',
    passwordNumber: 'Must have at least one number',
    passwordSpecial: 'Must have at least one of these characters: !@#$%^&*()',
    passwordRetypeError: "Passwords don't match",
    noteTitleShort: 'Note title must be at least 2 characters long',
    noteContentShort: 'Note content must be at least 10 characters long',
    noteItemTextShort: 'Note item text must be at least 2 characters long',
    errorNoteValidation: 'Note input validation failed'
}