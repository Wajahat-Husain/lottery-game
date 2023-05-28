const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe("Lottery Game contracts", function () {
    let lottery;
    let lotteryContract;
    let Owner;
    let User1;
    let User2;
    let User3;
    let User4;
    let User5;
    let Users;

    /*----------------------------------------- Deploying Contract ------------------------------------------*/

    before(async function () {

        [Owner, User1, User2, User3, User4, User5, ...Users] = await ethers.getSigners();

        lottery = await ethers.getContractFactory("LotteryGame");
        lotteryContract = await lottery.deploy(10, "100000000000000000");
        await lotteryContract.deployed();
        console.log(`Lottery Game Contract Address : ${lotteryContract.address}`)

    });

    /*----------------------------------- Checking Contract deployed Successfully --------------------------*/

    describe("Should deploy Lottery Game Contracts " + " : Positive Case", function () {

        it("Should set the right ticket limit ", async function () {

            assert.equal((await lotteryContract.ticketLimit()), "10");
            expect(await lotteryContract.ticketLimit()).to.equal("10");

        });
        it("Should set the right price of ticket ", async function () {

            assert.equal((await lotteryContract.priceOfTicket()), "100000000000000000");
            expect(await lotteryContract.priceOfTicket()).to.equal("100000000000000000");

        });
        it("Should set the right ticket sold ", async function () {

            assert.equal((await lotteryContract.totalTicketSold()), "0");
            expect(await lotteryContract.totalTicketSold()).to.equal("0");

        });
        it("Should have right lottery collection ", async function () {

            assert.equal((await lotteryContract.currentLotteryCollection()), "0");
            expect(await lotteryContract.currentLotteryCollection()).to.equal("0");

        });

        it("Should have no last Winner ", async function () {

            assert.equal(await lotteryContract.lastWinner(), "0x0000000000000000000000000000000000000000");
            expect(await lotteryContract.lastWinner()).to.equal("0x0000000000000000000000000000000000000000");

        });

    });

    /*----------------------------------- Buying Ticket for Lottery Contract --------------------*/

    describe("Should purchase lottery ticket Contracts " + " : Positive Case", function () {

        it("Should buy Ticket Successfully", async function () {

            await expect(lotteryContract.getTicketOwner(0)).to.be.reverted;
            await expect(lotteryContract.getTicketOwner(1)).to.be.reverted;
            const balance = ethers.utils.formatEther(await ethers.provider.getBalance(User1.address));
            // console.log(balance)
            const ticketPrice = ethers.utils.formatEther(await lotteryContract.priceOfTicket());
            // console.log(ticketPrice)
            const valueToSend = ethers.utils.parseEther((2 * ticketPrice).toString());
            await lotteryContract.connect(User1).purchaseLottery(2, User1.address, {
                value: valueToSend,
            });
            expect(await lotteryContract.getTicketOwner(0)).to.equal(User1.address);
            expect(await lotteryContract.getTicketOwner(1)).to.equal(User1.address);

        });
    });


    /*----------------------------------- try to announce Lottery Winner --------------------*/

    describe("Should announce lottery winner " + " : Negative Case", function () {

        it("Should unable to announce winner before all ticket sold", async function () {

            await expect(lotteryContract.announceLotteryWinner())
            .to.be.revertedWith("Ticket not fully sold");

        });
    
    });

    /*----------------------------------- Sell all lottery ticket --------------------*/

    describe("Should sold all ticket " + " : Positive Case", function () {

        it("Should buy Ticket Successfully", async function () {

            const ticketPrice = ethers.utils.formatEther(await lotteryContract.priceOfTicket());
            // console.log(ticketPrice)
            const valueToSend = ethers.utils.parseEther((2 * ticketPrice).toString());

            // Second User
            await expect(lotteryContract.getTicketOwner(2)).to.be.reverted;
            await expect(lotteryContract.getTicketOwner(3)).to.be.reverted;
            await lotteryContract.connect(User2).purchaseLottery(2, User2.address, {
                value: valueToSend,
            });
            expect(await lotteryContract.getTicketOwner(2)).to.equal(User2.address);
            expect(await lotteryContract.getTicketOwner(3)).to.equal(User2.address);

            // Third User
            await expect(lotteryContract.getTicketOwner(4)).to.be.reverted;
            await expect(lotteryContract.getTicketOwner(5)).to.be.reverted;

            await lotteryContract.connect(User3).purchaseLottery(2, User3.address, {
                value: valueToSend,
            });
            expect(await lotteryContract.getTicketOwner(4)).to.equal(User3.address);
            expect(await lotteryContract.getTicketOwner(5)).to.equal(User3.address);

            // Fourth user
            await expect(lotteryContract.getTicketOwner(6)).to.be.reverted;
            await expect(lotteryContract.getTicketOwner(7)).to.be.reverted;

            await lotteryContract.connect(User5).purchaseLottery(2, User4.address, {
                value: valueToSend,
            });
            expect(await lotteryContract.getTicketOwner(6)).to.equal(User4.address);
            expect(await lotteryContract.getTicketOwner(7)).to.equal(User4.address);

            // Fifth user
            await expect(lotteryContract.getTicketOwner(8)).to.be.reverted;
            await expect(lotteryContract.getTicketOwner(9)).to.be.reverted;

            await lotteryContract.connect(User5).purchaseLottery(2, User5.address, {
                value: valueToSend,
            });
            expect(await lotteryContract.getTicketOwner(8)).to.equal(User5.address);
            expect(await lotteryContract.getTicketOwner(9)).to.equal(User5.address);

            await expect(lotteryContract.connect(User5).purchaseLottery(2, User5.address, {
                value: valueToSend,
            }))
            .to.be.revertedWith("Exceed Ticket Limit ");

        });
    });

     /*-------------------------------------- announce Lottery Winner ---------------------------*/

     describe("Should announce lottery winner " + " : Positive Case", function () {

        it("Should able to announce winner before all ticket sold", async function () {

            assert.equal((await lotteryContract.totalTicketSold()), "10");
            await lotteryContract.connect(Owner).announceLotteryWinner();
            await expect( lotteryContract.getTicketOwner(0)).to.be.reverted;
            await expect(lotteryContract.getTicketOwner(1)).to.be.reverted;
            await expect(lotteryContract.getTicketOwner(2)).to.be.reverted;
            await expect(lotteryContract.getTicketOwner(3)).to.be.reverted;
            await expect(lotteryContract.getTicketOwner(4)).to.be.reverted;
            await expect(lotteryContract.getTicketOwner(5)).to.be.reverted;
            await expect(lotteryContract.getTicketOwner(6)).to.be.reverted;
            await expect(lotteryContract.getTicketOwner(7)).to.be.reverted;
            await expect(lotteryContract.getTicketOwner(8)).to.be.reverted;
            await expect(lotteryContract.getTicketOwner(9)).to.be.reverted;
            
        });

        it("Should see the winner details ", async function () {

            console.log(`winner address : ${await lotteryContract.lastWinner()}`)
            console.log(`winner Lottery Number : ${await lotteryContract.lastTicketWinner()}`)

            expect(await lotteryContract.lastWinner()).to.not.equal("0x0000000000000000000000000000000000000000");

        });

        it("Should  start new lottary game ", async function () {

            assert.equal((await lotteryContract.totalTicketSold()), "0");
            
        });
    
    });

});


































