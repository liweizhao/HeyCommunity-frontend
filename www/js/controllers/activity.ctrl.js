HeyCommunity

.controller('ActivityCtrl', function($scope, $http) {
    $http.get('/api/activity').then(function(response) {
        $scope.activities = response.data;
    });
})
