// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.18;

contract LotteryGame{
    
    uint128 private _lotterTicketLimit;
    uint128 private _ticketSold;
    uint private _ticketPrice;
    address private _owner;
    address public lastWinner;
    uint public lastTicketWinner;

    address payable[] private ticketOwner;

    event Purchase(address walletAddress,uint noOfTicket);


    constructor(uint64 lotterTicketLimit,uint ticketPrice){
        _ticketSold = 0;
        _lotterTicketLimit = lotterTicketLimit;
        _ticketPrice = ticketPrice;
        _owner = msg.sender;
    }

    modifier onlyOwner{
        require(msg.sender == _owner,"invalid owner");
        _;
    }


    function ticketLimit()public view returns(uint128 ){
        return _lotterTicketLimit;
    }


    function totalTicketSold()public view returns(uint128 ){
        return _ticketSold;
    }

    function priceOfTicket()public view returns(uint ){
        return _ticketPrice;
    }


    function updateTicketLimit(uint64 newTicketLimit)external onlyOwner{

        assembly{
            let slotValue := sload(_lotterTicketLimit.slot)
            
            let clearSlot := and(slotValue, 0xffffffffffffffffffffffffffffffff00000000000000000000000000000000)
            let bitShifted := shl(mul(_lotterTicketLimit.offset, 8), newTicketLimit)
            let mergeSlot := or(bitShifted, clearSlot)

            sstore(_lotterTicketLimit.slot, mergeSlot)
        }

    }

    function updateTicketPrice(uint ticketPrice)external onlyOwner{

       assembly{
           sstore(_ticketPrice.slot, ticketPrice)
       }

    }

    function currentLotteryCollection() public view returns (uint) {
        return address(this).balance;
    }

    function _purchaseLottery(address wallet)internal{

        ticketOwner.push(payable(wallet));
        ++_ticketSold;
        

    } 

    function purchaseLottery(uint noOfTicket, address wallet)payable external{

        require(noOfTicket > 0);
        require(totalTicketSold() + noOfTicket <= ticketLimit(),"Exceed Ticket Limit ");
        require(msg.value == noOfTicket * _ticketPrice);

        for (uint256 index = 0; index < noOfTicket; ++index) {
            _purchaseLottery(wallet);
        }
        emit Purchase(wallet, noOfTicket);
       
    } 

    function getTicketOwner(uint tickedId)public view returns(address){
      return ticketOwner[tickedId];
    }


    function _announceLotteryWinner(address wallet)internal onlyOwner{

        uint randomNum = uint256(
            keccak256(
                abi.encode(
                    wallet,
                    tx.gasprice,
                    block.number,
                    block.timestamp,
                    block.prevrandao,
                    blockhash(block.number - 1),
                    (_lotterTicketLimit - 1)
                )
            )
        );
        uint randomIndex =  randomNum %  _lotterTicketLimit;

        address payable winnerAddress = ticketOwner[randomIndex];
        winnerAddress.transfer(address(this).balance);
        lastTicketWinner = randomIndex;
        lastWinner = winnerAddress;
        ticketOwner = new address payable[](0);

    }


    function announceLotteryWinner()payable external onlyOwner{

        require(totalTicketSold() == ticketLimit() ,"Ticket not fully sold");
        _announceLotteryWinner(msg.sender);
        _ticketSold = 0;

    }

}