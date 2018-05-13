const ref = require('ref');

// Refer to following link for LexActivator API docs:
// https://github.com/cryptlex/lexactivator-c/blob/master/examples/LexActivator.h

const { LexActivator, PermissionFlags, LexStatusCodes, LicenseCallback } = require('./LexActivator');

function init() {
    let status;
    // status = LexActivator.SetProductFile("ABSOLUTE_PATH_OF_PRODUCT.DAT_FILE");
    status = LexActivator.SetProductData("PASTE_CONTENT_OF_PRODUCT.DAT_FILE");
    if (LexStatusCodes.LA_OK != status) {
        console.log("Error Code:", status);
        process.exit(status);
    }

    status = LexActivator.SetProductId("PASTE_PRODUCT_ID", PermissionFlags.LA_USER);
    if (LexStatusCodes.LA_OK != status) {
        console.log("Error Code:", status);
        process.exit(status);
    }

    status = LexActivator.SetAppVersion("PASTE_YOUR_APP_VERION");
    if (LexStatusCodes.LA_OK != status) {
        console.log("Error Code:", status);
        process.exit(status);
    }
}

function activate() {
    let status;
    status = LexActivator.SetLicenseKey("PASTE_LICENCE_KEY");
    if (LexStatusCodes.LA_OK != status) {
        console.log("Error Code:", status);
        process.exit(status);
    }

    status = LexActivator.SetActivationMetadata("key1", "value1");
    if (LexStatusCodes.LA_OK != status) {
        console.log("Error Code:", status);
        process.exit(status);
    }

    status = LexActivator.ActivateLicense()
    if (LexStatusCodes.LA_OK == status || LexStatusCodes.LA_EXPIRED == status || LexStatusCodes.LA_SUSPENDED == status) {
        console.log("License activated successfully:", status);
    } else {
        console.log("License activation failed:", status);
    }
}

function activateTrial() {
    let status;
    status = LexActivator.SetTrialActivationMetadata("key1", "value1");
    if (LexStatusCodes.LA_OK != status) {
        console.log("Error Code:", status);
        process.exit(status);
    }

    status = LexActivator.ActivateTrial()
    if (LexStatusCodes.LA_OK == status) {
        console.log("Product trial activated successfully!");
    } else if (LexStatusCodes.LA_TRIAL_EXPIRED == status) {
        console.log("Product trial has expired!");
    } else {
        console.log("Product trial activation failed:", status);
    }
}

function main() {
    init();
    let status;
    LexActivator.SetLicenseCallback(LicenseCallback(function(status){
        console.log("License status", status);
    }));
    status = LexActivator.IsLicenseGenuine();
    if (LexStatusCodes.LA_OK == status) {
        const expiryDate = ref.alloc(ref.types.uint32);
        LexActivator.GetLicenseExpiryDate(expiryDate);
        const daysLeft = (expiryDate.deref() - (new Date().getTime() / 1000)) / 86500;
        console.log("Days left:", daysLeft);

        const buffer = new Buffer(256);
        buffer.type = ref.types.char;
        LexActivator.GetLicenseUserName(buffer, buffer.length);
        console.log("License user name: %s\n", buffer.toString());

        console.log("License is genuinely activated!");
    } else if (LexStatusCodes.LA_EXPIRED == status) {
        console.log("License is genuinely activated but has expired!");
    } else if (LexStatusCodes.LA_SUSPENDED == status) {
        console.log("License is genuinely activated but has been suspended!");
    } else if (LexStatusCodes.LA_GRACE_PERIOD_OVER == status) {
        console.log("License is genuinely activated but grace period is over!");
    } else {
        let trialStatus;
        trialStatus = LexActivator.IsTrialGenuine();
        if (LexStatusCodes.LA_OK == trialStatus) {
            const trialExpiryDate = ref.alloc(ref.types.uint32);
            LexActivator.GetTrialExpiryDate(trialExpiryDate);
            const daysLeft = (trialExpiryDate.deref() - (new Date().getTime() / 1000)) / 86500;
            console.log("Trial days left:", daysLeft);
        } else if (LexStatusCodes.LA_TRIAL_EXPIRED == trialStatus) {
            console.log("Trial has expired!");
            // Time to buy the license and activate the app
            activate();
        } else {
            console.log("Either trial has not started or has been tampered!");
            // Activating the trial
            activateTrial();
        }
    }
}

main();