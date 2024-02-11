import axios from 'axios';

export const verifyEmail = async (email: string) => {
  try {
    const response = await axios.get(
      `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=74835ea323261dc79cb747fc0f42f0910ad3fef9`,
    );

    const { data } = response.data;

    return (
      data.status === 'valid' &&
      data.regexp === true &&
      data.result === 'deliverable'
    );
  } catch (e) {
    console.error('Error verifying email:', e);
    return false;
  }
};
