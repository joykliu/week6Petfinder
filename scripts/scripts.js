var petApp = {};
	petApp.apiKey = '6e0b64b1d094adcd97940c98d9e86423';
	petApp.apiUrlPup = 'http://api.petfinder.com/pet.find';
	petApp.apiUrlShelter = 'http://api.petfinder.com/shelter.find'

petApp.getPet = function (query) {
	return $.ajax({
			url: petApp.apiUrlPup,
			method: 'GET',
			dataType: 'JSONP',
			data: {
				key: petApp.apiKey,
				location: query,
				format: 'json',
				animal: "dog",
				count: 100
			}
	});
};

petApp.getShelter = function (query) {
	return $.ajax({
			url: petApp.apiUrlShelter,
			method: 'GET',
			dataType: 'JSONP',
			data: {
				key: petApp.apiKey,
				location: query,
				format: 'json',
				count: 100
			}
	});
};
// petApp.displayPet = function(pets){
// 	console.log(pets);
// };

petApp.init = function () {
	$.when(petApp.getPet('toronto, ON'), petApp.getShelter('toronto, ON')) 

		.done(function(gotPet, gotShelter){
			var pets = gotPet[0].petfinder.pets.pet;
			console.log(pets, "woof")
			var shelters = gotShelter[0].petfinder.shelters.shelter;
			// console.log(shelters)

			shelters.forEach(function(shelterObj) {
				var filteredPets = pets.filter(function(petObj) {
					return petObj.shelterId.$t === shelterObj.id.$t
				});
				shelterObj.pet = filteredPets;//this takes each objects out of our shelters array, creats a property called pet, whichs stores out filtered puppies
			});
			console.log(shelters[6])
		}) //done
		.fail(function(err1, err2) {
			console.log(err1, err2)
		}); //fail

};

$(function() {
	petApp.init();
});

// get data about puppies

// once page is loaded, do ajax call

// give the user an option to geoloate or put in location (postalcode/city, province)

// filter out user's puppies based on form input value

// take array of dogs's shelter id value

// take array of shelter's shelter id value 

// check dogs' shelter id value against array of shelter's shelter id value 

// group dogs with the same shelter id

//if the dog's shelter id matches shelter's shelter id, push into a= 

// take matched shelter's location (lat; lng)

// map out shelters

// use a foreach loop to find pets and shelters

// use a filter method to filter out pets that share the id we want 
