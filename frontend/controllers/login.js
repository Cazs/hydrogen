hydrocar.controller('LoginController',['$scope','$http','$location','$routeParams',function($scope, $http, $location, routeParams)
{
  $scope.username = null;
  $scope.password = null;

  $scope.login = function()
  {
    if($scope.username && $scope.password)
    {
      try
      {
        $http(
          {
            method: "POST",
            url: "/api/auth",
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: function(obj)
            {
              return obj;
            },
            data: $.param({'usr':$scope.username, 'pwd':$scope.password})
          }).then(function(response)
          {
            if(response.status==200)
            {
              alert('Successfully logged in');
              var session = response.headers('Session');

              var session_attrs = session.split(';');
              /*window.session = function()
              {
                this.username=$scope.username;
              }*/
              window.session_user=$scope.username;

              session_attrs.forEach(function(attr)
              {
                if(attr)
                {
                  switch (attr.split('=')[0])
                  {
                    case 'session':
                      //$scope.session = attr.split('=')[1];
                      window.session = attr.split('=')[1];
                      //console.log($scope.session);
                      break;
                    case 'ttl':
                      window.session_ttl = attr.split('=')[1];
                      break;
                    case 'date':
                      window.session_date_issued = attr.split('=')[1];
                      break;
                    default:
                      console.log('Unknown session attribute "%s"', attr.split('=')[0])
                  }
                }
              });
              console.log('Successfully logged in');
            }
            console.log('Response: %s', response.statusText);
          });
      } catch (e)
      {
          console.log(e);
      }
    }else{
      console.log('invalid form data');
    }
  }
}]);
