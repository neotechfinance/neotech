import { ethers, upgrades } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const NeoTech = await ethers.getContractFactory("NeoTechNFT");
	const neoTech = await upgrades.deployProxy(NeoTech, [
    process.env.PRICE,
    process.env.MAX_SUPPLY_FOR_CURRENT_PHASE,
    process.env.PAUSED,
    process.env.PAYMENT_METHOD
	]);
	await neoTech.deployed();
	console.log("NeoTech deployed to:", neoTech.address);
};

export default func;
func.tags = ["NeoTech"];