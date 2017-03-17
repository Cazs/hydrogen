const hydrocar = angular.module('hydrocar',['ngRoute']);

hydrocar.config(function($routeProvider)
{
  $routeProvider.when('/', {redirectTo:'/home'})
  .when('/home',
  {
      controller:'HomeController',
      templateUrl:'views/home.html'
  })
  .when('/about',
  {
      templateUrl:'views/about.html'
  })
  .when('/contact',
  {
      templateUrl:'views/contact.html'
  })
  .when('/sponsors',
  {
      templateUrl:'views/sponsors.html'
  });
});
