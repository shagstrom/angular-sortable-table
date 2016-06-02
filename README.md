# Angular sortable table

Directives and filter for creating a sortable table.

Install with

    bower install angular-sortable-table

or

    npm install @shagstrom/angular-sortable-table

## Complete example:

Directives, filter and service is documented below the complete example.

    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
            <title>Angular sortable table example</title>
            <link rel="stylesheet" href="bower_components/font-awesome/css/font-awesome.min.css">
            <script src="bower_components/angular/angular.js"></script>
            <script src="bower_components/angular-sortable-table.js"></script>
            <style>
                th.sortable { cursor: pointer; }
                th.sortable:after { content: "\f0dc"; padding-left: 5px; font-family: FontAwesome; font-size: 12px; }
                th.sortable.asc:after { content: "\f0de"; }
                th.sortable.desc:after { content: "\f0dd"; }
            </style>
            <script>
                angular.module('angular-sortable-table-example', [ 'shagstrom.angular-sortable-table' ])
                    .controller('MainCtrl', function ($scope) {
                        $scope.countryMappings = {
                            "GH": "Ghana",
                            "GQ": "Equatorial Guinea",
                            "GR": "Greece"
                        };
                        $scope.people = [
                            { name: "John", age: 34, countryCode: "GQ" },
                            { name: "Sahra", age: 36, countryCode: "GH" },
                            { name: "Desmond", age: 19, countryCode: "GR" },
                            { name: "Carole", age: 25, countryCode: "GH" },
                            { name: "Annie", age: 25, countryCode: "GQ" }
                        ];
                    });
            </script>
        </head>
        <body ng-app="angular-sortable-table-example" ng-controller="MainCtrl">
            <h1>Angular sortable table example</h1>
            <table sortable-table="personSortObject" sortable-table-options="{ multipleColumns: true }">
                <thead>
                    <tr>
                        <th sortable-column="name">Name</th>
                        <th sortable-column="age">Age</th>
                        <th sortable-column="countryCode:countryMappings[value]">Country</th>
                    </tr>
                </thead>
                <tbody>
                    <tr ng-repeat="person in people | sortTable: personSortObject">
                        <td>{{person.name}}</td>
                        <td>{{person.age}}</td>
                        <td>{{countryMappings[person.countryCode]}}</td>
                    </tr>
                </tbody>
            </table>
        </body>
    </html>

## sortableTable

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

The following options are set using the sortable-table-options attribute:

<dl>
    <dt>multipleColumns</dt>
    <dd>true/false; for allowing sort on multiple columns</dd>
</dl>

Usage:

    <table sortable-table="personSortObject" sortable-table-options="{ multipleColumns: true }">
        <thead>
            <tr>
                <th sortable-column="name">Name</th>
                <th sortable-column="age">Age</th>
            </tr>
        </thead>
        <tbody>
            <tr ng-repeat="person in people | sortTable:personSortObject">
                <td>{{person.name}}</td>
                <td>{{person.age}}</td>
            </tr>
        </tbody>
    </table>

## sortableColumn

Directive for making a column sortable.

Basic usage sortable-column="name", where "name" is the field to sort on.

You can define a transformer, that is used in "sortTable" filter and can be used
when writing you own sorting code.

The transformer will be parsed and "obj" and "value" will be available. The transformer
is defined after ":" in the directive attribute value. All transformers will be found in the sortObject.

Usage:

    <table sortable-table="personSortObject">
        <thead>
            <tr>
                <th sortable-column="name">Name</th>
                <th sortable-column="countryCode:countryMappings[value]">Country</th>
            </tr>
        </thead>
        <tbody>
            <tr ng-repeat="person in people | sortTable:personSortObject">
                <td>{{person.name}}</td>
                <td>{{countryMappings[person.countryCode]}}</td>
            </tr>
        </tbody>
    </table>

## sortTable

Basic filter for sorting table rows based on sortObject.

Usage:

    <table sortable-table="personSortObject">
        <thead>
            <tr>
                <th sortable-column="name">Name</th>
            </tr>
        </thead>
        <tbody>
            <tr ng-repeat="person in people | sortTable:personSortObject">
                <td>{{person.name}}</td>
            </tr>
        </tbody>
    </table>

## SortableTableService

Service containing helper functions.

