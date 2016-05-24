angular.module('angular-sortable-table-example', [ 'shagstrom.angular-sortable-table' ])

	.controller('MainCtrl', function ($scope) {
		$scope.getCountyMapping = function (person) {
			console.log(person);
			return $scope.countyMappings[person.county];
		};
		$scope.countyMappings = {
			"01": "Stockholm",
			"02": "Skåne",
			"03": "Kalmar"
		};
		$scope.people = [
			{
				name: "John",
				age: 34,
				county: "01"
			},
			{
				name: "Sahra",
				age: 36,
				county: "02"
			},
			{
				name: "Desmond",
				age: 19,
				county: "03"
			},
			{
				name: "Carole",
				age: 25,
				county: "02"
			},
			{
				name: "Annie",
				age: 25,
				county: "01"
			}
		];
	});
