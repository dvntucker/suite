angular.module('gsApp.workspaces', [
  'ngGrid',
  'gsApp.workspaces.workspace',
  'gsApp.core.utilities'
])
.config(['$stateProvider',
    function($stateProvider) {
      $stateProvider
        .state('workspaces', {
          url: '/workspaces',
          templateUrl: '/workspaces/workspaces.tpl.html',
          controller: 'WorkspacesCtrl'
        })
        .state('workspace.new', {
          url: '/new?workspaces',
          templateUrl: '/workspaces/detail/workspace-new.tpl.html',
          controller: 'NewWorkspaceCtrl'
        })
        .state('workspace', {
          abstract: true,
          url: '/workspaces/:workspace',
          templateUrl: '/workspaces/detail/workspace.tpl.html'
        });
    }])
.controller('WorkspacesCtrl', ['$scope', 'GeoServer', '$state', '$log',
  '$rootScope', 'AppEvent',
    function($scope, GeoServer, $state, $log, $rootScope, AppEvent) {
      $scope.title = 'All Workspaces';

      $scope.onWorkspaceClick = function(ws) {
        $state.go('workspace.home', {
          workspace: ws
        });
      };

      $scope.pagingOptions = {
        pageSizes: [25, 50, 100],
        pageSize: 25
      };

      $scope.gridOptions = {
        data: 'workspaceData',
        columnDefs: [
          {
            field: 'name',
            displayName: 'Name',
            cellTemplate: '<a ng-click="onWorkspaceClick(row.getProperty(' +
              '\'name\'))">{{row.getProperty(\'name\')}}</a>'
          },
          {
            field: 'default',
            displayName: 'Default?'
          }
        ],
        enablePaging: true,
        enableColumnResize: false,
        showFooter: true,
        pagingOptions: $scope.pagingOptions,
        filterOptions: {
          filterText: '',
          useExternalFilter: true
        }
      };

      GeoServer.workspaces.get().then(
        function(result) {
          if (result.success) {
            $scope.workspaceData = result.data;
            $rootScope.$broadcast(AppEvent.WorkspacesFetched,
              $scope.workspaceData);
          } else {
            $scope.alerts = [{
                type: 'warning',
                message: 'Could not get workspaces.',
                fadeout: true
              }];
          }
        });

    }])
.controller('NewWorkspaceCtrl', ['$scope', '$stateParams', 'GeoServer',
  '$state', '$log', '$rootScope',
    function($scope, $stateParams, GeoServer, $state, $log, $rootScope) {
      $scope.workspaces = $stateParams.workspaces;
      $scope.title = 'Create New Workspace';
      $scope.createSettings = {'uri': 'http://', 'default': false};
      $scope.workspaceCreated = false;

      $scope.cancel = function() {
        $state.go('workspaces');
      };

      $scope.updateUri = function() {
        $scope.createSettings.uri = 'http://' + $scope.createSettings.name;
      };

      $scope.create = function() {
        var newWorkspace = {
          'name': $scope.createSettings.name,
          'uri': $scope.createSettings.uri,
          'default': $scope.createSettings.default
        };
        GeoServer.workspace.create(newWorkspace).then(
          function(result) {
            if (result.success || result.status===201) {
              $scope.workspaceCreated = true;
              if ($scope.workspaces) {
                $scope.workspaces.push(newWorkspace);
              }
              $rootScope.alerts = [{
                type: 'success',
                message: 'Workspace '+ newWorkspace.name +' created.',
                fadeout: true
              }];
            } else {
              var msg = result.data.message?
                result.data.message : result.data;
              $rootScope.alerts = [{
                type: 'warning',
                message: msg,
                fadeout: true
              }];
            }
          });
      };
    }]);