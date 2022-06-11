import chai, { should } from "chai";
import chaiAsPromised from "chai-as-promised";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, upgrades } from "hardhat";
import type * as ethersTypes from "ethers";

chai.use(chaiAsPromised);
should();

describe("NeoTechNFT", function () {

  const PRICE = process.env.PRICE ? process.env.PRICE : "0";

  let owner: SignerWithAddress;
  let giveawayWinner: SignerWithAddress;
  let userWithUSDT: SignerWithAddress;

  let neoTechToken: ethersTypes.Contract;
  let usdtToken: ethersTypes.Contract;

  before(async function () {
		[owner, giveawayWinner, userWithUSDT] = await ethers.getSigners();
	});

  beforeEach(async () => {
      const USDTest = await ethers.getContractFactory("USDTest");
      usdtToken = await USDTest.connect(owner).deploy("1000");
      await usdtToken.transfer(userWithUSDT.address, "1000");

      const NeoTechNFT = await ethers.getContractFactory("NeoTechNFT");
      
      neoTechToken = await upgrades.deployProxy(NeoTechNFT, [
          PRICE,
          1,
          true,
          usdtToken.address
          //"0xdAC17F958D2ee523a2206206994597C13D831ec7"
      ]);
      
      neoTechToken = await ethers.getContractAt(
        "NeoTechNFT",
        neoTechToken.address
      );

      await neoTechToken.transferOwnership(owner.address);
  });

  it("Should mint 15 NFTs", async function () {

    // try to mint when the contract is paused
    await neoTechToken.connect(userWithUSDT).mint(1).should.be.rejectedWith("Contract is paused.");
    // try to un-pause the contract when not the owner
    await neoTechToken.connect(userWithUSDT).setPaused(false).should.be.rejectedWith("Ownable: caller is not the owner");

    // mint 5 NFTs while contract is paused using mintTeam()
    console.log(
      giveawayWinner.address + " balance before team mint - "
                + await usdtToken.balanceOf(giveawayWinner.address) + "$USDT, "+
                + await neoTechToken.balanceOf(giveawayWinner.address) + "NFTs."
    );
    await neoTechToken.connect(owner).mintTeam(giveawayWinner.address, 5).should.be.fulfilled;
    console.log(
      giveawayWinner.address + " balance after team mint - "
                + await usdtToken.balanceOf(giveawayWinner.address) + "$USDT, "+
                + await neoTechToken.balanceOf(giveawayWinner.address) + "NFTs.\n"
    );

    // un-pause the contract as the owner
    await neoTechToken.connect(owner).setPaused(false).should.be.fulfilled;
    // try to mint an NFT when the current phase is already reached
    await neoTechToken.connect(userWithUSDT).mint(1).should.be.rejectedWith("Minted tokens would exceed supply allocated for the current phase.");

    // try to increase the phase max limit when not the owner 
    await neoTechToken.connect(userWithUSDT).setMaxSupplyForCurrentPhase(15).should.be.rejectedWith("Ownable: caller is not the owner");
    // increase the phase max limit as the owner
    await neoTechToken.connect(owner).setMaxSupplyForCurrentPhase(15).should.be.fulfilled;  
    
    // try to withdraw when not the owner
    await neoTechToken.connect(userWithUSDT).withdrawERC20(usdtToken.address, owner.address).should.be.rejectedWith("Ownable: caller is not the owner");
    await neoTechToken.connect(userWithUSDT).withdraw(owner.address).should.be.rejectedWith("Ownable: caller is not the owner");
    // try to withdraw when zero balance
    await neoTechToken.connect(owner).withdrawERC20(usdtToken.address, owner.address).should.be.rejectedWith("No tokens left to withdraw");
    await neoTechToken.connect(owner).withdraw(owner.address).should.be.rejectedWith("No ether left to withdraw");

    console.log(
      userWithUSDT.address + " balance before mint - "
                + await usdtToken.balanceOf(userWithUSDT.address) + "$USDT, "+
                + await neoTechToken.balanceOf(userWithUSDT.address) + "NFTs."
    );
    // give allowance to spend 1000 USDT, amount needed for buying 10 NFTs
    await usdtToken.connect(userWithUSDT).approve(neoTechToken.address, 1000);
    // mint 10 NeoTech NFTs
    await neoTechToken.connect(userWithUSDT).mint(10).should.be.fulfilled;

    console.log(
        userWithUSDT.address + " balance after mint - "
                + await usdtToken.balanceOf(userWithUSDT.address) + "$USDT, "+
                + await neoTechToken.balanceOf(userWithUSDT.address) + "NFTs.\n"
    );

     // try to mint an NFT when the current phase is already reached
    await neoTechToken.connect(userWithUSDT).mint(1).should.be.rejectedWith("Minted tokens would exceed supply allocated for the current phase.");  
    
    console.log(
      userWithUSDT.address + " balance before withdraw - "
              + await usdtToken.balanceOf(owner.address) + "$USDT"
    );
    await neoTechToken.connect(owner).withdrawERC20(usdtToken.address, owner.address).should.be.fulfilled;
    console.log(
      userWithUSDT.address + " balance after widraw - "
              + await usdtToken.balanceOf(owner.address) + "$USDT"
    );
  });



});
