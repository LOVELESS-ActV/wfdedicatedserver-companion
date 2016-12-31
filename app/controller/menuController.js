angular.module("DSApp")
.controller("menuController", function ($scope) {
  $scope.nav = [{label:'Home',url:'#/'},{label:'Top',url:'#top'},{label:'Full list',url:'#all'},{label:'Search',url:'#search'},{label:'Credits',url:'#credits'}];
});
