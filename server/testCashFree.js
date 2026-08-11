import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const testCashfreeDL = async () => {
  try {
    const url = `${process.env.CASHFREE_BASE_URL}/verification/driving-license`;

    console.log("URL:", url);
    console.log("Client ID:", process.env.CASHFREE_CLIENT_ID);

    const response = await axios.post(
      url,
      {
        verification_id: `test_${Date.now()}`,
        dl_number: "KA0120198900984",
        dob: "1994-08-05",
      },
      {
        headers: {
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Cashfree Response:");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log("Cashfree Error:");

    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Headers:", error.response.headers);
      console.log("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(error.message);
    }
  }
};

testCashfreeDL();