//     /*--------------------------------------- Setuping ERC20 Contract deployed Successfully ---------------------*/

//     describe("Should setup ERC20  Contracts " + " : Positive Case", function () {

//         it("Should mint token ", async function () {

//             await ERC20Contract.mint(Admin.address, ethers.utils.parseEther("10000.0"));
//             assert.equal(ethers.utils.formatEther(await ERC20Contract.balanceOf(Admin.address)), "10000.0");
//             expect(ethers.utils.formatEther(await ERC20Contract.totalSupply())).to.equal("10000.0");

//         });
//         it("Should admin transfer token to user ", async function () {

//             await ERC20Contract.transfer(User1.address, ethers.utils.parseEther("3.0"));
//             await ERC20Contract.transfer(User2.address, ethers.utils.parseEther("3.0"));
//             assert.equal(ethers.utils.formatEther(await ERC20Contract.balanceOf(User1.address)), "3.0");
//             assert.equal(ethers.utils.formatEther(await ERC20Contract.balanceOf(User2.address)), "3.0");

//             await ERC20Contract.transfer(User3.address, ethers.utils.parseEther("1000.0"));
//             await ERC20Contract.transfer(User4.address, ethers.utils.parseEther("1000.0"));
//             assert.equal(ethers.utils.formatEther(await ERC20Contract.balanceOf(User3.address)), "1000.0");
//             assert.equal(ethers.utils.formatEther(await ERC20Contract.balanceOf(User4.address)), "1000.0");

//             expect(ethers.utils.formatEther(await ERC20Contract.balanceOf(Admin.address))).to.equal("7994.0");

//         });
//         it("Should user give approval to ERC721 to purchase pack ", async function () {

//             await ERC20Contract.connect(User1).approve(ERC721Contract.address, ethers.utils.parseEther("3.0"));
//             await ERC20Contract.connect(User2).approve(ERC721Contract.address, ethers.utils.parseEther("3.0"));
//             assert.equal(ethers.utils.formatEther(await ERC20Contract.allowance(User1.address, ERC721Contract.address)), "3.0");
//             assert.equal(ethers.utils.formatEther(await ERC20Contract.allowance(User2.address, ERC721Contract.address)), "3.0");

