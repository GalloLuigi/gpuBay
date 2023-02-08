App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load gpus
    $.getJSON('../gpus.json', function(data) {
      var gpusRow = $('#gpusRow');
      var gpuTemplate = $('#gpuTemplate');

      var orderRow = $('#orderRow');
      var orderTemplate = $('#orderTemplate');

      for (i = 0; i < data.length; i ++) {
        gpuTemplate.find('.panel-title').text(data[i].name);
        gpuTemplate.find('img').attr('src', data[i].picture);
        gpuTemplate.find('.gpu-condition').text(data[i].condition);
        gpuTemplate.find('.gpu-brand').text(data[i].brand);
        gpuTemplate.find('.gpu-architecture').text(data[i].architecture);
        gpuTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        gpusRow.append(gpuTemplate.html());
      }
      for (i = 0; i < data.length; i ++) {

            orderTemplate.find('.panel-title').text(data[i].name);
            orderTemplate.find('img').attr('src', data[i].picture);
            orderTemplate.find('.gpu-condition').text(data[i].condition);
            orderTemplate.find('.gpu-brand').text(data[i].brand);
            orderTemplate.find('.gpu-architecture').text(data[i].architecture);
            orderTemplate.find('.btn-adopt').attr('data-id', data[i].id);
    
            orderRow.append(orderTemplate.html());

         
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


   onInit: async function() {
   await window.ethereum.enable();
   const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
   const account = accounts[0];
   console.log(account)
    window.ethereum.on('accountsChanged', function (accounts) {
       // Time to reload your interface with accounts[0]!
       console.log(accounts[0])
      });
   return account;
},

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '.showOrder', App.handleCurrent);
  },

  markSold: function() {
    var soldInstance;
console.log(document.name);
    App.contracts.Adoption.deployed().then(function(instance) {
      soldInstance = instance;

       return soldInstance.getAdopters.call();
    }).then(function(adopters) {
      $('.gpuBay').text("Your current address: "+window.ethereum.selectedAddress);

       for (i = 0; i < adopters.length; i++) {
          if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
             $('.panel-pet').eq(i).find('button').text('Sold').attr('disabled', true);
            

          }

          if(document.name=="Order" || document.name=="Order.html")
          {
            $('.panel-pet').eq(i).find('button').text('Trovato');

          }
       }

       for (i = 0; i < adopters.length; i++) {
         if (adopters[i] == '0x0000000000000000000000000000000000000000') {
            $('.panel-order').eq(i).find('button').text('').attr('disabled', true).parent().hide();
            $('.panel-order').eq(i).find('button').text('').attr('disabled', true).parent().parent().hide();
            

         }
         /*
         else if(adress(this)==adopters[i]){
               console.log("1 EQUALS")
         }
         */
      }

    }).catch(function(err) {
       console.log(err.message);
    });
  },

  markCurrentOrder:function() {
   var soldInstance;
console.log("Mark current orders");
   App.contracts.Adoption.deployed().then(function(instance) {
     soldInstance = instance;
     console.log("After sold instance");

      return soldInstance.getCurrentOrders.call();
   }).then(function(adopters) {
      console.log(window.ethereum.selectedAddress);
      //const account= App.onInit();
       window.ethereum.enable();
      const accounts =  window.ethereum.request({ method: 'eth_requestAccounts' });
      $('.tit').text("Your orders")
      for (i = 0; i < adopters.length; i++) {
            console.log("Sono nel ciclo");
            console.log("adopter[i]:");
            console.log(adopters[i]);
            if(window.ethereum.selectedAddress==adopters[i]){
               //$('.panel-pet').eq(i).find('button').text('SoldC').attr('disabled', true);
               $('.panel-order').eq(i).find('button').text('Sold to you').attr('disabled', true);
            }
           else{
            $('.panel-order').eq(i).find('button').text('').attr('disabled', true).parent().hide();
            $('.panel-order').eq(i).find('button').text('').attr('disabled', true).parent().parent().hide();
            
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
  ,

  handleCurrent: function(event) {
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

          return App.markCurrentOrder();
         }).then(function(result) {
          return App.markCurrentOrder();
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
