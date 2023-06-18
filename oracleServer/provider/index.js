const hardhat = require("hardhat");
const axios = require("axios");

const MAX_RETRIES = 5;
const SLEEP_TIME = 2000;
const BATCH_SIZE = 3;

async function requestRandomNumber() {
    const res = await axios({
      url: "https://www.random.org/integers/",
      params: {
        num: 1,
        min: 1,
        max: 1000,
        col: 1,
        base: 10,
        format: "plain",
        rnd: "new",
      },
      method: "get",
    });
  
    return parseInt(res.data);
  }
  
  async function main() {
    // Initialize account
    const [dataProvider] = await hardhat.ethers.getSigners();
    console.log("Account balance:", (await dataProvider.getBalance()).toString());
    // Initialize contract
    const oracleContractAddress = "0xFcF8996617D49c0F53824FA0c5cEA00eA2674C0F";
    const oracleContractABI = require("./randOracleABI.json");
    const oracleContract = new hardhat.ethers.Contract(
      oracleContractAddress,
      oracleContractABI,
      dataProvider
    );
    // Populate requests queue
    var requestsQueue = [];

    oracleContract.on("RandomNumberRequested", async (callerAddress, id) => {
      console.log("Random number requested, ID:", id.toString());
      requestsQueue.push({ callerAddress, id });
    });

    // Poll and process requests queue at intervals
    setInterval(async () => {
      console.log("Polling for requests...");
      let processedRequests = 0;
      while (requestsQueue.length > 0 && processedRequests < BATCH_SIZE) {
          const request = requestsQueue.shift();
          console.log(request)
          let retries = 0;
          while (retries < MAX_RETRIES) {
              try {
                console.log("Requesting random number...");
                const randomNumber = await requestRandomNumber();
                console.log("Random number received:", randomNumber);
                result = await oracleContract.returnRandomNumber(
                  randomNumber,
                  request.callerAddress,
                  request.id
                );
                console.log("Random number returned:", result);
                break;
              } catch (error) {
                  retries++;
              }
          }
          processedRequests++;
      }
        
    }, SLEEP_TIME);


  }
  
  main();
  
    