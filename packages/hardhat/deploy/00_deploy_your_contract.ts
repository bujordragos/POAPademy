import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployPOAPademyOnChain: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployment = await deploy("YourContract", {
    from: deployer,
    args: [], // No constructor arguments
    log: true,
    autoMine: true,
  });

  console.log("POAPademyOnChain deployed at:", deployment.address);
};

export default deployPOAPademyOnChain;
deployPOAPademyOnChain.tags = ["POAPademyOnChain"];
