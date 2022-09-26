angular.module('app.controllers', [])
  
.controller('aPICSampleCtrl', ['$scope', '$stateParams', '$http', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams,$http) {
 
 var urlBase = 'https://api.eu.apiconnect.ibmcloud.com/fredericdutheilfribmcom-fdulondonspace/sb/api/Customers'; //MUST REPLACE WITH API URL

  var headersBase =

  {
    'X-IBM-Client-Id': '262fc263-3776-422b-bdcb-f2c1649a8d3d', //MUST REPLACE WITH CLIENT ID
    'X-IBM-Client-Secret': 'vJ0aE1wI4kI6aT5fO8pD8uI2sS7sN4pD0cW6kJ6nQ8mY4qS5rH', //MUST REPLACE WITH CLIENT SECRET
    'content-type': 'application/json',
    'accept': 'application/json'
  }

$scope.loadData = function(){
    console.log('Refresh');

 var req = {
   method: 'GET',
   url: urlBase,
   headers: headersBase
  }

 $http(req).then(function(response){
    console.log(JSON.stringify(response));
      $scope.items = response.data;
  });

 };

$scope.$on('$ionicView.afterEnter', function() {
$scope.loadData();
console.log('AFTER ENTER FIRED');
});


}])
   
.controller('cloudTabDefaultPageCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
    