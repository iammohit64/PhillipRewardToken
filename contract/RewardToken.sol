// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol"; // Corrected import path

/**
 * @title RewardToken
 * @dev ERC-20 token for PhillipCapital India's reward system
 * @notice Phillip Reward Token (PRT) - Used for rewarding users
 */
contract RewardToken is ERC20, Ownable, Pausable {
    
    // Events
    event UserRewarded(address indexed user, uint256 amount, uint256 timestamp);
    event TokensBurned(address indexed from, uint256 amount);
    
    // Constants
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18; // 1 million tokens
    uint256 public constant MAX_REWARD_PER_TX = 10_000 * 10**18; // 10,000 tokens
    
    // State variables
    mapping(address => uint256) public totalRewardsReceived;
    uint256 public totalRewardsDistributed;
    
    /**
     * @dev Constructor that mints initial supply to contract deployer
     */
    constructor() ERC20("Phillip Reward Token", "PRT") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Reward a user with tokens.
     * @param user Address of the user to reward
     * @param amount Amount of tokens to reward (in wei)
     * @notice Only owner can call this function.
     * @notice Amount must not exceed MAX_REWARD_PER_TX.
     */
    function rewardUser(address user, uint256 amount) external onlyOwner whenNotPaused {
        require(user != address(0), "Cannot reward zero address");
        require(amount > 0, "Reward amount must be greater than 0");
        require(amount <= MAX_REWARD_PER_TX, "Reward amount exceeds maximum limit");
        require(balanceOf(owner()) >= amount, "Insufficient balance in owner account");
        
        _transfer(owner(), user, amount);
        
        totalRewardsReceived[user] += amount;
        totalRewardsDistributed += amount;
        
        emit UserRewarded(user, amount, block.timestamp);
    }
    
    /**
     * @dev Batch reward multiple users.
     * @param users Array of user addresses
     * @param amounts Array of reward amounts
     */
    function rewardMultipleUsers(address[] calldata users, uint256[] calldata amounts) 
        external 
        onlyOwner 
        whenNotPaused 
    {
        require(users.length == amounts.length, "Arrays length mismatch");
        require(users.length > 0, "Empty arrays");
        require(users.length <= 100, "Too many users in single transaction");
        
        uint256 totalAmount = 0;
        
        for (uint256 i = 0; i < users.length; i++) {
            require(users[i] != address(0), "Cannot reward zero address");
            require(amounts[i] > 0, "Reward amount must be greater than 0");
            require(amounts[i] <= MAX_REWARD_PER_TX, "Reward amount exceeds maximum limit");
            totalAmount += amounts[i];
        }
        
        require(balanceOf(owner()) >= totalAmount, "Insufficient balance in owner account");
        
        for (uint256 i = 0; i < users.length; i++) {
            _transfer(owner(), users[i], amounts[i]);
            totalRewardsReceived[users[i]] += amounts[i];
            totalRewardsDistributed += amounts[i];
            emit UserRewarded(users[i], amounts[i], block.timestamp);
        }
    }
    
    /**
     * @dev Override transfer function to add pause functionality.
     */
    function transfer(address to, uint256 amount) 
        public 
        virtual 
        override 
        whenNotPaused 
        returns (bool) 
    {
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override transferFrom function to add pause functionality.
     */
    function transferFrom(address from, address to, uint256 amount) 
        public 
        virtual 
        override 
        whenNotPaused 
        returns (bool) 
    {
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev Get total rewards received by a user.
     * @param user Address of the user
     * @return Total rewards received
     */
    function getUserTotalRewards(address user) external view returns (uint256) {
        return totalRewardsReceived[user];
    }
    
    /**
     * @dev Pause all token transfers (emergency use).
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers.
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Burn tokens from caller's account.
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external {
        require(amount > 0, "Burn amount must be greater than 0");
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }
    
    /**
     * @dev Get contract metadata for display.
     */
    function getContractInfo() external view returns (
        string memory tokenName,
        string memory tokenSymbol,
        uint256 tokenTotalSupply,
        uint256 tokenDecimals,
        uint256 rewardsDistributed,
        address contractOwner
    ) {
        return (
            name(),
            symbol(),
            totalSupply(),
            decimals(),
            totalRewardsDistributed,
            owner()
        );
    }
}