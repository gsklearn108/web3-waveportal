import React, {useEffect, useState} from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';

export default function App() {

  const [totalWaves, setTotalWaves] = useState(0);
  const [waveMessage, setWaveMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [allWaves, setAllWaves] = useState([]);
  
  const [currentAccount, setCurrentAccount] = useState("");

  const contractAddress = "0x31adf6C1CC84F225EE498cCBEE7E8C05cf5A067c";
  const contractABI = abi.abi;
  
  const checkIfWalletIsConnected = async () => {
    try {
      const {ethereum} = window;
      if (!ethereum) {
        console.log("Wallet Not Connected");
        return;
      } 
      console.log("Wallet found");
      const accounts = await ethereum.request({method: "eth_accounts"});
  
      if (accounts.length != 0){
        const account = accounts[0];
        console.log("Found authorized account :", account);
        setCurrentAccount(account);
      } else {
        console.log("No Authorized account found");
      }
      
    } catch (error) {
      console.log(error);      
    }
    
  }

  const connectWallet = async () => {
    console.log("Clicked")
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Wallet Not Found");
        return;
      } 
  
      const accounts = await ethereum.request({method: "eth_requestAccounts"});
  
      if(accounts.length != 0){
        const account = accounts[0];
        console.log("Connected to : ", account);
        setCurrentAccount(account);
      } else{
        console.log("No accounts found");
      }     
    } catch (error) {
      console.log(error);
    }
    
  }

  const getAllWaves = async () => {
    try{
      const {ethereum} = window;

      if(!ethereum){
        console.log("Ethereum not found");
        return;
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      const waveContract = new ethers.Contract(contractAddress, contractABI, signer);

      let allWaves = await waveContract.getAllWaves();
      setTotalWaves(allWaves.length)

      let wavesList = [];

      allWaves.forEach(wave => {
        wavesList.push({
          waver: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message
        })
      }) 

      setAllWaves(wavesList);
      
    }catch(error){
      console.log(error);
    } 
  }

  const handleWaveMessage = async (event) =>{
    setWaveMessage(event.target.value)
  }

  
  const wave = async () => {
    try{
      const {ethereum} = window;

      if (ethereum){
        setLoading(true);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const waveContract = new ethers.Contract(contractAddress, contractABI, signer);
        let totalWavesCount = await waveContract.getTotalWaves();
        console.log("Total waves count from contract : ", totalWavesCount.toNumber());
        setTotalWaves(totalWavesCount.toNumber());

        const waveTx = await waveContract.wave(waveMessage);
        console.log("Mining ... ", waveTx.hash)

        await waveTx.wait();
        console.log("Mined ... ", waveTx.hash);

        totalWavesCount = await waveContract.getTotalWaves();
        console.log("Total waves count from contract : ", totalWavesCount.toNumber());
        setTotalWaves(totalWavesCount.toNumber());
        getAllWaves();
        setWaveMessage("");
        setLoading(false);
      } else {
        console.log("Ethereum object does not exist");
      }

      
    }catch (error){
      console.log(error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getAllWaves();
  }, []);  
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
          {!currentAccount && ("Connect your Ethereum wallet.") } 
          <br />
          Wave at me with some nice message below. Your message will be stored on BLOCKCHAIN :) 
          <br />
          <u>50% chances </u>are that you will get some small ether from me as prize amount. Best of luck.
        </div>
        <div>
          <textarea className="waveMessage" value={waveMessage} onChange={handleWaveMessage}></textarea>
        </div>
        <button className="waveButton" onClick={wave}>
          {loading? 'Loading...' : 'Wave at Me'}
        </button>
        
        {!currentAccount && (
        
        <button className="waveButton" onClick={connectWallet}>
          Connect Wallet
        </button>    
        )
        }
        <div style={{ marginTop: "16px", padding: "8px" }}>
          Total Waves So Far = {totalWaves}.
        </div>
        {allWaves.map((wave, index) => {
          return(
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.waver}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          )
        })}
        
      </div>
    </div>
  );
}
