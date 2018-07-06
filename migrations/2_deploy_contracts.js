var VehicleRegistry = artifacts.require("./VehicleRegistry.sol");


module.exports = function(deployer) {
  deployer.deploy(VehicleRegistry);
};
