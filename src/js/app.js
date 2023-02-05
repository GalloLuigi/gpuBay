App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load gpus
    $.getJSON('../gpus.json', function(data) {
      var gpusRow = $('#gpusRow');
      var gpuTemplate = $('#gpuTemplate');

      for (i = 0; i < data.length; i ++) {
        gpuTemplate.find('.panel-title').text(data[i].name);
        gpuTemplate.find('img').attr('src', data[i].picture);
        gpuTemplate.find('.gpu-condition').text(data[i].condition);
        gpuTemplate.find('.gpu-brand').text(data[i].brand);
        gpuTemplate.find('.gpu-architecture').text(data[i].architecture);
        gpuTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        gpusRow.append(gpuTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
        App.web3Provider = window.ethereum;
        try {
          // Request account access
           await window.ethereum.enable();
        } catch (error) {
        // User denied account access...
        console.error("User denied account access")
        }
     }
     // Legacy dapp browsers...
     else if (window.web3) {
        App.web3Provider = window.web3.currentProvider;
     }
     // If no injected web3 instance is detected, fall back to Ganache
     else {
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
     }
     web3 = new Web3(App.web3Provider);

     return App.initContract();
  },

  initContract: function() {
     $.getJSON('Adoption.json', function(data) {
        // Get the necessary contract artifact file and instantiate it with @truffle/contract
        var AdoptionArtifact = data;
        App.contracts.Adoption = TruffleContract(AdoptionArtifact);

        // Set the provider for our contract
        App.contracts.Adoption.setProvider(App.web3Provider);

        // Use our contract to retrieve and mark the adopted pets
        return App.markSold();
     });
     return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markSold: function() {
    var soldInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      soldInstance = instance;

       return soldInstance.getAdopters.call();
    }).then(function(adopters) {
       for (i = 0; i < adopters.length; i++) {
          if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
             $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
          }
       }
    }).catch(function(err) {
       console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var soldInstance;

    web3.eth.getAccounts(function(error, accounts) {
       if (error) {
          console.log(error);
       }

       var account = accounts[0];

       App.contracts.Adoption.deployed().then(function(instance) {
         soldInstance = instance;

          // Execute adopt as a transaction by sending account
          return soldInstance.buyGpu(petId, {from: account});
       }).then(function(result) {
          return App.markSold();
       }).catch(function(err) {
          console.log(err.message);
       });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