//         });


//     });

//     /*------------------------------------------ Setuping ERC721 Contract deployed Successfully -----------------*/

//     describe("Should setup ERC721  Contracts " + " : Positive Case", function () {

//         it("Should add curremcy for Purchasing packs ", async function () {

//             await ERC721Contract.setTokenAddress(ERC20Contract.address);

//         });
//         it("Should mint camel NFT ", async function () {

//             await ERC721Contract.connect(User1).mint(1);
//             assert.equal(await ERC721Contract.balanceOf(User1.address), "3");
//             user1NFTs.push(await getNFTOwnedByaddress(User1.address));
//             assert.equal(ethers.utils.formatEther(await ERC20Contract.balanceOf(User1.address)), "2.0");
//             // console.log(user1NFTs[0][0], user1NFTs[0][1], user1NFTs[0][2]);


//             await ERC721Contract.connect(User2).mint(1);
//             expect(await ERC721Contract.balanceOf(User2.address)).to.equal("3");
//             user2NFTs.push(await getNFTOwnedByaddress(User2.address));
//             assert.equal(ethers.utils.formatEther(await ERC20Contract.balanceOf(User2.address)), "2.0");
//             // console.log(user2NFTs[0][0], user2NFTs[0][1], user2NFTs[0][2]);

//         });
//         it("Should be a right owner  ", async function () {

//             assert.equal(await ERC721Contract.ownerOf(user1NFTs[0][0]), User1.address);
//             expect(await ERC721Contract.ownerOf(user1NFTs[0][1])).to.equal(User1.address);
//             assert.equal(await ERC721Contract.ownerOf(user1NFTs[0][2]), User1.address);
//             expect(await ERC721Contract.ownerOf(user2NFTs[0][0])).to.equal(User2.address);
//             assert.equal(await ERC721Contract.ownerOf(user2NFTs[0][1]), User2.address);
//             expect(await ERC721Contract.ownerOf(user2NFTs[0][2])).to.equal(User2.address);

//         });

//     });

//     /*------------------------------ Obtaining the list of ERC721 tokenIds owned by an account -----------------*/
//     async function getNFTOwnedByaddress(userAddress) {
//         try {
//             // console.error(await ERC721Contract.name(), 'tokens ownedUser1 by', User1.address);
//             const sentLogs = await ERC721Contract.queryFilter(
//                 ERC721Contract.filters.Transfer(userAddress, null),
//             );

//             const receivedLogs = await ERC721Contract.queryFilter(
//                 ERC721Contract.filters.Transfer(null, userAddress),
//             );

//             const logs = sentLogs.concat(receivedLogs)
//                 .sort(
//                     (a, b) =>
//                         a.blockNumber - b.blockNumber ||
//                         a.transactionIndex - b.TransactionIndex,
//                 );

//             let mySet = new Set();

//             for (const log of logs) {
//                 const { from, to, tokenId } = log.args;
//                 if (to === userAddress) {
//                     mySet.add(tokenId.toString());
//                 } else if (from === userAddress) {
//                     mySet.delete(tokenId.toString());
//                 }
//             }
//             // console.log([...set].join('\n'));
//             const myArray = [...mySet];
//             return myArray;
//         } catch (e) {
//             console.log(e)
//         }
//     }

//     /*----------------------------------- Test Adding currency in AlHejin marketplace Contract -----------------*/

//     describe("Should add currency AlHejin Marketplace  Contracts " + " : Negative Case", function () {

//         it("Should have admin role to add currency", async function () {

//             await expect(AlHejinContract.connect(AdminRole).addCurrency("USDT", ERC20Contract.address))
//                 .to.be.revertedWith("AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775");
//         });
//         it("Should have admin role to add currency", async function () {

//             await expect(AlHejinContract.connect(AdminRole).removeCurrency("USDT"))
//                 .to.be.revertedWith("AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775");

//         });

//     });

//     /*------------------------------------- Adding currency in AlHejin marketplace Contract --------------------*/

//     describe("Should add currency AlHejin Marketplace  Contracts " + " : Positive Case", function () {

//         it("Should admin grant role ( admin role )", async function () {

//             await AlHejinContract.grantRole(await AlHejinContract.ADMIN_ROLE(), AdminRole.address);
//             assert.equal(await AlHejinContract.hasRole(await AlHejinContract.ADMIN_ROLE(), AdminRole.address), true);

//         });
//         it("Should adminRole can add currency ", async function () {

//             await AlHejinContract.connect(AdminRole).addCurrency("USDT", ERC20Contract.address);
//             expect(await AlHejinContract.allCurrenciesAllowed()).to.include("USDT"); // onReturn  we get array
//             assert.equal(await AlHejinContract.addressCurrency("USDT"), ERC20Contract.address);

//         });
//     });

