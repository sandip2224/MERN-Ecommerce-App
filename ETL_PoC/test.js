const logAndRetry = (i, updateTable, signal, retryCount, requestQueue) => {
  console.log(`Iteration ${i}: Request failed`);
  console.log(`Retrying in ${RETRY_DELAY_MS} milliseconds... Retry count: ${retryCount + 1}`);
  
  // Retry after a delay
  setTimeout(() => makeRequest(i, updateTable, signal, retryCount + 1, requestQueue), RETRY_DELAY_MS);
};

const makeRequest = (i, updateTable, signal, retryCount, requestQueue) => {
  if (i >= requestQueue?.length) {
    console.log(`No more requests. Iteration ${i} reached the end of the queue.`);
    return;
  }

  const requestData = requestQueue?.[i];
  if (!requestData) {
    console.log(`Iteration ${i}: Request data is null or undefined. Skipping this request.`);
    // Proceed to the next iteration
    processNextRequest(i + 1, updateTable, signal, requestQueue);
    return;
  }

  const portfolioReqList = requestData.portfolioReqList;
  APIService({ portfolioReqList }, apiConfig.portfolioAdvanceDetailEndpoint, undefined, true, false, signal)
    .then(response => {
      console.log(`Iteration ${i}: Request succeeded`);
      updateTable(requestData, response);
      // Proceed to the next iteration on success
      processNextRequest(i + 1, updateTable, signal, requestQueue);
    })
    .catch(error => {
      if (retryCount < MAX_RETRY_COUNT) {
        logAndRetry(i, updateTable, signal, retryCount, requestQueue);
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
        processNextRequest(i + 1, updateTable, signal, requestQueue);
      }
    });
};

const processNextRequest = (i, updateTable, signal, requestQueue) => {
  if (i < requestQueue?.length) {
    makeRequest(i, updateTable, signal, 0, requestQueue);
  }
};

const backupAdvanceDetail = (requestQueue, updateTable, signal) => {
  processNextRequest(0, updateTable, signal, requestQueue);
};
