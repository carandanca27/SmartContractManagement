import {useState, useEffect} from "react";
import {ethers} from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [amount, setAmount] = useState("");
  const [transactionHistory, setTransactionHistory] = useState([]);

  const handleChange = (e) => {
    var inputValue = e.target.value;

    // Check if the input value is empty or a valid positive number
    if (inputValue === '' || (/^\d*\.?\d+$/.test(inputValue) && parseFloat(inputValue) >= 0)) {
      setAmount(inputValue);
    }
  };

  // Function to fetch transaction history
  const fetchTransactionHistory = async () => {
    if (atm) {
      const transactions = await atm.getTransactionHistory();
      setTransactionHistory(transactions);
    }
  };

   // JSX for displaying transaction history
   const renderTransactionHistory = () => {
    if (transactionHistory.length === 0) {
      return <p>No transaction history available. Click Get Transaction to update.</p>;
    } else {
      return (
        <div>
          <h2>Transaction History</h2>
          <ul>
            {transactionHistory.map((transaction, index) => (
              <li key={index}>
                <br />
                Type: {transaction.transactionType === 0 ? "Deposit" : "Withdrawal"}
                <br />
                Amount: {ethers.utils.formatEther(transaction.amount)} ETH
                <br /> 
                Timestamp: {new Date(transaction.timestamp * 1000).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      );
    }
  };

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({method: "eth_accounts"});
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log ("Account connected: ", account);
      setAccount(account);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async() => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
    
    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
 
    setATM(atmContract);
  }

  const getBalance = async() => {
    if (atm) {
      const balanceBN = await atm.getBalance();
      setBalance(ethers.utils.formatEther(balanceBN));
    }
  }

  const deposit = async() => {
    if (atm) {
      if(amount != ""){
        const amountBN = ethers.utils.parseEther(amount);
        let tx = await atm.deposit(amountBN);
        await tx.wait()
        getBalance();
        setAmount("");
      } else{
        return(
          <p>Please enter an amount.</p>
        )
      }
    }
  }

  const withdraw = async() => {
    if (atm) {
      if(amount != ""){
        const amountBN = ethers.utils.parseEther(amount);
        let tx = await atm.withdraw(amountBN);
        await tx.wait()
        getBalance();
        setAmount("");
      } else{
        return (
          <p>Please enter an amount.</p>
        )
      }
      
    }
  }

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance} ETH</p>
        <input
          type="text"
          placeholder="Enter amount"
          value={amount}
          onChange={handleChange}
        />
        <button onClick={deposit}>Deposit</button>
        <button onClick={withdraw}>Withdraw</button>
        <button onClick={fetchTransactionHistory}>Get Transaction History</button>
        {renderTransactionHistory()}
      </div>
    )
  }

  useEffect(() => {getWallet();}, []);

  return (
    <main className="container">
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center
        }
      `}
      </style>
    </main>
  )
}
