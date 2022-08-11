const express = require('express');
const cors = require('cors');  
const app = express();
const bodyParser = require('body-parser');
const Web3 = require('web3');
const Decimal = require('decimal.js')

var url = "wss://evocative-fragrant-general.discover.quiknode.pro/5255069dcb84f87bcb7e195fd36a881194e96496/";

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const transaction = {};
const WEI = 1000000000000000000

const ethToWei = (amount) => new Decimal(amount).times(WEI)
// Instantiate web3 with WebSocket provider
const web3 = new Web3(new Web3.providers.WebsocketProvider(url))

function watchEtherTransfers() {

  // Instantiate subscription object
  const subscription = web3.eth.subscribe('pendingTransactions')

  // Subscribe to pending transactions
  subscription.subscribe((error, result) => {
    if (error) console.log("Subscription ERROR: ", error)
  })
    .on('data', async (txHash) => {
      try {
        // Get transaction details
        const trx = await web3.eth.getTransaction(txHash);
        const txReceipt = await web3.eth.getTransactionReceipt(txHash);

        if (txReceipt == null) {
          transaction.status = 'Pending';
          const valid = validateTransaction(trx)
          // If transaction is not valid, simply return
          if (!valid) return
          
          const to = trx.to ? trx.to.toLowerCase() : trx.to;
          const from = trx.from ? trx.from.toLowerCase() : trx.from;
          const amount = ethToWei(trx.value);
  
          transaction.txHash = txHash;
          transaction.to = to;
          transaction.from = from;
          transaction.amount = amount;
  
          console.log(transaction)
        }
      }
      catch (error) {
        console.log(error)
      }
    })
}

function validateTransaction(trx) {
  const valid = trx !== null
  if (!valid) return false
  return valid;
}

watchEtherTransfers();

// index page
app.get('/api', function (req, res) {
  res.json(transaction);
});

app.listen(8080);
console.log('Server is listening on port 8080');