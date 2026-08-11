import cron from "node-cron";
import Licence from "../model/licence.js";
import verifyDrivingLicence from "../services/cashfreeVerification.js";

const verifyPendingLicences = async () => {
  try {
    const licences = await Licence.find({
      verificationStatus: "Pending",
    });

    for (const licence of licences) {
      try {
        if (!licence.dob) {
          licence.verificationResult = "ERROR";
          licence.verificationFailureReason =
            "Date of birth is missing from the licence";
          await licence.save();
          continue;
        }

        licence.verificationProvider = "Cashfree";
        licence.verificationAttemptedAt = new Date();
        licence.verificationFailureReason = null;
        licence.verificationResult = null;

        await licence.save();

        const dob = licence.dob.toISOString().split("T")[0];

        let cashfreeResponse;

        try {
          cashfreeResponse = await verifyDrivingLicence(
            licence.licenceNumber,
            dob,
          );
        } catch (error) {
          console.error(
            `Cashfree verification failed for licence ${licence._id}:`,
            error.response?.data || error.message,
          );

          licence.verificationResult = "ERROR";
          licence.verificationFailureReason =
            error.response?.data?.message ||
            error.response?.data?.error_msg ||
            error.message ||
            "Cashfree verification failed";

          await licence.save();

          continue;
        }

        licence.verificationReferenceId =
          cashfreeResponse.reference_id?.toString() || null;

        if (cashfreeResponse.status === "VALID") {
          licence.verificationResult = "VALID";
          licence.verificationFailureReason = null;
        } else {
          licence.verificationResult = "INVALID";
          licence.verificationFailureReason =
            cashfreeResponse.message ||
            cashfreeResponse.error_msg ||
            "Driving licence could not be verified.";
        }

        await licence.save();
      } catch (error) {
        console.error(
          `Licence verification cron error for ${licence._id}:`,
          error.message,
        );
      }
    }
  } catch (error) {
    console.error("Licence verification cron failed:", error);
  }
};

const startLicenceVerificationCron = () => {
  cron.schedule("5 0 * * *", verifyPendingLicences);
};

export default startLicenceVerificationCron;
