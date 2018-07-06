
App = {
    web3Provider: null,
    contracts: {},

    init: function()
    {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
          } else {
            // If no injected web3 instance is detected, fall back to Ganache
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
          }
          web3 = new Web3(App.web3Provider);

          return App.initContract();
    },

    initContract: function() {
        $.getJSON('VehicleRegistry.json', function(data) {
          // Get the necessary contract artifact file and instantiate it with truffle-contract
          var VehicleRegistryArtifact = data;
          App.contracts.VehicleRegistry = TruffleContract(VehicleRegistryArtifact);
        
          // Set the provider for our contract
          App.contracts.VehicleRegistry.setProvider(App.web3Provider);
          
          App.PopulateVehicles();
          App.GetAdmin();
        });

        
      },
    
      /* bindEvents: function() {
        $(document).on('click', '.btn-adopt', App.handleAdopt);
      }, */

    RegisterVehicle: function () {
        let make = $("#make").val();
        let model = $("#model").val();
        let year = $("#year").val();
        let color = $("#color").val();
        let licensePlate = $("#licensePlate").val();
        let VIN = $("#VIN").val();

        let ownerAddress = getCookie("ownerAddress");
        let commission = 1;

        /* App.contracts.VehicleRegistry.deployed().then(function(instance){
            instance.Balance().then(function(balance){
                console.log(balance);
            });
        }); */

        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
              console.log(error);
            }
        
            var account = accounts[0];

            App.contracts.VehicleRegistry.deployed().then(function(contractInstance){
                contractInstance.RegisterVehicle(make, model, year, color, licensePlate, VIN, { value: web3.toWei(commission, 'ether'), gas: 1400000, from: ownerAddress }).then(function () {
                    successMessage("Vehiclehas been registered and added to <a href=\"registry.html\">your vehicles</a>.");
                }).catch(function (e) {
                    warningMessage(e);
                });
            });
        });
        
    },

    PopulateVehicles: function(){

        App.contracts.VehicleRegistry.deployed().then(function(contractInstance){
            contractInstance.NumberOfVehicles.call().then(function (NumberOfVehicles) {
                let ownerAddress = getCookie("ownerAddress");
                $("#itemTable").empty();

                for (let i = 0; i < NumberOfVehicles; i++)
                {
                    contractInstance.vehicles.call(i).then(function (vehicle) {
                        if (window.location.pathname.toString() == "/registry.html")
                            App.iterateVehicles(vehicle, ownerAddress);
                        else if (window.location.pathname.toString() == "/registered_vehicles.html")
                            App.iterateVehicles(vehicle, null);


                    });

                }
            });
        }).catch(function (e) {
                warningMessage(e);
            });

            console.log("PopulateVehicles completed");
    },

    iterateVehicles: function(vehicle, ownerAddress)
    {
        let owner = vehicle[1];
        let make = vehicle[2];
        let model = vehicle[3];
        let year = vehicle[4];
        let color = vehicle[5];
        let licensePlate = vehicle[6];
        let VIN = vehicle[7];

        //console.log(owner.toString() + " - " + ownerAddress.toString());
        //console.log(owner.toUpperCase() == ownerAddress.toUpperCase());
        if((ownerAddress!=null && owner.toUpperCase()==ownerAddress.toUpperCase()) || ownerAddress==null)
        {
            let owner_t = "<td>" + owner + "</td>";
            let make_t = "<td>" + make + "</td>";
            let model_t = "<td>" + model + "</td>";
            let year_t = "<td>" + year + "</td>";
            let color_t = "<td>" + color + "</td>";
            let licensePlate_t = "<td>" + licensePlate + "</td>";
            let VIN_t = "<td>" + VIN + "</td>";

            let resultRow = make_t +model_t + year_t + color_t +licensePlate_t + VIN_t
            if (ownerAddress == null)
            {
                resultRow += owner_t;
            }

            resultRow = "<tr>" + resultRow + "</tr>";
            console.log(resultRow);
            $("#itemTable").append(resultRow);
        }


    },

    GetAdmin: function () {
        App.contracts.VehicleRegistry.deployed().then(function (contractInstance) {
            contractInstance.admin.call().then(function (admin) {
                document.cookie = "adminAccount=" + admin;

            });
        });

        console.log("GetAdmin completed");
    },
};

function warningMessage(message){
  $('.messageAlert').html(message);
  $('.messageAlertContainer').attr("class", "messageAlertContainer alert alert-danger")
  $('.messageAlertContainer').show();
};

function successMessage(message){
  $('.messageAlert').html(message);
  $('.messageAlertContainer').attr("class", "messageAlertContainer alert alert-success")
  $('.messageAlertContainer').show();
};

function closeAlert() {
  $('.messageAlertContainer').hide();
};

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

function adjustNavbar(){
    var addr = getCookie("ownerAddress");
  if (addr == ""){
    $('.private').hide();
    $('#hidden-when-logged').show();
    // zilch
  } else {
    $('.private').show();
    $('#hidden-when-logged').hide();
  };
};


window.login = function () {
    document.cookie = "ownerAddress=" + $("#Account").val();
    window.location = "registry.html";
};

window.logout = function () {
    document.cookie = "ownerAddress=";
    window.location = "index.html";
};



$(function() {
    $(window).load(function() {
      adjustNavbar();
      App.init();
      //App.PopulateVehicles();
      //App.GetAdmin();
    });
 });
