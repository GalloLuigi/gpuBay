pragma solidity ^0.5.0;



contract Adoption {
	address[16] public adopters;
	

	// Adopting a pet
	function buyGpu(uint petId) public returns (uint) {
		require(petId >= 0 && petId <= 15);

		adopters[petId] = msg.sender;

		return petId;
	}

	// Retrieving the adopters
	function getAdopters() public view returns (address[16] memory) {
  		return adopters;
	}

		function getCurrentOrders() public view returns (address[16] memory) {
  		

		address[16] memory buyed;

		for(uint i=0;i<15;i++){
			//if(address(this)!=adopters[i]){
				buyed[i]=adopters[i];
			//}
			//else{
			//	buyed[i]=address(0);
			//}
		}
		

		return buyed;
	}



			function getCurrentUser() public view returns (address) {
  		
		

		return address(this);
	}
}
