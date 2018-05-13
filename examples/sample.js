const ref = require('ref');
const { LexActivator, PermissionFlags, LexStatusCodes, LicenseCallback } = require('./LexActivator');

function init() {
    let status;
    // status = LexActivator.SetProductFile("ABSOLUTE_PATH_OF_PRODUCT.DAT_FILE");
    status = LexActivator.SetProductData("PASTE_CONTENT_OF_PRODUCT.DAT_FILE");
    status = LexActivator.SetProductData("QjlCODg5NzUyREY2MUIwN0REN0I4RDZFNTM3RjRFNkE=.mT33uFEGj9lJcS3m+wh0mszNxPWUKS5DrDr82T58OW9+cvIHJDT7Eqz72mtJg4Acp7ieKwLHkFxLm3fgnA661lajQHCkpFJGlN01XROsXvDSr7aUyr28Hd1L+/5QbrH+9Ib2KJUi+JHjBNkb3a+Vc+Z7iB13B248asU2z2NZTFuBw/XA6ogprPM+ewVqQvrNT1Ha4YLyweWTjEKwEdj6QTA1LmsMGWZw65KxIP97EnYG8az3QgpFWNGh+Mquvfzo9QpKMdEWnDWz0Utim9DX41nWQoj9+Tq0nyPLukqJQTR5xEBnK35lUMkOnmvDp/hpc2GLdZ4biuLnnuSjHsbkuJDLdQ3rTJJnNzAWkDwNnBgg/vs/f7bDITYjZQv9ODxiIuiTaf1LK83c1bCRWQyErlezbYkzk6ejTnZNH8cLcmtxAiS2oH+M7E4L5uvCR3R0giTFuKzhTY6eFgjEe3dA38Mw0YJOJ4f+s341sY3umrHUDERwmEuh9TZhK96xQTU+nqmXM+jqPnakISq2q66T8RdMdF6/O5ldDNmpHPeFX/audyQrIxhFNeaTI7VfAtWqI0dVp0iS7PkM+PvE8fWSC2Ujj6PU7cQCyYOlv+NvvmNUIsU96aEbbi0B3uHYEY5Wftuzp7YcGw8NzlDfp54+t8rmtRwgOpfYxobVWfTb94rlwF8NOCzKhDVhw46e1WZQ3HLjx6UmNbg6GfXL2JvMPcZhb+n6SF+jvKev6aNV8H4=");
    if (LexStatusCodes.LA_OK != status) {
        console.log("Error Code:", status);
        process.exit(status);
    }

    status = LexActivator.SetProductId("PASTE_PRODUCT_ID", PermissionFlags.LA_USER);
    status = LexActivator.SetProductId("be4a98fb-563b-4c09-9f6f-c809d6bd45b9", LexStatusCodes.LA_USER);
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
    status = LexActivator.SetLicenseKey("1334F1-E2FE7-3A50D-80F4C-61EC5");
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