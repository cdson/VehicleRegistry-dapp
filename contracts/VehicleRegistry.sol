pragma solidity ^0.4.11;
contract VehicleRegistry
{
    address public admin; //owner of the contract after deploying
    uint256 commission;
    mapping(uint256=>Vehicle) public vehicles;//collection of vehicles mapped using vehicle id`
    uint256 public NumberOfVehicles;//total number of registered vehicles
   
    event VehicleRegistered(uint256 id,address owner);
    event VehicleTransferred(uint256 id,address OldOwner, address NewOwner);
    
    constructor() public
    {
        admin = msg.sender;
        NumberOfVehicles = 0;
        commission = 1000000000000000000; //1 ether
    }
    
    struct Vehicle
    {
        uint256 id;
        address owner;
        string make;
        string model;
        string year;
        string color;
        string licensePlate;
        string VIN;
    }
    
    //Current NumberOfVehicles value is set as Vehicle.id, used as the key in mapping
    function RegisterVehicle(string make,string model,string year, string color, string licensePlate,string VIN) public payable
    {
        if(msg.value<commission) revert("Not enuogh ether provided.");
        
        Vehicle memory vehicle;
        vehicle.id = NumberOfVehicles;
        vehicle.owner = msg.sender;
        vehicle.make = make;
        vehicle.model=model;
        vehicle.year=year;
        vehicle.color=color;
        vehicle.licensePlate = licensePlate;
        vehicle.VIN=VIN;
        
        vehicles[NumberOfVehicles]=vehicle;
        emit VehicleRegistered(NumberOfVehicles,vehicle.owner);
        NumberOfVehicles+=1;
    }
    
    //change owner of the vehicle`
    function TransferOwnership(uint256 id, address newOwner) public payable
    {
        require (msg.value >= commission);// revert("Not enough ether provided.");
        require (vehicles[id].owner == msg.sender);// revert("Owner record matching failed.");
        address oldOwner = vehicles[id].owner;
        vehicles[id].owner = newOwner;
        emit VehicleTransferred(id, oldOwner, newOwner);
       
    }
    
    modifier ownerOnly()
    {
        require(msg.sender == admin);
        _;
    }

    function GetBalance() public ownerOnly view returns(uint256 balance)
    {
        return address(this).balance;
    }

    function Withdraw(uint256 balance) public ownerOnly returns(bool success)
    {
        require(balance <= address(this).balance);// revert("Insufficient balance.");
        //if(!admin.send(balance)) revert("Transaction failed."); //Transfer throws on failure (preferred)
        admin.Transfer(balance);
        return true;
    }
   
   function SetCommission(uint256 newCommission) public ownerOnly
   {
       commission = newCommission;
   } 
   
   function ChangeAdmin(address newAdmin) public ownerOnly
   {
       admin = newAdmin;
   }
   
   //fallback
   function() public payable 
   { 
       
   }
   
    function kill() public ownerOnly
    {
        selfdestruct(admin);
    }

}