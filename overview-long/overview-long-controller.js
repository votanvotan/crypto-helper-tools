cryptotracky.controller('overviewLongController', function($rootScope, $http, $scope, localStorageService) {

	var localStorageKey = "overviewSettings-long";
	var overviewSettings = localStorageService.get(localStorageKey);
	if (!overviewSettings) {
		localStorageService.set(localStorageKey,
			{
				minVolume : 50,
				maxItemsInterval : 5,
				intervals : "30,60,90,120,150,180,210,240,270,300",
			}
		);
		overviewSettings = localStorageService.get(localStorageKey);
	}

	//Default sort on coinTableMain
	$rootScope.orderByField = 'coin';
	$rootScope.reverseSort =  false;

	//Functions for coin ignores are next
	var ignoreListLong = [];
	if (localStorage["ignoreListLong"] === undefined) {
		//ignoreListLong = undefined;
	}
	else {
		ignoreListLong = localStorage["ignoreListLong"].split(",");
	}

	$rootScope.ignore = function(key) {
		ignoreListLong.push(key);
		localStorage.setItem("ignoreListLong", ignoreListLong.join(","));

		//update data without loading new data
		updateData(true);
	};

	$rootScope.resetHide = function(){
		localStorage.removeItem("ignoreListLong");
		ignoreListLong = [];

		//update data without loading new data
		updateData(true);
	}

	//Function for updating data
	var tempResponse = [];
	function updateData(keepOldData){
		if(tempResponse == [] || !keepOldData){
			$http.get(backend).
			then(handleResponse);

		}else{
			handleResponse(tempResponse, keepOldData);
		}
	}

	//Initalize variables
	$scope.inputIntervals = overviewSettings.intervals.split(",");
	backend = "http://34.240.107.131:1338/min?intervals=" + $scope.inputIntervals;
	backend = "http://localhost:1338/min?intervals=" + $scope.inputIntervals;
	$rootScope.firstInterval = Math.min.apply(null, $scope.inputIntervals);
	$rootScope.headers = $scope.inputIntervals;

	$scope.inputMinVolume = overviewSettings.minVolume;



	var lastItems;
	var coins = {};
	var coin, startPrice, currentPrice, startVolume, currentVolume, hide;
	var keys;

	var tops = {};

	function handleResponse(response, keepOldData) {
		if (response.data && response.data.ETH.log.length) {
			//Fill tempResponse for updating without retrieving
			tempResponse = {data: response.data};

			//Fill / Update the ingnoreList in the rootScope for display on page
			$rootScope.ignoreListLong = localStorage["ignoreListLong"];

			var coins = Object.keys(response.data);
			$rootScope.finalList = [];
			var coinData;
			coins.forEach(function(key) {
				if (ignoreListLong.indexOf(key) == -1){
					coinData = response.data[key];

					if(coinData.volume.toFixed(0) > overviewSettings.minVolume){
						$rootScope.finalList.push({
							coin: coinData.coin,
							current: coinData.current.toFixed(8),
							volume: Number(coinData.volume.toFixed(0)),
							high: coinData.high.toFixed(8),
							low: coinData.low.toFixed(8),
							log: coinData.log.map(function(x){
								x = Number(x);
								if(isNaN(x)){
									x=-9999;
								};
								return x;
							}),
						});
					};
				}
			});
		}
	}

	//Start the code and load new data
	updateData();

	//Update the data with new data in x msec
	setInterval(function() {
		updateData();
	}, 60000);


});