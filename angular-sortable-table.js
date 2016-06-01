angular.module('shagstrom.angular-sortable-table', [])

	/**
		Directive for setting up a sortable table.

		The attribut value is name of the sort object that will be added to scope. The name
		of the sort object will also be as search parameter name in the browser url.

		The sort object has this format:

		{
			sortItems: [ {
				field: 'name',
				dir: 'asc'
			}, {
				field: 'countryCode',
				dir: 'desc'
			}, 
				...
			],
			transformers: {
				countryCode: function ...,
				...
			}
		}

		Usage:

		<table sortable-table="personSort">
			<thead>
				<tr>
					<th sortable-column="name">Name</th>
					<th sortable-column="countryCode:countryMappings[value]">Country</th>
				</tr>
			</thead>
			<tbody>
				<tr ng-repeat="person in people | sortTable:personSort">
					<td>{{person.name}}</td>
					<td>{{countryMappings[person.countryCode]}}</td>
				</tr>
			</tbody>
		</table>

	*/
	.directive('sortableTable', function (SortableTableService) {

		return {
			restrict: 'A',
			controller: function ($scope, $attrs) {
				this.sortObjectName = $attrs.sortableTable;
				$scope[this.sortObjectName] = {
					sortItems: SortableTableService.getSortItems(this.sortObjectName),
					transforms: {}
				};
				this.registerColumn = function (name, transform) {
					if (transform) {
						$scope[this.sortObjectName].transforms[name] = function (obj, field) {
							return transform($scope, { obj: obj, value: obj[field] });
						};
					}
				};
				this.updateSort = function (name) {
					SortableTableService.updateSortObject($scope[this.sortObjectName].sortItems, name, false);
					SortableTableService.setSortQuery(this.sortObjectName, $scope[this.sortObjectName].sortItems);
				};
				this.getSortObjectName = function () {
					return sortObjectName;
				};
			}
		};
	})

	/**
	
		Directive for making a column sortable.

		Basic usage sortable-column="name", where "name" is the field to sort on.

		You can define a transformer, that is used in "sortTable" filter and can be used
		when writing you own sorting code.

		The transformer will be parsed and "obj" and "value" will be available. The transformer
		is defined after ":" in the directive attribute value.

		Usage:

		<table sortable-table="personSort">
			<thead>
				<tr>
					<th sortable-column="name">Name</th>
					<th sortable-column="countryCode:countryMappings[value]">Country</th>
				</tr>
			</thead>
			<tbody>
				<tr ng-repeat="person in people | sortTable:personSort">
					<td>{{person.name}}</td>
					<td>{{countryMappings[person.countryCode]}}</td>
				</tr>
			</tbody>
		</table>

	*/
	.directive('sortableColumn', function ($parse, SortableTableService) {

		return {
			restrict: 'A',
			require: '^sortableTable',
			link: function (scope, element, attrs, tableCtrl) {
				var field;
				var transform;
				var indexOfFirstColon = attrs.sortableColumn.indexOf(":");
				if (indexOfFirstColon === -1) {
					field = attrs.sortableColumn;
				} else {
					field = attrs.sortableColumn.substr(0, indexOfFirstColon);
					transform = $parse(attrs.sortableColumn.substr(indexOfFirstColon + 1));
				}
				tableCtrl.registerColumn(field, transform);
				element.addClass('sortable');
				element.on('mousedown', function (event) {
					// Prevent select on double-click
					event.preventDefault();
				});
				element.on('click', function (event) {
					scope.$apply(function () {
						tableCtrl.updateSort(field);
					});
				});
				scope.$watch(tableCtrl.sortObjectName + '.sortItems', function (sortItems) {
					var sortItem = SortableTableService.findSortItem(sortItems, field);
					if (sortItem) {
						if (sortItem.dir === 'asc') {
							element.removeClass('desc').addClass('asc');
						} else {
							element.removeClass('asc').addClass('desc');
						}
					} else {
						element.removeClass('asc desc');
					}
				}, true);
			}
		};
	})
	
	/**

		Basic filter for sorting table rows based on sortObject.

		Usage:

		<table sortable-table="personSort">
			<thead>
				<tr>
					<th sortable-column="name">Name</th>
				</tr>
			</thead>
			<tbody>
				<tr ng-repeat="person in people | sortTable:personSort">
					<td>{{person.name}}</td>
				</tr>
			</tbody>
		</table>

	*/
	.filter('sortTable', function () {
		function compare(a, b) {
			if (a === b) {
				return 0;
			} else {
				return a < b ? -1 : 1;
			}
		}
		return function (array, sortObject) {
			var newArray = [].concat(array);
			angular.forEach(sortObject.sortItems, function (sortItem) {
				var transform = sortObject.transforms[sortItem.field];
				var value = transform ? function (obj) { return transform(obj, sortItem.field); } : function (obj) { return obj[sortItem.field]; };
				newArray.sort(function (a, b) {
					if (sortItem.dir === 'asc') {
						return compare(value(a), value(b));
					} else {
						return compare(value(b), value(a));
					}
				});
			});
			return newArray;
		};
	})

	/**
		Helper functions.
	*/
	.service('SortableTableService', function($location) {

		function strToArr(str) {
			var arr = [];
			if (str) {
				var parts = str.split(',');
				for (var i = 0; i < parts.length; i++) {
					var fieldAndDir = parts[i].split(':');
					arr.push({ field: fieldAndDir[0], dir: fieldAndDir[1] });
				}
			}
			return arr;
		}

		function arrToStr(arr) {
			var sortItems = [];
			for (var i = 0; i < arr.length; i++) {
				sortItems.push(arr[i].field + ':' + arr[i].dir);
			}
			return sortItems.join(',');
		}

		function getSortItems(sortQueryName) {
			var sortQuery = $location.search()[sortQueryName];
			if (!angular.isString(sortQuery)) {
				sortQuery = '';
			}
			return strToArr(sortQuery);
		}

		function setSortQuery(sortQueryName, sortItems) {
			var sortStr = arrToStr(sortItems);
			if (sortStr) {
				$location.search(sortQueryName, sortStr);
			} else {
				$location.search(sortQueryName, null);
			}
		}

		function findSortItem(sortItems, field) {
			for (var i = 0; i < sortItems.length; i++) {
				if (sortItems[i].field === field) {
					return sortItems[i];
				}
			}
		}

		function findSortItemIndex(sortItems, field) {
			for (var i = 0; i < sortItems.length; i++) {
				if (sortItems[i].field === field) {
					return i;
				}
			}
			return -1;
		}

		function updateSortObject(sortItems, field, multipleColumns) {
			if (!multipleColumns) {
				var sortItem1 = findSortItem(sortItems, field);
				sortItems.splice(0, sortItems.length);
				if (sortItem1) {
					sortItems.push(sortItem1);
				}
			}
			var i = findSortItemIndex(sortItems, field);
			if (i >= 0) {
				var sortItem2 = sortItems[i];
				sortItems.splice(i, 1);
				if (sortItem2.dir === 'asc') {
					sortItem2.dir = 'desc';
					sortItems.push(sortItem2);
				}
			} else {
				sortItems.push({ field: field, dir: 'asc' });
			}
		}

		return {
			findSortItem: findSortItem,
			updateSortObject: updateSortObject,
			getSortItems: getSortItems,
			setSortQuery: setSortQuery
		};

	});