//     /*----------------------------------- Test Removing currency from AlHejin marketplace Contract -------------*/

//     describe("Should remove currency from AlHejin Marketplace Contracts " + " : Negative Case", function () {

//         it("Should have admin role to remove currency", async function () {

//             await expect(AlHejinContract.connect(User1).removeCurrency("USDT"))
//                 .to.be.revertedWith("AccessControl: account 0x90f79bf6eb2c4f870365e785982e1f101e93b906 is missing role 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775");

//         });
//         it("Should right currency to remove  ", async function () {

//             await expect(AlHejinContract.connect(AdminRole).removeCurrency("EXS"))
//                 .to.be.reverted;
//         });

//     });

//     /*-------------------------------------- Removing currency from AlHejin marketplace Contract ---------------*/

//     describe("Should remove currency from AlHejin Marketplace Contracts " + " : Positive Case", function () {

//         it("Should admin remove currency", async function () {

//             await AlHejinContract.connect(AdminRole).removeCurrency("USDT");
//             expect(await AlHejinContract.allCurrenciesAllowed()).not.include("USDT"); // onReturn if we get array
//             assert.equal(await AlHejinContract.addressCurrency("USDT"), "0x0000000000000000000000000000000000000000");

//         });
//         it("Should adminRole add currecy to continue testing  ", async function () {

//             await AlHejinContract.connect(AdminRole).addCurrency("USDT", ERC20Contract.address);
//             expect(await AlHejinContract.allCurrenciesAllowed()).to.include("USDT");
//             assert.equal(await AlHejinContract.addressCurrency("USDT"), ERC20Contract.address);

//         });

//     });

//     /*-------------------------- Test add platform fee and wallet in AlHejin marketplace Contract -------------*/

//     describe("Should add platform fee and wallet in AlHejin marketplace Contract " + " : Negative Case", function () {

//         it("Should have admin role to update Platform Address", async function () {

//             await expect(AlHejinContract.connect(User1).updatePlatformAddress(PlatformWallet.address))
//                 .to.be.revertedWith("AccessControl: account 0x90f79bf6eb2c4f870365e785982e1f101e93b906 is missing role 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775");

//         });
//         it("Should have admin role to update Platform Fee", async function () {

//             await expect(AlHejinContract.connect(User1).updatePlatformFee(375))
//                 .to.be.revertedWith("AccessControl: account 0x90f79bf6eb2c4f870365e785982e1f101e93b906 is missing role 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775");

//         });
//         it("Should not add platfrom fee geater then 10000 ", async function () {

//             await expect(AlHejinContract.connect(AdminRole).updatePlatformFee(10001))
//                 .to.be.revertedWithCustomError(AlHejinContract, "InvalidFee");
//         });
//     });

//     /*----------------------------- add platform fee and wallet in AlHejin marketplace Contract ---------------*/

//     describe("Should add platform fee and wallet in AlHejin marketplace Contract " + " : Positive Case", function () {

//         it("Should AdminRole update Platform Address", async function () {

//             assert.equal(await AlHejinContract.platformAddress(), Admin.address);
//             await AlHejinContract.connect(AdminRole).updatePlatformAddress(PlatformWallet.address);
//             assert.equal(await AlHejinContract.platformAddress(), PlatformWallet.address);

//         });
//         it("Should  AdminRole update Platform Fee", async function () {

//             assert.equal(await AlHejinContract.platformfeeValue(), "369");
//             await AlHejinContract.connect(AdminRole).updatePlatformFee("375")
//             assert.equal(await AlHejinContract.platformfeeValue(), "375");

//         });

//     });

//     /*-------------------------------- try to Create CamelAuction in AlHejin marketplace Contract --------------*/

//     describe("Should create camelAuction in alHejin marketplace Contract " + " : Negative Case", function () {

//         it("Should create CamelAuction in AlHejin marketplace with valid currency ", async function () {

//             await expect(AlHejinContract.connect(User1).createCamelAuction(user1NFTs[0][0], User1.address, "EXS", "1100000000000000000", "1")) // price 1.11
//                 .to.be.revertedWithCustomError(AlHejinContract, "InvalidCurrency");

//         });
//         it("Should give approve to AlHejin marketplace contract for your NFT to sell  ", async function () {

//             await expect(AlHejinContract.connect(User1).createCamelAuction(user1NFTs[0][0], User1.address, "USDT", "1100000000000000000", "1"))
//                 .to.be.revertedWithCustomError(ERC721Contract,"TransferCallerNotOwnerNorApproved")

//         });
//         it("Should give approve to AlHejin marketplace contract  ", async function () {

