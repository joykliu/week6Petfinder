'use strict';

let petApp = {};
	petApp.apiKey = '6e0b64b1d094adcd97940c98d9e86423';
	petApp.apiUrlPup = 'http://api.petfinder.com/pet.find';
	petApp.apiUrlShelter = 'http://api.petfinder.com/shelter.find';

// ------ making ajax call for pet data ----//
petApp.getPet = (query) => {
	return $.ajax({
			url: petApp.apiUrlPup,
			method: 'GET',
			dataType: 'JSONP',
			data: {
				key: petApp.apiKey,
				location: query,
				format: 'json',
				animal: "dog",
				count: 200
			} // /data
	});// /$.ajax
};// /.getPet
// ------- making ajax call for shelter data -----//
petApp.getShelter = (query) => {
	return $.ajax({
			url: petApp.apiUrlShelter,
			method: 'GET',
			dataType: 'JSONP',
			data: {
				key: petApp.apiKey,
				location: query,
				format: 'json',
				count: 100
			} // /data
		});// /$.ajax
};// /.getShelter

// ------------------ initiating App --------------//
petApp.init = () => {
	$('.searchForm').on('submit', function(e) {
	    e.preventDefault();
	    $('.svgWrapper').fadeIn();
	    petApp.locationInput = $('input[name=location]').val();
	    $('input[name=location]').val('');
		// ---- promise --- //
		$.when(petApp.getPet(petApp.locationInput), petApp.getShelter( petApp.locationInput)).done((gotPet, gotShelter) => {
				const pets = gotPet[0].petfinder.pets.pet;
				const shelters = gotShelter[0].petfinder.shelters.shelter;
				const petsInShelter = () => {
					shelters.forEach(function(shelterObj) {
						shelterObj.pet = pets.filter(function(petObj) {
							return petObj.shelterId.$t === shelterObj.id.$t;
						});// /.filter
					});// .forEach()
					petApp.shelterWithPets = shelters.filter(function(shelterObj){
						return shelterObj.pet.length > 0;
					});// /.filter
				}//.petsInShelter();
				if (!petApp.mymap) {
					petApp.initMap();
					$("main").removeClass("hide");
					$("footer").removeClass("hide");
					setTimeout(function(){
						$('html, body').animate({scrollTop:750}, 700);
					}, 1000);
					if (document.documentElement.clientWidth <= 500) {
						setTimeout(function(){
							$('html, body').animate({scrollTop:680}, 650);
						}, 1000);
					}
				} // if
// ------------------ calling function to display shelter, pass query to only display shelter that have pets.
// --------------  In map.js, we grab those shelter's longtitude and latitude and assign them to makers	--------------
				petsInShelter();
				petApp.displayShelter(petApp.shelterWithPets);
			}) //.done
			.fail(function(err1, err2) {
				alert('No Puppies for you :/');
			}); //.fail
	}); // form on submit
// ------------------ defining eventlistener, when the status of checkboxes change--------------
	$('input[type=checkbox]').on('change', function(e) {

		/* Note: here are three very similar things. write a
		generic fucntion to store them*/

		function getInputAndValue(param) {
			return $(`input[name=${param}]:checked`).map((input, value) => {
				return $(value).val();
			}).toArray();
		};

		const checkedValuesAge = getInputAndValue('age');
		const checkedValuesSize = getInputAndValue('size');
		const checkedValuesSex = getInputAndValue('sex');


		const checkedValuesAgeDefault = ["Baby", "Young", "Adult", "Senior"];


		const checkedValuesSizeDefault = ["S", "M", "L", "XL"];
		const checkedValuesSexDefault = ["F", "M"];

		petApp.mymap.removeLayer(petApp.markerGroup);

		let filteringPets = (shelterDataset, checkedValues, checkedDefault, filterCategory, petData, petData2) => {
			petApp.newShelter = shelterDataset.map(shelter => {
				if (checkedValues.length !== 0) {
					/* use var here because let and const restrics
					the value of variables to within the block */
					var filteredPets = checkedValues.map( criteria => {
						return shelter[petData].filter( pet => {
							if (filterCategory === 'age') {
								return pet.age.$t === criteria;
							} else if (filterCategory === 'size') {
								return pet.size.$t === criteria;
							} else if (filterCategory === 'sex') {
								return pet.sex.$t === criteria;
							}
						}); // /.filter
					});// /.map
				} else {
					var filteredPets = checkedDefault.map( criteria => {
						return shelter[petData].filter(pet => {
							if (filterCategory === 'age') {
								return pet.age.$t === criteria;
							} else if (filterCategory === 'size') {
								return pet.size.$t === criteria;
							} else if (filterCategory === 'sex') {
								return pet.sex.$t === criteria;
							}
						});
					});
				};
				const flattenedPets = $.map(filteredPets, function(n){
					return n;
				});// /$.map, a flatten method
				shelter[petData2] = flattenedPets;
				return shelter;
			}).filter(shelter => {
				return shelter[petData2].length > 0;
			});	// /.petApp.newShelter
		};

		filteringPets(petApp.shelterWithPets, checkedValuesAge, checkedValuesAgeDefault, 'age', 'pet', 'finalpet');
		filteringPets(petApp.newShelter, checkedValuesSize, checkedValuesSizeDefault, 'size', 'finalpet', 'finalpet2');
		filteringPets(petApp.newShelter, checkedValuesSex, checkedValuesSexDefault, 'sex', 'finalpet2', 'finalpet3');

		petApp.displayShelter(petApp.newShelter);
	}); // /.$('input[type=checkbox]').on('change',....)
}; // /.petApp.init()
// ------------------ when document is ready, aka when page is loaded, start running petApp.--------------
// ------------------ defining function called petApp.init
// ------------------ storing action required to start loading map
petApp.initMap = () => {
	const accessToken = 'pk.eyJ1Ijoiam95OTAxN21hcGJveCIsImEiOiJjaW94M2RneXQwMDJ1d2ZtNXp4a29pbTV4In0.TebEkoRfRP8E0hw_Nd3PFA';
	const mapboxTiles = L.tileLayer('https://api.mapbox.com/v4/mapbox.run-bike-hike/{z}/{x}/{y}@2x.png?access_token=' + accessToken, {
	    attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	});
	petApp.mymap = L.map('mapid').addLayer(mapboxTiles);
	petApp.mymap.scrollWheelZoom.disable();
};// /.initMap()
// ------------------ defining function to use to display shelters
petApp.displayShelter = (shelters) => {
	$('.secondForm').fadeIn();
// ------------------ create empty array to store makers
	L.shelterMarker = L.Marker.extend ({
		options: {
			shelterID: null
		},
		getShelterID: () => {
			return this.options.shelterID;
		}
	});
	var markers = [];
// ------------------ loop through the array to pass on as parameter, aka to-be-displayed-shelters
	shelters.forEach(shelterLocation => {
		const myPopup = L.DomUtil.create('div', 'infoWindow');
		myPopup.innerHTML = `
			<div data-shelterID="${shelterLocation.id.$t}">
				<div class="clientDog">
					<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 79.5" enable-background="new 0 0 100 79.5" xml:space="preserve"><path d="M45.811,30.889H11.669l-6.483-3.677c-1.668-0.946-3.787-0.361-4.733,1.308c-0.946,1.668-0.36,3.788,1.308,4.734l7.962,4.514 v36.178c0,3.067,2.487,5.555,5.555,5.555c3.069,0,5.556-2.487,5.556-5.555V59.292l10.512,17.505c0,0.003,0.001,0.005,0.003,0.007 c1.578,2.63,4.991,3.483,7.622,1.902c2.63-1.58,3.483-4.992,1.904-7.623L31.749,55.89h21.029v18.056 c0,3.067,2.488,5.555,5.556,5.555c3.068,0,5.557-2.487,5.557-5.555V55.762c0.806-0.288,1.388-1.051,1.388-1.956V39.223l0.027-0.03 L45.811,30.889z"></path><rect id="bark" class="animated flash"x="86.11" y="22.556" width="13.89" height="2.777"></rect><rect id="bark" class="animated flash" x="83.149" y="12.798" transform="matrix(0.8673 -0.4978 0.4978 0.8673 4.8952 46.7339)" width="13.89" height="2.777"></rect><rect id="bark" class="animated flash" x="76.112" y="5.328" transform="matrix(0.4966 -0.868 0.868 0.4966 35.9792 75.4719)" width="13.889" height="2.778"></rect><path id="head" class='animated wobble' d="M70.833,25.333l5.557-9.722L69.444,4.5L56.847,18.58L50,17l1.804,7.217l-3.042,3.4l19.489,8.302l9.526-10.586H70.833z  M63.194,21.167c-1.15,0-2.084-0.932-2.084-2.083c0-1.151,0.934-2.083,2.084-2.083s2.083,0.932,2.083,2.083 C65.277,20.234,64.345,21.167,63.194,21.167z"></path></svg>
				</div>
				<div class="shelterInfo">
					<h3>${shelterLocation.name["$t"]}</h3>
					<p>${shelterLocation.city["$t"]}, ${shelterLocation.state["$t"]} ${shelterLocation.zip["$t"]}</p>
					<p>${shelterLocation.email.$t}
				</div>
			</div>`
		;
		const latLng = L.latLng(shelterLocation.latitude.$t, shelterLocation.longitude.$t);
// ------------------ use leaflet L.marker() and pass on the L.latLng() to create readable marker elements
		const markerIcon = L.icon ({
			iconUrl: "./images/marker.png",
			iconAnchor: [16, 40],
			popupAnchor:  [0, -33]
		});

		const marker = new L.shelterMarker(latLng, {
			alt: shelterLocation.name.$t,
			shelterID: shelterLocation.id.$t,
			icon: markerIcon
		});
		marker.bindPopup(myPopup);
		myPopup.addEventListener('click', () => {
			$('.flickity-container').empty().removeClass("hide");
			$('.closeFlickity').removeClass("hide");
			let popupDivID = $(myPopup).children()[0].dataset.shelterid;
			let hideFlickity = () => {
				$(".flickity-container").flickity("destroy");
				$(".flickity-container").addClass("hide");
				$(this).addClass("hide");
				$('.closeFlickity').addClass('hide');
			}

			petApp.shelterWithPets.forEach(shelter => {
				if ($.isEmptyObject(shelter.finalpet3)){
					shelter.pet.forEach(pup => {
						if(pup.shelterId.$t === popupDivID) {
							if(pup.media.photos){
								$(".flickity-container").append(`
									<div class="carouselElem">
										<div class="pupPic">
											<img src="${pup.media.photos.photo[2].$t}" alt="picture of ${pup.name.$t}" />
										</div>
										<div class="pupDetail">
											<div class="pupInfo">
												<h3 class="carousel-title">${pup.name.$t}</h3>
												<p>Age: ${pup.age.$t}</p>
												<p>Size: ${pup.size.$t}</p>
												<p>Gender: ${pup.sex.$t}</p>
											</div>
											<div class="pupHead">
												<h3 class="carousel-title">${shelter.name.$t}</h3>
												<h3 class="carousel-subtitle">${shelter.city.$t}</h3>
											</div>
										</div>
									</div>
								`)
							} else {
								$(".flickity-container").append(`
									<div class="carouselElem">
										<div class="pupPic">
											<img src="images/nophoto.png" alt="no phto available" />
										</div>
										<div class="pupDetail">
											<div class="pupInfo">
												<h3 class="carousel-title">${pup.name.$t}</h3>
												<p>Age: ${pup.age.$t}</p>
												<p>Size: ${pup.size.$t}</p>
												<p>Gender: ${pup.sex.$t}</p>
											</div>
											<div class="pupHead">
												<h3 class="carousel-title">${shelter.name.$t}</h3>
												<h3 class="carousel-subtitle">${shelter.city.$t}</h3>
											</div>
										</div>
									</div>
								`)
							}// if has photos
						}// if not filtered show original pets
					}) //.forEach()
				} else {
					shelter.finalpet3.forEach(pup => {
						if(pup.shelterId.$t === popupDivID) {
							if(pup.media.photos) {
								$(".flickity-container").append(`
									<div class="carouselElem">
										<div class="pupPic">
											<img src="${pup.media.photos.photo[2].$t}" alt="picture of ${pup.name.$t}" />
										</div>
										<div class="pupDetail">
											<div class="pupHead">
												<h3>${shelter.city.$t}</h3>
												<h3>${shelter.name.$t}</h3>
											</div>
											<div class="pupInfo">
												<h3>${pup.name.$t}</h3>
												<p>Age: ${pup.age.$t}</p>
												<p>Size: ${pup.size.$t}</p>
												<p>Gender: ${pup.sex.$t}</p>
											</div>
										</div>
									</div>
								`)
							} else {
								$(".flickity-container").append(`
									<div class="carouselElem">
										<div class="pupPic">
											<img src="images/nophoto.png" alt="no phto available" />
										</div>
										<div class="pupDetail">
											<div class="pupHead">
												<h3>${shelter.city.$t}</h3>
												<h3>${shelter.name.$t}</h3>
											</div>
											<div class="pupInfo">
												<h3>${pup.name.$t}</h3>
												<p>Age: ${pup.age.$t}</p>
												<p>Size: ${pup.size.$t}</p>
												<p>Gender: ${pup.sex.$t}</p>
											</div>
										</div>
									</div>
								`)
							} // if has photos
						} //if filted show filtered pets
					}); //.forEach()
				} // if filtered === true
			}); // .forEach()
			$(".closeFlickity").on('click', () => {
				hideFlickity();
			})

			$(document).keyup(e => {
				if (e.keyCode === 27) {
					hideFlickity();
				}
			});
			$(".flickity-container").flickity({ "imagesLoaded": true, "pageDots": false });
		});//.addEventListener
		// ------------------ push all created markers into the empty array created before
		markers.push(marker);
	}); // /.shelter.forEach()

// ------------------ use leaflet's L.featureGroup() to store all markers, and store the method as a property inside petApp
	petApp.markerGroup = L.featureGroup(markers);
// ------------------ use leaflet's .findBounds() to get the square that contains all markers center the map at the center of all markers
	petApp.mymap.fitBounds(petApp.markerGroup.getBounds());
// ------------------ display all markers on the map
	petApp.markerGroup.addTo(petApp.mymap);
};// /petApp.displayShelter()

$(function() {
	petApp.init();
}); // /.documentReady
