const MAX_RETRY_COUNT = 3;
const RETRY_DELAY_MS = 1000; // Adjust this delay as needed (in milliseconds)

const logAndRetry = (requestData, updateTable, signal, retryCount) => {
  console.log(`Request failed for request data:`, requestData);
  console.log(`Retrying in ${RETRY_DELAY_MS} milliseconds... Retry count: ${retryCount + 1}`);
  
  // Retry after a delay
  setTimeout(() => makeRequest(requestData, updateTable, signal, retryCount + 1), RETRY_DELAY_MS);
};

const makeRequest = (requestData, updateTable, signal, retryCount = 0) => {
  const portfolioReqList = requestData.portfolioReqList;
  APIService({ portfolioReqList }, apiConfig.portfolioAdvanceDetailEndpoint, undefined, true, false, signal)
    .then(response => {
      console.log(`Request succeeded for request data:`, requestData);
      updateTable(requestData, response);
    })
    .catch(error => {
      if (retryCount < MAX_RETRY_COUNT) {
        logAndRetry(requestData, updateTable, signal, retryCount);
      } else {
        // Handle the error after max retries
        console.log(`Max retry count reached for request data:`, requestData);
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

const backupAdvanceDetail = (requestQueue, updateTable, signal) => {
  for (let i = 0; i < requestQueue?.length; i += 1) {
    makeRequest(requestQueue?.[i], updateTable, signal);
  }
};