//             await ERC721Contract.connect(User1).setApprovalForAll(AlHejinContract.address, true);
//             await ERC721Contract.connect(User2).setApprovalForAll(AlHejinContract.address, true);
//             expect(await ERC721Contract.isApprovedForAll(User1.address, AlHejinContract.address)).to.be.equal(true);
//             expect(await ERC721Contract.isApprovedForAll(User2.address, AlHejinContract.address)).to.be.equal(true);

//         });
//         it("Should right owner sell NFT in AlHejin marketplace contract ", async function () {

//             await expect(AlHejinContract.connect(User1).createCamelAuction(user2NFTs[0][0], User1.address, "USDT", "1100000000000000000", "1"))
//                 .to.be.revertedWithCustomError(ERC721Contract, "TransferFromIncorrectOwner");

//         });
//         it("Should auction days must less then auction limit ", async function () {

//             await expect(AlHejinContract.connect(User1).createCamelAuction(user1NFTs[0][0], User1.address, "USDT", "1100000000000000000", 366))
//                 .to.be.revertedWithCustomError(AlHejinContract, "InvalidAuctionDays");

//         });

//     });

//     /*---------------------------------- Create CamelAuction in AlHejin marketplace Contract -------------------*/

//     describe("Should create camelAuction in alHejin marketplace Contract " + " : Positive Case", function () {

//         it("Should create CamelAuction in AlHejin marketplace ", async function () {  // These  test work only for 5 year

//             await AlHejinContract.connect(User1).createCamelAuction(user1NFTs[0][0], User1.address, "USDT", ethers.utils.parseEther("1.1"), "1");
//             await AlHejinContract.connect(User2).createCamelAuction(user2NFTs[0][0], User2.address, "USDT", ethers.utils.parseEther("1.4"), "2");

//             await AlHejinContract.connect(User1).createCamelAuction(user1NFTs[0][1], User1.address, "USDT", ethers.utils.parseEther("1.2"), "3");
//             await AlHejinContract.connect(User2).createCamelAuction(user2NFTs[0][1], User2.address, "USDT", ethers.utils.parseEther("1.5"), "4");

//             await AlHejinContract.connect(User1).createCamelAuction(user1NFTs[0][2], User1.address, "USDT", ethers.utils.parseEther("1.3"), "5");
//             await AlHejinContract.connect(User2).createCamelAuction(user2NFTs[0][2], User2.address, "USDT", ethers.utils.parseEther("1.6"), "6");

//             assert.equal(await AlHejinContract.camelAuctionIndex(), 6);

//         });
//         it("Should get All camel auction Ids ", async function () {

//             const camelAuctionIds = await AlHejinContract.getAllCamelAuctionId();
//             const camelAuctionIdsAsNumbers = camelAuctionIds.map(id => id.toNumber());
//             expect(camelAuctionIdsAsNumbers).to.include(1, 2, 3, 4, 5, 6);

//         });
//         it("Should get All camel auction details ", async function () {

//             const camelAuctionIds = await AlHejinContract.getAllCamelAuctionId();
//             const camelAuctionIdsAsNumbers = camelAuctionIds.map(id => id.toNumber());
//             expect(camelAuctionIdsAsNumbers).to.include(1, 2, 3, 4, 5, 6);
//             const auctionDetails = await AlHejinContract.batchDetailsCamelAuction(camelAuctionIdsAsNumbers);
//             const auctionFullDetails = [];
//             auctionDetails.forEach((item, index) => {
//                 auctionFullDetails.push({ ...item, auctionid: camelAuctionIdsAsNumbers[index] });
//             })
//             const auctionDetailsbyIds = auctionFullDetails?.map(item => {
//                 return {
//                     auctionId: item.auctionid,
//                     camelId: item.camelId.toNumber(),
//                     ownerAddress: item.owner,
//                     currency: item.currency,
//                     pricePerCamel: item.pricePerCamel,
//                     validDate: item.validDate,
//                 }
//             });
//             assert.equal(auctionDetailsbyIds[0].auctionId, 1);
//             assert.equal(auctionDetailsbyIds[0].camelId, user1NFTs[0][0]);
//             assert.equal(auctionDetailsbyIds[0].ownerAddress, User1.address);
//             assert.equal(auctionDetailsbyIds[0].currency, "USDT");
//             assert.equal(auctionDetailsbyIds[0].pricePerCamel, "1100000000000000000");

//             assert.equal(auctionDetailsbyIds[1].auctionId, 2);
//             assert.equal(auctionDetailsbyIds[1].camelId, user2NFTs[0][0]);
//             assert.equal(auctionDetailsbyIds[1].ownerAddress, User2.address);
//             assert.equal(auctionDetailsbyIds[1].currency, "USDT");
//             assert.equal(auctionDetailsbyIds[1].pricePerCamel, "1400000000000000000");

