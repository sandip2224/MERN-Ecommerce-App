const MAX_RETRY_COUNT = 3;
const RETRY_DELAY_MS = 1000; // Adjust this delay as needed (in milliseconds)

const backupAdvanceDetail = (requestQueue, updateTable, signal) => {
  const makeRequest = (requestData, retryCount = 0) => {
    const portfolioReqList = requestData.portfolioReqList;
    APIService({ portfolioReqList }, apiConfig.portfolioAdvanceDetailEndpoint, undefined, true, false, signal)
      .then(response => {
        updateTable(requestData, response);
      })
      .catch(error => {
        if (retryCount < MAX_RETRY_COUNT) {
          // Retry after a delay
          setTimeout(() => makeRequest(requestData, retryCount + 1), RETRY_DELAY_MS);
        } else {
          // Handle the error after max retries
          const errorValue = {
            response: {
              measureValue: "ERROR",
              benchMarkname: null
            }
          };
          updateTable(requestData, errorValue);
        }
      });
  };

  for (let i = 0; i < requestQueue?.length; i += 1) {
    makeRequest(requestQueue?.[i]);
  }
};
