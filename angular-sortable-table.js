angular.module('shagstrom.angular-sortable-table', [])

	.service('SortableTableService', function($location) {

		function strToArr(str) {
			var arr = [];
			if (str) {
				angular.forEach(str.split(','), function (it) {
					var fieldAndDir = it.split(':');
					arr.push({ field: fieldAndDir[0], dir: fieldAndDir[1] });
				});
			}
			return arr;
		}

		function arrToStr(arr) {
			var sorts = [];
			angular.forEach(arr, function (it) { sorts.push(it.field + ':' + it.dir); });
			return sorts.join(',');
		}

		function getSortObject(sortQueryName) {
			var sortQuery = $location.search()[sortQueryName];
			if (!angular.isString(sortQuery)) {
				sortQuery = '';
			}
			return strToArr(sortQuery);
		}

		function setSortQuery(sortQueryName, sortObject) {
			var sortStr = arrToStr(sortObject);
			if (sortStr) {
				$location.search(sortQueryName, sortStr);
			} else {
				$location.search(sortQueryName, null);
			}
		}

		function findSortItem(sortObject, field) {
			for (var i = 0; i < sortObject.length; i++) {
				if (sortObject[i].field === field) {
					return sortObject[i];
				}
			}
		}

		function findSortItemIndex(sortObject, field) {
			for (var i = 0; i < sortObject.length; i++) {
				if (sortObject[i].field === field) {
					return i;
				}
			}
			return -1;
		}

		function updateSortObject(sortObject, field, multipleColumns) {
			if (!multipleColumns) {
				var sortItem1 = findSortItem(getSortObject, field);
				if (sortItem1) {
					return [ sortItem1 ];
				} else {
					return [];
				}
			}
			var i = findSortItemIndex(sortObject, field);
			if (i >= 0) {
				var sortItem2 = sortObject[i];
				sortObject.splice(i, 1);
				if (sortItem2.dir === 'desc') {
					sortItem2.dir = 'asc';
					sortObject.push(sortItem2);
				}
			} else {
				sortObject.push({ field: field, dir: 'desc' });
			}
		}

		return {
			findSortItem: findSortItem,
			updateSortObject: updateSortObject,
			getSortObject: getSortObject,
			setSortQuery: setSortQuery
		};

	})

	.directive('sortableTable', function (SortableTableService) {

		return {
			restrict: 'A',
			controller: function ($scope, $attrs) {
				var sortObjectName = $attrs.sortableTable;
				$scope[sortObjectName] = {
					sorts: SortableTableService.getSortObject(sortObjectName),
					transforms: {}
				};
				this.registerColumn = function (name, transform) {
					if (transform) {
						$scope[sortObjectName].transforms[name] = transform($scope);
					}
				};
				this.updateSort = function (name) {
					SortableTableService.updateSortObject($scope[sortObjectName].sorts, name, true);
					SortableTableService.setSortQuery(sortObjectName, $scope[sortObjectName].sorts);
				};
				this.getSortObjectName = function () {
					return sortObjectName;
				};
			}
		};
	})

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
				element.on('click.sortable-column', function () {
					scope.$apply(function () {
						tableCtrl.updateSort(field, transform);
					});
				});
				scope.$watch(tableCtrl.getSortObjectName(), function (sortObject) {
					var sortItem = SortableTableService.findSortItem(sortObject, field);
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
				scope.$on('$destroy', function () {
					element.off('click.sortable-column');
				});
			}
		};
	})

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
			angular.forEach(sortObject.sorts, function (sortItem) {
				var transform = sortObject.transforms[sortItem.field];
				var value = transform ? transform : function (obj) { return obj[sortItem.field]; };
				console.log(sortItem.field);
				newArray.sort(function (a, b) {
					if (sortItem.dir === 'desc') {
						return compare(value(a), value(b));
					} else {
						return compare(value(b), value(a));
					}
				});
			});
			return newArray;
		};
	});