//             assert.equal(auctionDetailsbyIds[2].auctionId, 3);
//             assert.equal(auctionDetailsbyIds[2].camelId, user1NFTs[0][1]);
//             assert.equal(auctionDetailsbyIds[2].ownerAddress, User1.address);
//             assert.equal(auctionDetailsbyIds[2].currency, "USDT");
//             assert.equal(auctionDetailsbyIds[2].pricePerCamel, "1200000000000000000");

//             assert.equal(auctionDetailsbyIds[3].auctionId, 4);
//             assert.equal(auctionDetailsbyIds[3].camelId, user2NFTs[0][1]);
//             assert.equal(auctionDetailsbyIds[3].ownerAddress, User2.address);
//             assert.equal(auctionDetailsbyIds[3].currency, "USDT");
//             assert.equal(auctionDetailsbyIds[3].pricePerCamel, "1500000000000000000");

//             assert.equal(auctionDetailsbyIds[4].auctionId, 5);
//             assert.equal(auctionDetailsbyIds[4].camelId, user1NFTs[0][2]);
//             assert.equal(auctionDetailsbyIds[4].ownerAddress, User1.address);
//             assert.equal(auctionDetailsbyIds[4].currency, "USDT");
//             assert.equal(auctionDetailsbyIds[4].pricePerCamel, "1300000000000000000");

//             assert.equal(auctionDetailsbyIds[5].auctionId, 6);
//             assert.equal(auctionDetailsbyIds[5].camelId, user2NFTs[0][2]);
//             assert.equal(auctionDetailsbyIds[5].ownerAddress, User2.address);
//             assert.equal(auctionDetailsbyIds[5].currency, "USDT");
//             assert.equal(auctionDetailsbyIds[5].pricePerCamel, "1600000000000000000");

//         });

//     });

//     /*----------------------------- try remove CamelAuction from AlHejin marketplace Contract ------------------*/

//     describe("Should remove CamelAuction from AlHejin marketplace Contract " + " : Negative Case", function () {

//         it("Should be a valid auction id ", async function () {

//             await expect(AlHejinContract.connect(User1).removeCamelAuction(7))
//                 .to.be.revertedWithCustomError(AlHejinContract, "InvalidAuctionId");

//         });
//         it("Should be a valid auction Owner ", async function () {

//             await expect(AlHejinContract.connect(User1).removeCamelAuction(4))
//                 .to.be.revertedWithCustomError(AlHejinContract, "InvalidOwner");

//         });

//     });

//     /*------------------------ remove CamelAuction from AlHejin marketplace Contract ---------------------------*/

//     describe("Should remove CamelAuction from AlHejin marketplace Contract " + " : Positive Case", function () {

//         it("Should remove the auction ", async function () {

//             await AlHejinContract.connect(User1).removeCamelAuction(5);
//             await AlHejinContract.connect(User2).removeCamelAuction(6);

//             assert.equal(await AlHejinContract.camelAuctionIndex(), 4);

//         });
//         it("Should not include the auction ids after remove ", async function () {

//             const camelAuctionIds = await AlHejinContract.getAllCamelAuctionId();
//             const camelAuctionIdsAsNumbers = camelAuctionIds.map(id => id.toNumber());
//             expect(camelAuctionIdsAsNumbers).to.not.include(5, 6);

//         });

//     });

//     /*---------------------------- try to buyCamel from AlHejin marketplace Contract ---------------------------*/

//     describe("Should buyCamel from AlHejin marketplace Contract " + " : Negative Case", function () {

//         it("Should be a valid auction id ", async function () {

//             await expect(AlHejinContract.connect(User3).buyCamel(5, User3.address))
//                 .to.be.revertedWithCustomError(AlHejinContract, "InvalidAuctionId");

//         });
//         it("Should give token approve to AlHejin marketplace contract to buy Camel ", async function () {

//             await expect(AlHejinContract.connect(User3).buyCamel(1, User3.address))
//             .to.be.revertedWith("ERC20: insufficient allowance");

//         });

//     });

//     /*------------------------------ buyCamel from AlHejin marketplace Contract -------------------------------*/

//     describe("Should buyCamel from AlHejin marketplace Contract " + " : Positive Case", function () {

//         it("Should give token approval ", async function () {

//             await ERC20Contract.connect(User3).approve(AlHejinContract.address, ethers.utils.parseEther("1.1"));
//             await ERC20Contract.connect(User4).approve(AlHejinContract.address, ethers.utils.parseEther("1.4"));

//             expect(ethers.utils.formatEther(await ERC20Contract.allowance(User3.address, AlHejinContract.address))).to.be.equal("1.1");
//             expect(ethers.utils.formatEther(await ERC20Contract.allowance(User4.address, AlHejinContract.address))).to.be.equal("1.4");

//         });
//         it("Should buy a camel ", async function () {
//             let balanceBefore;
//             let afterBalance;

