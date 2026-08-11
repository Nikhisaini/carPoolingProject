import axios from "axios";

const verifyDrivingLicence = async (licenceNumber, dob) => {
  const response = await axios.post(
    `${process.env.CASHFREE_BASE_URL}/verification/driving-license`,
    {
      verification_id: `licence_${Date.now()}`,
      dl_number: licenceNumber,
      dob,
    },
    {
      headers: {
        "x-client-id": process.env.CASHFREE_CLIENT_ID,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    },
  );

  return response.data;
};
export default verifyDrivingLicence;
