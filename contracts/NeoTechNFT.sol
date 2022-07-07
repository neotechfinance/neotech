// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NeoTechNFT is Initializable, OwnableUpgradeable, ERC721Upgradeable {

    uint256 public price;
    uint256 public maxSupply;
    uint256 public maxSupplyForCurrentPhase;
    uint256 public lastTokenId;
    bool public paused;
    string public baseURI;
    address public paymentMethod;

    function initialize(
        uint256 _price,
        uint256 _maxSupplyForCurrentPhase,
        bool _paused,
        address _paymentMethod
    ) external initializer {
        __ERC721_init("NeoTech", "NEO");
        __Ownable_init();

        maxSupply = 10000;
        lastTokenId = 0;

        price = _price;
        maxSupplyForCurrentPhase = _maxSupplyForCurrentPhase;
        paused = _paused;
        paymentMethod = _paymentMethod;
    }

    function mint(uint256 _numTokens) external payable {
        require(paused == false, "Contract is paused.");
        require(
            maxSupplyForCurrentPhase >= lastTokenId + _numTokens,
            "Minted tokens would exceed supply allocated for the current phase."
        );
        require(
            maxSupply >= lastTokenId + _numTokens,
            "Minted tokens would exceed supply."
        );

        IERC20(paymentMethod).transferFrom(msg.sender, address(this), _numTokens * price);

        uint256 i;
        for (; i < _numTokens; i++) {
            lastTokenId++;
            _safeMint(msg.sender, lastTokenId);
        }
    }

    function mintTeam(address _receiver, uint256 _numTokens) external onlyOwner {
        require(
            maxSupply >= lastTokenId + _numTokens,
            "Minted tokens would exceed supply."
        );
    
        uint256 i;
        for (; i < _numTokens; i++) {
            lastTokenId++;
            _safeMint(_receiver, lastTokenId);
        }
    }

    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
    }

    function setPaymentMethod(address _paymentMethod) public onlyOwner {
        paymentMethod = _paymentMethod;
    }

    function setPaused(bool _paused) public onlyOwner {
        paused = _paused;
    }

    function setMaxSupplyForCurrentPhase(uint256 _maxSupplyForCurrentPhase) public onlyOwner {
        maxSupplyForCurrentPhase = _maxSupplyForCurrentPhase;
    }

    function withdraw(address _receiver) public onlyOwner {
        uint _balance = address(this).balance;
        require(_balance > 0, "No ether left to withdraw");

        payable(_receiver).transfer(_balance);
    }

    function withdrawERC20(address _tokenContractAddress, address _receiver) public onlyOwner {
        IERC20 _tokenContract = IERC20(_tokenContractAddress);
        uint _balance = _tokenContract.balanceOf(address(this));
        require(_balance > 0, "No tokens left to withdraw");

        _tokenContract.transfer(_receiver, _balance);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory newBaseURI) public virtual onlyOwner {
        baseURI = newBaseURI;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Upgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}