//             /*---------------------------- buying Camel with aution id 1 ------------------------------------*/
//             balanceBefore = ethers.utils.formatEther(await ERC20Contract.balanceOf(User1.address));
//             await AlHejinContract.connect(User3).buyCamel(1, User3.address);
//             let platformfee1 = await calculatingPlatfromUsageFee(1.1);
//             afterBalance = parseFloat(balanceBefore) + (1.1 - platformfee1);
//             expect(ethers.utils.formatEther(await ERC20Contract.balanceOf(User1.address))).to.be.equal(afterBalance.toString());

//             /*---------------------------- buying Camel with aution id 2 ------------------------------------*/
//             balanceBefore = ethers.utils.formatEther(await ERC20Contract.balanceOf(User2.address));
//             await AlHejinContract.connect(User4).buyCamel(2, User4.address);
//             let platformfee2 = await calculatingPlatfromUsageFee(1.4);
//             afterBalance = parseFloat(balanceBefore) + (1.4 - platformfee2);
//             assert.equal(await AlHejinContract.camelAuctionIndex(), 2);
//             expect(ethers.utils.formatEther(await ERC20Contract.balanceOf(User2.address))).to.be.equal(afterBalance.toString());

//             /*----------------- Platform wallet getting aplatform fee on purchase --------------------------*/
//             expect(ethers.utils.formatEther(await ERC20Contract.balanceOf(PlatformWallet.address))).to.be.equal((platformfee1 + platformfee2).toString());

//         });

//         /*-------------------------------- calculating Platfrom Usage Fee---------------------------------*/

//         async function calculatingPlatfromUsageFee(price) {
//             try {

//                 let platformfee = parseFloat((await AlHejinContract.platformfeeValue())) / 100;
//                 let fee = price * platformfee / 100;
//                 return fee;

//             } catch (e) {
//                 console.log(e)
//             }
//         }
//         it("Should remove auction after camel is purchased ", async function () {

//             const camelAuctionIds = await AlHejinContract.getAllCamelAuctionId();
//             const camelAuctionIdsAsNumbers = camelAuctionIds.map(id => id.toNumber());
//             expect(camelAuctionIdsAsNumbers).to.not.include(1, 2, 5, 6);

//         });

//     });

//     /*------------------------------ try Re-Auction Camel to AlHejin marketplace -----------------------------*/

//     describe("Should Re-Auction Camel in AlHejin marketplace  " + " : Negative Case", function () {

//         it("Should be a valid auction id ", async function () {

//             await expect(AlHejinContract.connect(User3).reAuctionCamel(7, ethers.utils.parseEther("1.222"), "10"))
//                 .to.be.revertedWithCustomError(AlHejinContract, "InvalidAuctionId");

//         });
//         it("Should be a valid auction Owner ", async function () {

//             await expect(AlHejinContract.connect(User2).reAuctionCamel(3, ethers.utils.parseEther("2.2"), "15"))
//                 .to.be.revertedWithCustomError(AlHejinContract, "InvalidOwner");
//             await expect(AlHejinContract.connect(User1).reAuctionCamel(4, ethers.utils.parseEther("2.5"), "10"))
//                 .to.be.revertedWithCustomError(AlHejinContract, "InvalidOwner");

//         });
//         it("Should not re-auction before the Aution get expire  ", async function () {

//             await expect(AlHejinContract.connect(User1).reAuctionCamel(3, ethers.utils.parseEther("2.2"), "15"))
//                 .to.be.revertedWithCustomError(AlHejinContract, "CamelAuctionNotExpired");
//             await expect(AlHejinContract.connect(User2).reAuctionCamel(4, ethers.utils.parseEther("2.5"), "10"))
//                 .to.be.revertedWithCustomError(AlHejinContract, "CamelAuctionNotExpired");

//         });
//         it("Should increase time to expire auction camel Auction ", async function () {

//             /*-- increase time with 4 days + 30 sec as auction id (3 , 4) both will be expire at that time----*/
//             await helpers.time.increaseTo(Math.floor(Date.now() / 1000) + 4 * 24 * 60 * 60 + 30);

//         });
//         it("Should auction days must less then auction limit ", async function () {

//             await expect(AlHejinContract.connect(User1).reAuctionCamel(3, ethers.utils.parseEther("2.2"), "366"))
//                 .to.be.revertedWithCustomError(AlHejinContract, "InvalidAuctionDays");
//             await expect(AlHejinContract.connect(User2).reAuctionCamel(4, ethers.utils.parseEther("2.5"), "366"))
//                 .to.be.revertedWithCustomError(AlHejinContract, "InvalidAuctionDays");

//         });
//         it("Should unable to purchased after Auction get expired ", async function () {

//             await expect(AlHejinContract.connect(User4).buyCamel(4, User3.address))
//                 .to.be.revertedWithCustomError(AlHejinContract, "CamelAuctionExpired");

