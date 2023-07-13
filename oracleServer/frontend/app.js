App = {
    callerAddress: "0x6a71462d03104693D316ccFF14744d7c3a369c28",
    callerContract: null,
    requestedIDs: [],
  
    init: async function() {
        if (window.ethereum) {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            window.web3 = new Web3(window.ethereum);

            App.callerContract = new web3.eth.Contract(callerABI, App.callerAddress);

            // Switch networks
            App.switchToSepoliaTestnet();
        }

        App.subscribeToContractEvents();
        App.bindBrowserEvents();

       
    },
    switchToSepoliaTestnet: function() {
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
    getElectricityData: async function() {
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        console.log("Account",account)
        const requestID = await App.callerContract.methods.getElectricityData().send({from: account})

        // Request random number & return request ID
        return requestID;
    },
    subscribeToContractEvents: function() {
        console.log("caller contract",App.callerContract)
        try{
            let options1 = {
                filter: {
                    value: [],
                },
                fromBlock: 0
            };
            App.callerContract.events.ElectricityDataReceived(options1)
            .on('data', async(event) => {
                console.log(App.requestedIDs)
                console.log("Electricity data Recieved, ID",event)
                if( App.requestedIDs.includes(event.returnValues.id)){
                    
                // Create list item
                    let recEventLi = document.createElement("li");
                    recEventLi.classList.add("response");
                    recEventLi.innerHTML = `Electricity data received for ID ${event.returnValues.id}: CarbonIntensity-> ${event.returnValues.carbonIntensity}, PricePerTonOfCo2 in WEI->  ${event.returnValues.priceCarbon}`;
        
                    // Add to top of list
                    const eventLog = document.getElementById("events");
                    eventLog.prepend(recEventLi);
                }
            })
        }
        catch(err){
            console.log(" Shouvik error",err)
        }
        
    },
    // interface
    bindBrowserEvents: function () {
        const requestButton = document.getElementById("request-rand");
        requestButton.addEventListener("click", async function() {
            const receipt = await App.getElectricityData();
            const event = receipt.logs.find(log => log.topics[0] === web3.utils.keccak256("ElectricityDataRequested(uint256)"));

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

  };
  
App.init();