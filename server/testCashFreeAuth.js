import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const testCashfreeAuth = async () => {
  try {
    const response = await axios.post(
      `${process.env.CASHFREE_BASE_URL}/api/v1/credentials/verify`,
      {},
      {
        headers: {
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Cashfree Auth Response:");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log("Cashfree Auth Error:");

    if (error.response) {
      console.log(error.response.status);
      console.log(JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(error.message);
    }
  }
};

testCashfreeAuth();
