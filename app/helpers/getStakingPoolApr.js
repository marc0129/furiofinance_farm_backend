const { model } = require("mongoose");
const Web3 = require("web3");
const addresses = require("../constants/addresses");
const DEFAULT_CHAINID = require("../constants/chainId");
const uri = require("../constants/uri");
const StakingPoolABI = require("../abis/contracts/stakingPool.json").abi;
const tokenPrices = require("./getTokenPrices");

if (typeof web3 !== 'undefined') {
    var web3 = new Web3(web3.currentProvider)
} else {
    var web3 = new Web3(new Web3.providers.HttpProvider(uri[DEFAULT_CHAINID]));
}

let stakingPoolApr;

const getStakingPoolApr = async () => {
    try {
        const stakingPoolAddress = addresses['stakingPool'][DEFAULT_CHAINID];
        const stakingPoolContract = new web3.eth.Contract( StakingPoolABI, stakingPoolAddress);

        const furFiPrice =  tokenPrices.getPrices('furfi');
        const bnb_furfi_lp_Price =  tokenPrices.getPrices('bnb_furfi_lp');

        const totalStaked = (await stakingPoolContract.methods.totalStaked().call()) / Math.pow(10, 18);
        const lastStakeRewardsFurFi = (await stakingPoolContract.methods.lastStakeRewardsFurFi().call()) / Math.pow(10, 18);
        const lastStakeFurFiRewardsDuration = await stakingPoolContract.methods.lastStakeFurFiRewardsDuration().call();
        const lastStakeRewardsLP = (await stakingPoolContract.methods.lastStakeRewardsLP().call()) / Math.pow(10, 18);
        const lastStakeLPRewardsDuration = await stakingPoolContract.methods.lastStakeLPRewardsDuration().call();
        const lastFurFiMintRoundMaskUpdateBlock = await stakingPoolContract.methods.lastFurFiMintRoundMaskUpdateBlock().call();
        const additionalMintAmountIn365days = (await stakingPoolContract.methods.getFurFiMintRewardsInRange(lastFurFiMintRoundMaskUpdateBlock, lastFurFiMintRoundMaskUpdateBlock + 365 * 24 * 3600 / 3).call()) / Math.pow(10, 18);

        const furFiRewardsAPR = ( lastStakeRewardsFurFi == 0 || lastStakeFurFiRewardsDuration == 0 ) ? 0 : lastStakeRewardsFurFi / totalStaked * (365 * 24* 3600) / lastStakeFurFiRewardsDuration;
        const lpRewardsAPR = ( lastStakeRewardsLP == 0 || lastStakeLPRewardsDuration == 0 )? 0 : (lastStakeRewardsLP * bnb_furfi_lp_Price) / (totalStaked * furFiPrice) * (365 * 24* 3600) / lastStakeLPRewardsDuration;
        const additionalMintRewardsAPR = ( additionalMintAmountIn365days == 0 || totalStaked == 0 )? 0 : additionalMintAmountIn365days / totalStaked;

        stakingPoolApr =  furFiRewardsAPR + lpRewardsAPR + additionalMintRewardsAPR;                   
        return stakingPoolApr;

    } catch (err) {
        // console.log(err);
        return stakingPoolApr;
    }
}
module.exports = getStakingPoolApr;