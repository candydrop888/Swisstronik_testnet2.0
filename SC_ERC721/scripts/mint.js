const hre = require("hardhat");
const { encryptDataField } = require("@swisstronik/utils");

const sendShieldedTransaction = async (signer, destination, data, value) => {
  const rpcLink = hre.network.config.url;

  const [encryptedData] = await encryptDataField(rpcLink, data);

  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  });
};

async function main() {
  const contractAddress = "0xfaf91cFF460BB5Ad2F923f989693019e72EdD742"; 
  const recipientAddress = "0x829b734919cc2993Daf81a881dDb514De217f74f"; 

  const [signer] = await hre.ethers.getSigners();

  const contractFactory = await hre.ethers.getContractFactory("MyNFT"); 
  const contract = contractFactory.attach(contractAddress);

  const functionName = "mint";
  const functionArgs = [recipientAddress]; 
  const txData = contract.interface.encodeFunctionData(functionName, functionArgs);

  try {
    console.log("Gửi giao dịch. Đang chờ xác nhận...");

    const mintTx = await sendShieldedTransaction(
      signer,
      contractAddress,
      txData,
      0
    );

    await mintTx.wait();

    console.log("Giao dịch mint đã được xác nhận!");
    console.log("Receipt giao dịch: ", mintTx);
  } catch (error) {
    console.error("Lỗi trong quá trình gửi giao dịch hoặc giải mã: ", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
