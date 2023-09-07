const MAX_RETRY_COUNT = 3;
const RETRY_DELAY_MS = 1000; // Adjust this delay as needed (in milliseconds)

const logAndRetry = (i, updateTable, signal, retryCount) => {
  console.log(`Iteration ${i}: Request failed`);
  console.log(`Retrying in ${RETRY_DELAY_MS} milliseconds... Retry count: ${retryCount + 1}`);
  
  // Retry after a delay
  setTimeout(() => makeRequest(i, updateTable, signal, retryCount + 1), RETRY_DELAY_MS);
};

const makeRequest = (i, updateTable, signal, retryCount = 0) => {
  const requestData = requestQueue?.[i];
  if (!requestData) {
    console.log(`Iteration ${i}: Request data is null or undefined. Skipping this request.`);
    // Proceed to the next iteration
    processNextRequest(i + 1, updateTable, signal);
    return;
  }

  const portfolioReqList = requestData.portfolioReqList;
  APIService({ portfolioReqList }, apiConfig.portfolioAdvanceDetailEndpoint, undefined, true, false, signal)
    .then(response => {
      console.log(`Iteration ${i}: Request succeeded`);
      updateTable(requestData, response);
      // Proceed to the next iteration on success
      processNextRequest(i + 1, updateTable, signal);
    })
    .catch(error => {
      if (retryCount < MAX_RETRY_COUNT) {
        logAndRetry(i, updateTable, signal, retryCount);
      } else {
        // Handle the error after max retries
        console.log(`Iteration ${i}: Max retry count reached`);
        const errorValue = {
          response: {
            measureValue: "ERROR",
            benchMarkname: null
          }
        };
        updateTable(requestData, errorValue);
        // Proceed to the next iteration after max retries
        processNextRequest(i + 1, updateTable, signal);
      }
    });
};

const processNextRequest = (i, updateTable, signal) => {
  if (i < requestQueue?.length) {
    makeRequest(i, updateTable, signal);
  }
};

const backupAdvanceDetail = (requestQueue, updateTable, signal) => {
  processNextRequest(0, updateTable, signal);
};
