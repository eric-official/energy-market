App = {
    callerAddress: "0x9c3606d3d3A36b334E6Aa09D838967EBf7E30EEF",
    callerContract: null,
    requestedIDs: [],
  
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

  };
  
App.init();