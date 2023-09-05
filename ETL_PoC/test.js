const MAX_RETRY_COUNT = 3;
const RETRY_DELAY_MS = 1000; // Adjust this delay as needed (in milliseconds)

const backupAdvanceDetail = async (requestQueue, updateTable, signal) => {
  for (let i = 0; i < requestQueue?.length; i += 1) {
    await makeRequestWithRetry(requestQueue?.[i], updateTable, signal);
  }
};

const makeRequestWithRetry = async (requestData, updateTable, signal, retryCount = 0) => {
  try {
    const portfolioReqList = requestData.portfolioReqList;
    const response = await APIService(
      { portfolioReqList },
      apiConfig.portfolioAdvanceDetailEndpoint,
      undefined,
      true,
      false,
      signal
    );

    updateTable(requestData, response);
  } catch (error) {
    if (error.response && error.response.status >= 500 && retryCount < MAX_RETRY_COUNT) {
      // Retry after a delay
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      await makeRequestWithRetry(requestData, updateTable, signal, retryCount + 1);
    } else {
      // Handle the error after max retries or for non-5xx errors
      const errorValue = {
        response: {
          measureValue: "ERROR",
          benchMarkname: null
        }
      };
      updateTable(requestData, errorValue);
    }
  }
};
