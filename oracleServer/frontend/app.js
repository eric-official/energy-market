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

const ETHER_TO_WEI = 1000000000000000000;

App = {
    callerAddress: "0x9c3606d3d3A36b334E6Aa09D838967EBf7E30EEF",
    callerContract: null,
    requestedIDs: [],
    spotPrice: 0.5,
  
    init: async function() {
        if (window.ethereum) {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            window.web3 = new Web3(window.ethereum);

            App.callerContract = new web3.eth.Contract(callerABI, App.callerAddress);

            // Switch networks
            App.switchToReplitTestnet();
        }
        try{
            App.subscribeToContractEvents();
            App.bindBrowserEvents();
        }
        catch(err){
            console.log("fadsfa",err)
        }
       
    },
    switchToReplitTestnet: function() {
        window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
                {
                    chainId: "0xaa36a7",
                    chainName: "Ethereum Sepolia",
                    rpcUrls: ["https://rpc.sepolia.org"],
                    iconUrls: [
                        "https://upload.wikimedia.org/wikipedia/commons/b/b2/Repl.it_logo.svg",
                    ],
                    nativeCurrency: {
                        name: "ETH",
                        symbol: "ETH",
                        decimals: 18,
                    },
                },
            ],
        })
    },
    getRandomNumber: async function() {
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        const requestID = await App.callerContract.methods.getRandomNumber().send({from: account})

        // Request random number & return request ID
        return requestID;
    },
    subscribeToContractEvents: function() {
        console.log("caller contract",App.callerContract.events)
        try{


            let options1 = {
                filter: {
                    value: [],
                },
                fromBlock: 0
            };
            App.callerContract.events.RandomNumberReceived(options1)
            .on('data', async(event) => {
                console.log(App.requestedIDs)
                console.log("Random number Recieved, ID",event)
                if( App.requestedIDs.includes(event.returnValues.id)){
                    
                // Create list item
                    let recEventLi = document.createElement("li");
                    recEventLi.classList.add("response");
                    recEventLi.innerHTML = `Random number received for ID ${event.returnValues.id}: ${event.returnValues.number}`;
        
                    // Add to top of list
                    const eventLog = document.getElementById("events");
                    eventLog.prepend(recEventLi);
                }
            })
            .on('changed', changed => console.log("fafdDAs",changed))
            .on('error', err => console.log(err))
            .on('connected', str => console.log(str))
        }
        catch(err){
            console.log("error",err)
        }
        
    },
    // interface
    bindBrowserEvents: function () {
        const requestButton = document.getElementById("request-rand");
        requestButton.addEventListener("click", async function() {
            const receipt = await App.getRandomNumber();
            const event = receipt.logs.find(log => log.topics[0] === web3.utils.keccak256("RandomNumberRequested(uint256)"));

            // Decode the event parameters
            const decodedParams = web3.eth.abi.decodeLog([{
                type: 'uint256',
                name: 'id',
            }], event.data, event.topics.slice(1));
            const requestID = document.getElementById("request-id");
            requestID.innerHTML = `Submitted! Request ID: ${decodedParams['id']}`;
            App.requestedIDs.push(decodedParams['id']);
        });
    },
    getCarbonIntensity: async function () {
        const url = 'https://api.electricitymap.org/v3/carbon-intensity/history?zone=DE';
        const authToken = '6sBq4QDKtIihcx3KtZas54UGzDSi9JvR';
      
        try {
          const response = await fetch(url, {
            headers: {
              'auth-token': authToken
            }
          });
      
          if (!response.ok) {
            throw new Error('Request failed with status ' + response.status);
          }
      
          const data = await response.json();
          return data.carbonIntensity;
        } catch (error) {
          console.error('Error:', error.message);
          return null;
        }
    },
    getPricePerTonOfCo2: async function() {
        return (await convertEurToEth(80)) * ETHER_TO_WEI;
    },
    getSpotPrice: async function() {
        // Generate random spot price from 0 - 1 by random walking based on the latest calculation
        App.spotPrice = Math.max(0, Math.min(1, App.spotPrice + Math.random() ))  * ETHER_TO_WEI;
        return (await convertEurToEth(App.spotPrice)) * ETHER_TO_WEI;;
    }
      
  };
  
App.init();