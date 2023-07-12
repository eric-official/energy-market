const hardhat = require("hardhat");
const axios = require("axios");
const fetch = require("node-fetch");
const ethers = require("ethers")



const MAX_RETRIES = 5;
const SLEEP_TIME = 2000;
const BATCH_SIZE = 3;
const ETHER_TO_WEI = 1000000000000000000;


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
async function getCarbonIntensity() {
  const options = {
    method: 'GET',
    headers: {
      'X-BLOBR-KEY': 'kgtBNfkNSt0RovkvnvCkRcF56zZOjXM9'
    },
  };
  url = "https://api-access.electricitymaps.com/2w97h07rvxvuaa1g/carbon-intensity/forecast?zone=DE";
  

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error('Request failed with status ' + response.status);
    }

    const data = await response.json();
    return data["forecast"][0]["carbonIntensity"];
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}
async function convertEurToEth(eur) {
    
  try {
      const response = await fetch("https://api.binance.com/api/v3/avgPrice?symbol=ETHEUR");
  
      if (!response.ok) {
        throw new Error('Request failed with status ' + response.status);
      }
  
      const data = await response.json();
      return eur / parseFloat(data.price);
  } catch (error) {
  console.error('Error:', error.message);
  return null;
  }
}
async function getPricePerTonOfCo2() {
  return ethers.utils.parseEther((await convertEurToEth(80)).toString());

}
  
async function main() {
  //Initialize account
  const [dataProvider] = await hardhat.ethers.getSigners();
  console.log("Account balance:", (await dataProvider.getBalance()).toString());
  // Initialize contract
  const oracleContractAddress = "0x1F76f7f287AaF1789c9bfB2eB8780d933c182A54";
  const oracleContractABI = require("./electricityDataOracleABI.json");
  const oracleContract = new hardhat.ethers.Contract(
    oracleContractAddress,
    oracleContractABI,
    dataProvider
  );
  // Populate requests queue
  var requestsQueue = [];

  oracleContract.on("ElectricityDataRequested", async (callerAddress, id) => {
    console.log("Electricity Data requested, ID:", id.toString());
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
              console.log("Requesting electricity data...");
              //todo: change to real data 
              const carbonIntensity = await getCarbonIntensity();
              const priceCarbon = await getPricePerTonOfCo2();
              console.log("Electricity Data received:", carbonIntensity,priceCarbon.toString());
              result = await oracleContract.returnElectricityData(
                carbonIntensity,
                priceCarbon.toString(),
                request.callerAddress,
                request.id
              );
              console.log("Electricity data returned:", result);
              break;
            } catch (error) {
              console.log("Error:", error);
              retries++;
            }
        }
        processedRequests++;
    }
      
  }, SLEEP_TIME);


}

main();

  