//         });

//     });

//     /*------------------------------ Re-Auction Camel to AlHejin marketplace ---------------------------------*/

//     describe("Should Re-Auction Camel in AlHejin marketplace  " + " : Positive Case", function () {

//         it("Should able to re-auction camel   ", async function () {

//             const camelAuctionIdsBefore = await AlHejinContract.getAllCamelAuctionId();
//             const camelAuctionIdsAsNumbersBefore = camelAuctionIdsBefore.map(id => id.toNumber());
//             expect(camelAuctionIdsAsNumbersBefore).to.include(3, 4);
//             expect(camelAuctionIdsAsNumbersBefore).to.not.include(1, 2, 5, 6);

//             await AlHejinContract.connect(User1).reAuctionCamel(3, ethers.utils.parseEther("25"), "5");
//             await AlHejinContract.connect(User2).reAuctionCamel(4, ethers.utils.parseEther("15.5"), "2");

//             const camelAuctionIdsAfter = await AlHejinContract.getAllCamelAuctionId();
//             const camelAuctionIdsAsNumbersAfter = camelAuctionIdsAfter.map(id => id.toNumber());
//             expect(camelAuctionIdsAsNumbersAfter).to.include(3, 4);
//             expect(camelAuctionIdsAsNumbersAfter).to.not.include(1, 2, 5, 6);

//         });
//         it("Should able to purchased after re-Auction ", async function () {

//             await ERC20Contract.connect(User4).approve(AlHejinContract.address, ethers.utils.parseEther("15.5"));
//             expect(ethers.utils.formatEther(await ERC20Contract.allowance(User4.address, AlHejinContract.address))).to.be.equal("15.5");

//             let balanceBefore = ethers.utils.formatEther(await ERC20Contract.balanceOf(User2.address));
//             await AlHejinContract.connect(User4).buyCamel(4, User4.address);
//             let platformfee = await calculatingPlatfromUsageFee(15.5);
//             let afterBalance = parseFloat(balanceBefore) + (15.5 - platformfee);
//             expect(ethers.utils.formatEther(await ERC20Contract.balanceOf(User2.address))).to.be.equal(afterBalance.toString());

//             /*-------------------------------- calculating Platfrom Usage Fee---------------------------------*/

//             async function calculatingPlatfromUsageFee(price) {
//                 try {

//                     let platformfee = parseFloat((await AlHejinContract.platformfeeValue())) / 100;
//                     let fee = price * platformfee / 100;
//                     return fee;

//                 } catch (e) {
//                     console.log(e)
//                 }
//             }

//         });

//         it("Should remove auction after camel is purchased ", async function () {

//             const camelAuctionIds = await AlHejinContract.getAllCamelAuctionId();
//             const camelAuctionIdsAsNumbers = camelAuctionIds.map(id => id.toNumber());
//             expect(camelAuctionIdsAsNumbers).to.not.include(1, 2, 5, 6);

//         });

//     });

//     /*------------------------- try to buyCamel after currency is removed Contract-----------------------------*/

//     describe("Should unable to buy Camel after currency is removed " + " : Negative Case", function () {

//         it("Should remove currency to check user will be able to purchase Camel Auction ", async function () {

//             await AlHejinContract.connect(AdminRole).removeCurrency("USDT");
//             expect(await AlHejinContract.allCurrenciesAllowed()).not.include("USDT"); // onReturn if we get array
//             assert.equal(await AlHejinContract.addressCurrency("USDT"), "0x0000000000000000000000000000000000000000");

//         });
//         it("Should unable to purchase auction after auction currency is removed ", async function () {

//             await ERC20Contract.connect(User3).approve(AlHejinContract.address, "1200000000000000000");

//             await expect(AlHejinContract.connect(User3).buyCamel(3, User3.address))
//                 .to.be.revertedWithCustomError(AlHejinContract, "InvalidCurrency");

//         });

//     });

//     /*------------------------- try update auction limit------------------------------------------------------*/

//     describe("Should update auction limit " + " : Negative Case", function () {

//         it("Should have admin role to update auction limit", async function () {

//             await expect(AlHejinContract.connect(User1).updateCamelAuctionLimit(60))
//                 .to.be.revertedWith("AccessControl: account 0x90f79bf6eb2c4f870365e785982e1f101e93b906 is missing role 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775");

//         });

//     });

//     /*------------------------- update auction limit----------------------------------------------------------*/

//     describe("Should update auction limit " + " : Positive Case", function () {

//         it("Should admin update auction limit ", async function () {

//             assert.equal(await AlHejinContract.camelAuctionMaxLimit(), 365);
//             await AlHejinContract.connect(AdminRole).updateCamelAuctionLimit(60);
//             assert.equal(await AlHejinContract.camelAuctionMaxLimit(), 60);

//         });

//     });


