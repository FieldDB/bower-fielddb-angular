/* globals console, window, document */
"use strict";
// var angularFieldDB = angular.module("FieldDB", []);
// for (var modelName in FieldDB) {
//   if (!FieldDB.hasOwnProperty(modelName)) {
//     continue;
//   }
//   angularFieldDB.factory("FieldDB" + modelName + "Factory",
//     function() {
//       return FieldDB[modelName];
//     });
// }
angular.module("fielddbAngular", [
  "ngAnimate",
  "ngCookies",
  "ngTouch",
  "ngSanitize",
  "ui.router",
  "ui.bootstrap",
  "angularFileUpload",
  "contenteditable"
]).run(["$rootScope", "$state", "$stateParams",
  function($rootScope, $state, $stateParams) {
    // From UI-Router sample
    // It's very handy to add references to $state and $stateParams to the $rootScope
    // so that you can access them from any scope within your applications.For example,
    // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
    // to active whenever 'contacts.list' or one of its decendents is active.
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    console.log(" state ", $state, $stateParams);
  }
]).config(["$urlRouterProvider", "$sceDelegateProvider", "$stateProvider", "$locationProvider", function($urlRouterProvider, $sceDelegateProvider, $stateProvider, $locationProvider) {

  var fieldDBApp;
  if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application) {
    fieldDBApp = FieldDB.FieldDBObject.application;
  } else {
    fieldDBApp = new FieldDB.App({
      authentication: {
        user: new FieldDB.User({
          authenticated: false
        })
      },
      contextualizer: new FieldDB.Contextualizer().loadDefaults(),
      online: true,
      apiURL: "https://localhost:3183",
      offlineCouchURL: "https://localhost:6984",
      brand: "Example",
      brandLowerCase: "example",
      website: "http://example.org",
      faq: "http://app.example.org/#/faq",
      // basePathname: window.location.origin + "/#", //might be necessary for apache
      basePathname: "/",
    });
  }

  fieldDBApp.knownConnections = FieldDB.Connection.knownConnections;
  fieldDBApp.currentConnection = FieldDB.Connection.defaultConnection(window.location.href, "passByReference");

  fieldDBApp.debug("Loaded fielddbAngular module ");
  fieldDBApp.debug($urlRouterProvider, $stateProvider);
  fieldDBApp.debugMode = true;

  /* Overriding bug and warn messages to use angular UI components
   TODO use angular modal for bugs */
  FieldDB.FieldDBObject.bug = function(message) {
    console.warn(message);
  };
  FieldDB.FieldDBObject.warn = function(message) {
    console.warn(message);
  };

  /* Add Event listeners */
  document.addEventListener("logout", function() {
    fieldDBApp.bug("user has logged out, page will reload to clear state and take them to the welcome page.");
  }, false);
  document.addEventListener("authenticate:fail", function() {
    fieldDBApp.warn("user isn't able to see anything, show them the welcome page");
    // fieldDBApp.authentication.error = "";
    console.log("  Redirecting the user to the welcome page");
    //http://joelsaupe.com/programming/angularjs-change-path-without-reloading/
    // $location.path("/welcome", false);
  }, false);

  /* Set up white list of urls where resources (such as images, audio, video or other primary data)
  can be displayed in the app */
  fieldDBApp.whiteListCORS = fieldDBApp.whiteListCORS || [];
  fieldDBApp.whiteListCORS = fieldDBApp.whiteListCORS.concat([
    "https://youtube.com/**",
    "https://youtu.be/**",
    "https://soundcloud.com/**",
    "http://opensourcefieldlinguistics.github.io/**",
    "http://*.example.org/**",
    "https://*.example.org/**",
    "https://localhost:3184/**",
    "https://localhost/**"
  ]);
  $sceDelegateProvider.resourceUrlWhitelist(fieldDBApp.whiteListCORS);

  /* Set up the base path of the app, needed for running in Android assets and/or running in HTML5 mode */
  if (window.location.pathname.indexOf("android_asset") > -1) {
    fieldDBApp.basePathname = window.location.pathname;
  }
  if (window.location.hash.indexOf("#") > -1) {
    fieldDBApp.basePathname = window.location.pathname + "#";
  }
  $locationProvider.html5Mode(true);


  var passStateParamsController = function($stateParams) {
    console.log("Loading ", $stateParams);
    var paramsChanged = false;
    if (!fieldDBApp.routeParams) {
      paramsChanged = true;
    } else {
      for (var param in $stateParams) {
        if ($stateParams.hasOwnProperty(param) && fieldDBApp.routeParams[param] !== $stateParams[param]) {
          paramsChanged = true;
        }
      }
    }

    if (paramsChanged) {
      fieldDBApp.processRouteParams($stateParams);
      fieldDBApp.debug(fieldDBApp.routeParams);
    }
  };
  passStateParamsController.$inject = ["$stateParams"];
  
  /* Add some default Routes/States which the app knows how to render */
  if (FieldDB.Router.otherwise) {
    $urlRouterProvider.otherwise(FieldDB.Router.otherwise.redirectTo);
  } else {
    $urlRouterProvider.otherwise(fieldDBApp.basePathname);
  }
  $stateProvider
  // HOME STATES AND NESTED VIEWS ========================================
    .state("dashboard", {
      url: "/",
      templateUrl: "app/main/main.html",
      controller: passStateParamsController
    })
    // nested list with custom controller
    .state("dashboard.team", {
      url: "^/:team",
      template: "<div>User {{application.routeParams.team}}</div>",
      controller: passStateParamsController
    })
    // nested list with just some random string data
    .state("dashboard.corpus", {
      url: "^/:team/:corpusidentifier",
      template: "<div>Corpus {{application.routeParams.corpusidentifier}} by {{application.routeParams.team}}</div>",
      controller: passStateParamsController
    })
    // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
    .state("faq", {
      url: "/faq",
      template: "<div>FAQ</div>",
      controller: passStateParamsController
    });
  var state;
  for (var route in FieldDB.Router.routes) {
    state = FieldDB.Router.routes[route].path.replace(/\/:?/g, ".").replace(/^\./, "").replace("team.corpusidentifier", "dashboard.corpus");
    fieldDBApp.debug("Would add state  " + state, {
      url: "^"+FieldDB.Router.routes[route].path,
      // parent: "dashboard",
      templateUrl: FieldDB.Router.routes[route].angularRoute.templateUrl,
      controller: passStateParamsController
    });
  }

  fieldDBApp.debug("Loaded Angular FieldDB Components ", fieldDBApp);
}]);

console.log("Loaded fielddbAngular module");
// fielddbAngulaModule.run(["$route", "$rootScope", "$location",
//   function($route, $rootScope, $location) {
//     var original = $location.path;
//     $location.path = function(path, reload) {
//       if (reload === false) {
//         var lastRoute = $route.current;
//         var un = $rootScope.$on("$locationChangeSuccess", function() {
//           $route.current = lastRoute;
//           un();
//         });
//       }
//       return original.apply($location, [path]);
//     };
//   }
// ]);
"use strict";

/**
 * @ngdoc directive
 * @name fielddbAngular.directive:fielddbUser
 * @description
 * # fielddbUser
 */
angular.module("fielddbAngular").directive("fielddbUser", function() {


  var controller = function($scope) {
    $scope.toggleViewDecryptedDetails = function() {
      $scope.user.decryptedMode = !$scope.user.decryptedMode;
    };
    // console.log("$scope.user");
    // console.log($scope.user);
    // if (!$scope.user) {
    //   console.warn("This user is undefined for this directive, seems odd.");
    //   // console.warn("This user is undefined for this directive, seems odd.", $scope);
    // } else {
    //   if ($scope.user.toJSON) {
    //     console.log($scope.user.toJSON());
    //   }
    // }
  };
  controller.$inject = ["$scope"];

  var directiveDefinitionObject = {
    templateUrl: function(elem, attrs) {
      if (attrs.view === "User") {
        return "components/user/user-page.html";
      } else if (attrs.view === "UserMask") {
        return "components/user/user.html";
      } else if (attrs.view === "Participant") {
        return "components/user/participant.html";
      } else {
        return "components/user/user.html";
      }
    },
    restrict: "A",
    transclude: false,
    scope: {
      user: "=json"
    },
    controller: controller,
    link: function postLink() {},
    priority: 0,
    replace: false,
    controllerAs: "stringAlias"
  };
  return directiveDefinitionObject;
});

"use strict";

/**
 * @ngdoc directive
 * @name fielddbAngular.directive:fielddbSession
 * @description
 * # fielddbSession
 */
angular.module("fielddbAngular").directive("fielddbSession", function() {
  return {
    templateUrl: "components/session/session.html",
    restrict: "A",
    transclude: false,
    scope: {
      session: "=json",
      corpus: "=corpus"
    },
    controller: ["$scope", "$rootScope", function($scope, $rootScope) {
      $scope.toggleViewDecryptedDetails = function() {
        $scope.session.decryptedMode = !$scope.session.decryptedMode;
      };
      $scope.showThisFieldForThisUserType = function(field) {
        // Don"t show empty fields
        if (!field.value) {
          return false;
        }
        if (!$rootScope.application || !$rootScope.application.prefs) {
          return true;
        }
        // Only values which would be interesting for this user
        var prefs = $rootScope.application.prefs;
        // console.log(prefs);
        var userType = prefs.preferredDashboardType || "experimenterNormalUser";
        if (!field.showToUserTypes) {
          return true;
        }
        var showToTypes = field.showToUserTypes.trim().split(",");
        for (var type = 0; type < showToTypes.length; type++) {
          if (showToTypes[type].trim() === "all" || userType.indexOf(showToTypes[type].trim()) > -1) {
            return true;
          } else {
            return false;
          }
        }
      };
      $scope.expanded = false;
      $scope.toggleExpanded = function() {
        $scope.expanded = !$scope.expanded;
      };

    }],
    link: function postLink() {}
  };
});

"use strict";

angular.module("fielddbAngular").directive("fielddbSearch", function() {
  var search = {};
  search.sortBy = "dateCreated";
  search.fields = ["utterance", "translation"];
  return {
    templateUrl: "components/search/search.html",
    restrict: "A",
    transclude: false,
    scope: true,
    // controller: function($scope, $element, $attrs, $transclude) {},
    link: function postLink(scope, element, attrs) {
      console.log(attrs);
      scope.search = search;
      // element.text("this is the search directive");
    }
  };
});

"use strict";

angular.module("fielddbAngular")
  .controller("NavbarCtrl", ["$scope", function ($scope) {
    $scope.date = new Date();
  }]);

"use strict";
/* globals FieldDB */


/**
 * @ngdoc directive
 * @name fielddbAngular.directive:fielddbLocales
 * @description
 * # fielddbLocales
 */
angular.module("fielddbAngular").directive("fielddbLocales", function() {
  var debugMode = false;
  var controller = function($scope, $timeout) {

    /**
     * Error: 10 $digest() iterations reached. Aborting!
     * @type {[type]}
     * http://stackoverflow.com/questions/14376879/error-10-digest-iterations-reached-aborting-with-dynamic-sortby-predicate
     */
    $timeout(function() {
      if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application && FieldDB.FieldDBObject.application.contextualizer) {
        debugMode = FieldDB.FieldDBObject.application.contextualizer.debugMode;
        $scope.locales = FieldDB.FieldDBObject.application.contextualizer;
      } else {
        console.warn("locales is not available on the scope. ");
      }
    }, 1000);

    $scope.persistUsersChosenLocale = function(currentLocale) {
      $scope.locales.userOverridenLocalePreference = currentLocale;
    };

    $scope.clearLocalizerUserPreferences = function() {
      $scope.locales.userOverridenLocalePreference = null;
    };

  };
  controller.$inject = ["$scope", "$timeout"];

  /* Directive declaration */
  var directiveDefinitionObject = {
    templateUrl: "components/locales/locales.html", // or // function(tElement, tAttrs) { ... },
    restrict: "A",
    transclude: false,
    // scope: {
    //   locales: "=json"
    // },
    controller: controller,
    link: function postLink(scope, element, attrs) {
      if (debugMode) {
        console.log("linking locales directive", scope, element, attrs);
      }
      if (attrs.fielddbFullView) {
        scope.showFullView = true;
        scope.localeKeyToShow = "nativeName";
      }
      if (attrs.fielddbShowLocaleKey) {
        scope.localeKeyToShow = attrs.fielddbShowLocaleKey;
      } else {
        scope.localeKeyToShow = "iso";
      }

    },
    priority: 0,
    // replace: true,
    controllerAs: "stringAlias"
  };
  return directiveDefinitionObject;
});

"use strict";
/* globals FieldDB */

/**
 * @ngdoc directive
 * @name fielddbAngular.directive:fielddbImport
 * @description
 *
 * uses drag and drop from https://github.com/codef0rmer/angular-dragdrop example: https://stackoverflow.com/questions/18679645/angularjs-drag-and-drop-plugin-drop-issue
 * # fielddbImport
 */
angular.module("fielddbAngular").directive("fielddbImport", function() {
  var rootScope;
  var controller = function($scope, $upload, $rootScope) {
    rootScope = $rootScope;
    if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application) {
      $scope.application = FieldDB.FieldDBObject.application;
      $scope.contextualize = rootScope.contextualize;
    }
    var processOffline = true;
    $scope.uploadInfo = {
      token: "uploadingfromspreadsheet",
      username: "testupload",
      returnTextGrid: true
    };



    var progress = function(evt) {
      console.log("percent: " + parseInt(100.0 * evt.loaded / evt.total));
    };
    var success = function(data, status, headers, config) {
      // file is uploaded successfully
      console.log(data, status, headers, config);
    };
    $scope.removeRow = function(row) {
      console.log("remove ", row);
      var removed = $scope.importer.asCSV.splice(row, 1);
      console.log(removed);
    };

    $scope.dropSuccessHandler = function(participantFieldLabel) {
      $scope.importer.debug("dropSuccessHandler", participantFieldLabel);
      $scope.importer.todo("change import.html drag=\"participantField.labelExperimenter\" to send the entire participantfield");
      $scope.importer.todo("Use this dropSuccessHandler function for creating an acivity?");
    };
    $scope.onDropFieldLabelRecieved = function(labelString, extractedHeaderFieldsCollection, headerCellIndex) {
      $scope.importer.debug("onDropFieldLabelRecieved", labelString, extractedHeaderFieldsCollection, headerCellIndex);
      extractedHeaderFieldsCollection[headerCellIndex].labelExperimenter = labelString;
      $scope.importer.todo("change Import.js to use fields for the extractedHeaderFieldsCollection cells instead of just labels.");
    };

    var verifyImporterIsSetup = function() {
      if (!FieldDB) {
        console.warn("you catn import very much with out FieldDB, it is not loaded");
        return;
      }
      $scope.importer = $scope.importer || new FieldDB.Import();
      $scope.importer.status = "";
      $scope.importer.error = "";
      $scope.importer.importType = $scope.importer.importType || "data";
      $scope.importer.corpus = $scope.application.corpus;
      $scope.importer.dbname = $scope.application.corpus.dbname || "default";
    };

    $scope.onFileSelect = function($files) {
      //$files: an array of files selected, each file has name, size, and type.
      $scope.importer.uploadtoken = $scope.uploadInfo.token;
      $scope.importer.username = $scope.uploadInfo.username;
      $scope.importer.returnTextGrid = $scope.uploadInfo.returnTextGrid;

      if (processOffline) {
        if (!$scope.application || !$scope.application.corpus) {
          $scope.importer.bug("The corpus is not loaded yet. Please report this.");
          return;
        }
        verifyImporterIsSetup();
        $scope.importer.rawText = "";
        $scope.importer.files = $files;

        console.log($scope.importer);
        $scope.importer.readFiles({}).then(function(sucessfullOptions) {
          console.log("Finished reading files ", sucessfullOptions);
          try {
            if (!$scope.$$phase) {
              $scope.$digest(); //$digest or $apply
            }
          } catch (e) {
            console.warn("render threw errors");
          }
          $scope.importer.guessFormatAndPreviewImport();
          try {
            if (!$scope.$$phase) {
              $scope.$digest(); //$digest or $apply
            }
          } catch (e) {
            console.warn("render threw errors");
          }

        }, function(failedOptions) {
          console.log("Error reading files ", failedOptions);
          try {
            if (!$scope.$$phase) {
              $scope.$digest(); //$digest or $apply
            }
          } catch (e) {
            console.warn("render threw errors");
          }
        });
      } else {
        $scope.importer.uploadFiles($files).then(function(result) {
          $scope.importer.todo(" Got an upload result in the angular directive", result);
          try {
            if (!$scope.$$phase) {
              $scope.$digest(); //$digest or $apply
            }
          } catch (e) {
            console.warn("render threw errors");
          }
        }, function(reason) {
          console.log(reason);
        });


        for (var i = 0; i < $files.length; i++) {
          var file = $files[i];

          $scope.upload = $upload.upload({
            url: "server/upload/url", //upload.php script, node.js route, or servlet url
            //method: "POST" or "PUT",
            //headers: {"header-key": "header-value"},
            //withCredentials: true,
            data: {
              myObj: $scope.myModelObj
            },
            file: file, // or list of files ($files) for html5 only
            //fileName: "doc.jpg" or ["1.jpg", "2.jpg", ...] // to modify the name of the file(s)
            // customize file formData name ("Content-Desposition"), server side file variable name.
            //fileFormDataName: myFile, //or a list of names for multiple files (html5). Default is "file"
            // customize how data is added to formData. See #40#issuecomment-28612000 for sample code
            //formDataAppender: function(formData, key, val){}
          }).progress(progress).success(success);
          //.error(...)
          //.then(success, error, progress);
          // access or attach event listeners to the underlying XMLHttpRequest.
          //.xhr(function(xhr){xhr.upload.addEventListener(...)})
        }
      }
      /* alternative way of uploading, send the file binary with the file"s content-type.
           Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed.
           It could also be used to monitor the progress of a normal http post/put request with large data*/
      // $scope.upload = $upload.http({...})  see 88#issuecomment-31366487 for sample code.
    };

    $scope.guessFormatAndPreviewImport = function() {
      if (!$scope.importer) {
        console.warn("The importer is undefined and the user is trying to import are you sure you passed an importer to this directive? or that your application has an importer?");
        return;
      }
      verifyImporterIsSetup();
      $scope.importer.guessFormatAndPreviewImport();
    };

    $scope.previewDatalist = function() {
      if (!$scope.importer) {
        console.warn("The importer is undefined and the user is trying to import are you sure you passed an importer to this directive? or that your application has an importer?");
        return;
      }
      $scope.importer.convertMatrixIntoDataList().then(function(results) {
        console.log("Import is completed. ", results);
        console.log(" Progress ", $scope.importer.progress);
      },function(results) {
        console.log("Import is completed. ", results);
        console.log(" Progress ", $scope.importer.progress);
      });
    };
    $scope.runImport = function() {
      if (!$scope.importer) {
        console.warn("The importer is undefined and the user is trying to import are you sure you passed an importer to this directive? or that your application has an importer?");
        return;
      }
      $scope.importer.import().then(function(results) {
        console.log("Import is completed. ", results);
        console.log(" Progress ", $scope.importer.progress);
        // $scope.$digest();
      });
    };
    /*jshint camelcase: false */
    $scope.locale = {
      locale_Import_First_Step: "Step 1: Drag & drop, copy-paste or type your data into the text area, or select audio/video file(s) from your computer. Yes, you can edit the data inside the text area.",
      locale_Import_Second_Step: "Step 2: Drag and drop or type the field names in column headers. Edit data in the table as needed.",
      locale_Add_Extra_Columns: "Insert Extra Columns",
      locale_Attempt_Import: "Import ",
      locale_Import_Third_Step: "Step 3: The imported data will look like this. Edit in the table or the text area above as needed. Edit the datalist title and description, and the eliciation session section before finishing import.",
      locale_Import: "Importer des liste(s) de classe (.csv)",
      locale_Drag_and_Drop_Placeholder: "Drag and drop files, copy-paste or type your data here. (Or use the Choose file(s) button)"
    };
  };

  controller.$inject = ["$scope", "$upload", "$rootScope"];

  var directiveDefinitionObject = {
    templateUrl: "components/import/import.html",
    restrict: "A",
    transclude: false,
    scope: {
      importer: "=json",
      // application: "=application"
    },
    controller: controller,
    link: function postLink(scope) {
      if (!scope.importer) {
        return;
      }
      if (scope.importer && scope.importer.corpus) {
        return;
      }
      if (!scope.importer.corpus && scope.corpus) {
        scope.importer.warn("The importers corpus was undefined, using the corpus in local scope, although this might have consequences.");
        scope.importer.corpus = scope.corpus;
        return;
      }
      if (!scope.importer.corpus && rootScope.corpus) {
        scope.importer.warn("The importers corpus was undefined, using the corpus in root scope, although this might have consequences.");
        scope.importer.corpus = rootScope.corpus;
        return;
      }

    },
    priority: 0,
    replace: false,
    controllerAs: "stringAlias"
  };
  return directiveDefinitionObject;
});

"use strict";

/**
 * @ngdoc filter
 * @name fielddbAngular.filter:fielddbVisiblyEmpty
 * @function
 * @description
 * # fielddbVisiblyEmpty
 * Filter in the fielddbAngular.
 */
angular.module("fielddbAngular").filter("fielddbVisiblyEmpty", function() {
  return function(input) {
    if (input.trim) {
      input = input.trim();
    }
    if (input === "" || input === undefined || input === null) {
      return "--";
    }
    return input;
  };
});

"use strict";

/**
 * @ngdoc filter
 * @name fielddbAngular.filter:fielddbShortDate
 * @function
 * @description
 * # fielddbShortDate
 * Filter in the fielddbAngular.
 */
angular.module("fielddbAngular").filter("fielddbShortDate", function() {
  return function(input) {
    if (!input) {
      return "--";
    }
    if (input.replace) {
      input = input.replace(/\"/g, "");
    }
    if (input.trim) {
      input = input.trim();
    }
    if (!input) {
      return "--";
    }
    // For unknown historical reasons in the spreadsheet app
    // there were some dates that were unknown and were set
    // to a random? date like this:
    if (input === "2000-09-06T16:31:30.988Z" || (input >= new Date("2000-09-06T16:31:30.000Z") && input <= new Date("2000-09-06T16:31:31.000Z"))) {
      return "N/A";
    }
    if (!input.toLocaleDateString) {
      input = new Date(input);
    }
    return input.toLocaleDateString();
  };
});

"use strict";

/**
 * @ngdoc filter
 * @name fielddbAngular.filter:fielddbPrettyDate
 * @function
 * @description Converts any date format (json format, timestamp etc) into something nicer (for the locale, with hour and minutes)
 * # fielddbPrettyDate
 * Filter in the fielddbAngular.
 */
angular.module("fielddbAngular").filter("fielddbPrettyDate", function() {
  return function(input) {
    if (!input) {
      return "--";
    }
    if (input.replace) {
      input = input.replace(/\"/g, "");
    }
    if (input.trim) {
      input = input.trim();
    }
    if (!input) {
      return "--";
    }
    // For unknown historical reasons in the spreadsheet app
    // there were some dates that were unknown and were set
    // to a random? date like this:
    if (input === "2000-09-06T16:31:30.988Z" || (input >= new Date("2000-09-06T16:31:30.000Z") && input <= new Date("2000-09-06T16:31:31.000Z"))) {
      return "N/A";
    }
    if (!input.toLocaleDateString) {
      input = new Date(input);
    }
    var minutes = input.getMinutes();
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    return input.toLocaleDateString() + " " + input.getHours() + ":" + minutes;
  };
});

"use strict";

/**
 * @ngdoc filter
 * @name fielddbAngular.filter:fielddbAgoDate
 * @function
 * @description
 *
 * JavaScript Pretty Date Copyright (c) 2011 John Resig (ejohn.org) Licensed
 * under the MIT and GPL licenses.
 *
 * Takes an ISO time and returns a string representing how
 * long ago the date represents.
 * modified by FieldDB team to take in Greenwich time which is what we are using
 * for our time stamps so that users in differnt time zones will get real times,
 * not strangely futureistic times
 * we have been using JSON.stringify(new Date()) to create our timestamps
 * instead of unix epoch seconds (not sure why we werent using unix epoch), so
 * this function is modified from the original in that it expects dates that
 * were created using
 * JSON.stringify(new Date())
 *
 * # fielddbAgoDate
 * Filter in the fielddbAngular.
 */
angular.module("fielddbAngular").filter("fielddbAgoDate", function() {
  return function(input) {
    if (!input) {
      return "--";
    }
    if (input.replace) {
      input = input.replace(/\"/g, "");
    }
    if (input.trim) {
      input = input.trim();
    }
    if (!input) {
      return "--";
    }
    // For unknown historical reasons in the spreadsheet app
    // there were some dates that were unknown and were set
    // to a random? date like this:
    if (input === "2000-09-06T16:31:30.988Z" || (input >= new Date("2000-09-06T16:31:30.000Z") && input <= new Date("2000-09-06T16:31:31.000Z"))) {
      return "N/A";
    }
    if (!input.toLocaleDateString) {
      input = new Date(input);
    }

    var greenwichdate = new Date();
    var minuteDiff = ((greenwichdate.getTime() - input.getTime()) / 1000);
    var dayDiff = Math.floor(minuteDiff / 86400);

    var prefix;
    var suffix;

    if (isNaN(dayDiff) || dayDiff < 0) {
      prefix = "in ";
      suffix = "";
    } else {
      prefix = "";
      suffix = " ago";
    }
    dayDiff = Math.abs(dayDiff);
    if (dayDiff >= 1430) {
      return prefix + (Math.round(dayDiff / 365) + " years" + suffix);
    }
    if (dayDiff >= 1278) {
      return prefix + "3.5 years" + suffix;
    }
    if (dayDiff >= 1065) {
      return prefix + "3 years" + suffix;
    }
    if (dayDiff >= 913) {
      return prefix + "2.5 years" + suffix;
    }
    if (dayDiff >= 730) {
      return prefix + "2 years" + suffix;
    }
    if (dayDiff >= 540) {
      return prefix + "1.5 years" + suffix;
    }
    if (dayDiff >= 50) {
      return prefix + (Math.round(dayDiff / 31) + " months" + suffix);
    }
    if (dayDiff >= 48) {
      return prefix + "1.5 months" + suffix;
    }
    if (dayDiff >= 40) {
      return prefix + "1 month" + suffix;
    }
    if (dayDiff >= 16) {
      return prefix + (Math.round(dayDiff / 7) + " weeks" + suffix).replace("1 weeks", "1 week");
    }
    if (dayDiff >= 2) {
      return prefix + (Math.round(dayDiff / 1) + " days" + suffix).replace("1 days", "1 day");
    }
    if (dayDiff >= 1) {
      return prefix + "Yesterday";
    }

    if (minuteDiff >= 5000) {
      return prefix + (Math.floor(minuteDiff / 3600) + " hours" + suffix).replace("1 hours", "1.5 hours");
    }

    if (minuteDiff >= 4000) {
      return prefix + "1 hour" + suffix;
    }
    //  if(minuteDiff >= 7200 ){
    //    Math.floor(minuteDiff / 3600) + " 1 hour" + suffix;
    //  }
    if (minuteDiff >= 70) {
      return prefix + Math.floor(minuteDiff / 60) + " minutes" + suffix;
    }
    if (minuteDiff >= 120) {
      return prefix + "1 minute" + suffix;
    }
    return "just now";

  };
});
"use strict";

/**
 * @ngdoc directive
 * @name fielddbAngular.directive:fielddbDoc
 * @description
 * # fielddbDoc
 */
angular.module("fielddbAngular").directive("fielddbDoc", ["$compile", function($compile) {
  var templates = {
    UserMask: "<div data-fielddb-user view='UserMask' json='doc' corpus='corpus'></div>",
    User: "<div data-fielddb-user view='User' json='doc' corpus='corpus'></div>",
    Team: "<div data-fielddb-user view='UserMask' json='doc' corpus='corpus'></div>",
    Speaker: "<div data-fielddb-user view='UserMask' json='doc' corpus='corpus'></div>",
    Consultant: "<div data-fielddb-user view='UserMask' json='doc' corpus='corpus'></div>",
    Participant: "<div data-fielddb-user view='Participant' json='doc' corpus='corpus'></div>",

    Corpus: "<div data-fielddb-corpus json='doc' corpus='corpus'></div>",
    Session: "<div data-fielddb-session json='doc' corpus='corpus'></div>",

    DataList: "<div data-fielddb-datalist json='doc' corpus='corpus'></div>",
    LessonDataList: "<div data-fielddb-datalist json='doc' corpus='corpus' view='LessonDataList'></div>",
    SubExperimentDataList: "<div data-fielddb-datalist json='doc' corpus='corpus' view='SubExperimentDataList'></div>",
    ExperimentDataList: "<div data-fielddb-datalist json='doc' corpus='corpus' view='SubExperimentDataList'></div>",

    Document: "<div data-fielddb-datum json='doc' corpus='corpus'></div>",
    DatumField: "<div data-fielddb-datum-field json='doc' corpus='corpus'></div>",
    Datum: "<div data-fielddb-datum json='doc' corpus='corpus'></div>",
    MultipleChoice: "<div data-fielddb-datum json='doc' corpus='corpus'></div>",
    Stimulus: "<div data-fielddb-datum json='doc' corpus='corpus'></div>",

    Response: "<div data-fielddb-datum json='doc' corpus='corpus'></div>"
  };
  return {
    template: "{{doc.fieldDBtype}} Loading... {{doc._id}}",
    restrict: "A",
    transclude: false,
    scope: {
      doc: "=json",
      corpus: "=corpus"
    },
    link: function postLink(scope, element, attrs) {

      // https://docs.angularjs.org/api/ng/service/$compile
      scope.$watch(
        function(scope) {
          // watch the "compile" expression for changes
          return scope.$eval(attrs.compile);
        },
        function() {
          // console.log("Scope value changed", value);
          // when the "compile" expression changes
          // assign it into the current DOM
          if (!scope.doc) {
            // setTimeout(function(){
            //   FieldDB.FieldDBObject.application.render();
            // }, 500);
            return;
          }
          console.log(scope.doc.id + " doc type is ", scope.doc.fieldDBtype);
          if (templates[scope.doc.fieldDBtype]) {
            element.html(templates[scope.doc.fieldDBtype]);
            if (scope && scope.doc && !scope.doc.fetch) {
              console.warn("This doc doesnt have the FieldDBObject methods to it, cant turn it into a " + scope.doc.fieldDBtype + " without loosing its references. Please pass it as a complex object if you need its functionality.");
              // scope.doc = new FieldDB[scope.doc.fieldDBtype](scope.doc);
            }
          } else {
            // element.html("{{doc.fieldDBtype}} Unable to display this document. {{doc | json}}");
            // if (scope && scope.doc && !scope.doc.rev && scope.doc.fetch) {
            //   console.log("TODO fetch the doc details and refresh the render to the right template if necessary");
            //   scope.doc.fetch().then(function(result){
            //     console.log("TODO maybe dont need to  how to get the FieldDBObject to be come an X object appart from talking to its parent...", result);
            //     // scope.doc.parent.add(FieldDB.FieldDBObject.convertDocIntoItsType(result));
            //     scope.$digest();
            //   });
            // }
          }
          if (scope.doc.loaded === false && !scope.doc.rev && typeof scope.doc.fetch === "function") {
            scope.doc.fetch().then(function(result) {
              console.log("TODO maybe dont need to  how to get the FieldDBObject to be come an X object appart from talking to its parent...", result);
              // scope.doc.parent.add(FieldDB.FieldDBObject.convertDocIntoItsType(result));
              scope.$digest();
            });
          }
          // console.log("Using html: " + element.html());

          // compile the new DOM and link it to the current
          // scope.
          // NOTE: we only compile .childNodes so that
          // we don"t get into infinite loop compiling ourselves
          $compile(element.contents())(scope);
        }
      );

    }
  };
}]);

"use strict";

/**
 * @ngdoc directive
 * @name fielddbAngular.directive:fielddbDatum
 * @description
 * # fielddbDatum
 */
angular.module("fielddbAngular").directive("fielddbDatum", function() {
  return {
    templateUrl: "components/datum/datum_generic.html",
    restrict: "A",
    transclude: false,
    scope: {
      datum: "=json",
      corpus: "=corpus"
    },
    controller: ["$scope", "$rootScope", function($scope, $rootScope) {
      $scope.toggleViewDecryptedDetails = function() {
        $scope.datum.decryptedMode = !$scope.datum.decryptedMode;
      };
      $scope.showThisFieldForThisUserType = function(field) {
        // Don"t show empty fields
        if (!field.value) {
          return false;
        }
        if (!$rootScope.application || !$rootScope.application.prefs) {
          return true;
        }
        // Only values which would be interesting for this user
        var prefs = $rootScope.application.prefs;
        // console.log(prefs);
        var userType = prefs.preferredDashboardType || "experimenterNormalUser";
        if (!field.showToUserTypes) {
          return true;
        }
        var showToTypes = field.showToUserTypes.trim().split(",");
        for (var type = 0; type < showToTypes.length; type++) {
          if (showToTypes[type].trim() === "all" || userType.indexOf(showToTypes[type].trim()) > -1) {
            return true;
          } else {
            return false;
          }
        }
      };
      $scope.expanded = false;
      $scope.toggleExpanded = function() {
        $scope.expanded = !$scope.expanded;
      };

    }],
    link: function postLink() {}
  };
});

"use strict";

/**
 * @ngdoc directive
 * @name fielddbAngular.directive:fielddbDatumField
 * @description
 * # fielddbDatumField
 */

angular.module("fielddbAngular").directive("fielddbDatumField", function() {

  var directiveDefinitionObject = {
    templateUrl: "components/datum/datum-field.html", // or // function(tElement, tAttrs) { ... },
    restrict: "A",
    transclude: false,
    scope: {
      datumField: "=json"
    },
    // controller: function($scope, $element, $attrs, $transclude, otherInjectables) {
    // controller: function($scope, $element, $attrs, $transclude) {
    //   console.log("in controller");
    //   console.log($element.html());
    // },
    link: function postLink(scope) {
      console.log("linking datumfield", scope.datumField, scope.contextualizer);
      scope.contextualize = scope.$root.contextualize;
    },
    priority: 0,
    replace: false,
    controllerAs: "stringAlias"
    // require: "siblingDirectiveName", // or // ["^parentDirectiveName", "?optionalDirectiveName", "?^optionalParent"],
    // compile: function compile(tElement, tAttrs, transclude) {
    //   return {
    //     pre: function preLink(scope, iElement, iAttrs, controller) {
    //       console.log("in preLink");
    //     },
    //     post: function postLink(scope, iElement, iAttrs, controller) {
    //       console.log("in postLink");
    //       console.log(iElement.html());
    //       iElement.text("this is the datumField directive");
    //     }
    //   }
    //   // or
    //   // return function postLink( ... ) { ... }
    // }
  };
  return directiveDefinitionObject;
});

"use strict";

/**
 * @ngdoc directive
 * @name fielddbAngular.directive:fielddbDatalist
 * @description
 * # fielddbDatalist
 */
angular.module("fielddbAngular").directive("fielddbDatalist", function() {


  var controller = function($scope, $timeout) {
    var fetchDatalistDocsExponentialDecay = 2000;

    // $scope.dropSuccessHandler = function($event, index, array) {
    //   // array.splice(index, 1);
    //   // $scope.orphanedItem =
    //   console.log("removing " + index);
    // };

    $scope.onDrop = function($event, $data, index) {
      console.log("inserting at " + index, $data);
      if ($scope.datalist && $scope.datalist.docs) {
        if ($scope.datalist.docs.find($data).length === 0) {
          $scope.datalist.docs.add($data);
        }
        $scope.datalist.docs.reorder($data, index);
      }
    };

    $scope.removeItemFromList = function(item) {
      if ($scope.datalist && $scope.datalist.docs) {
        $scope.datalist.docs.remove(item);
      }
    };

    $scope.save = function() {
      $scope.datalist.save().then(function() {
        try {
          if (!$scope.$$phase) {
            $scope.$digest(); //$digest or $apply
          }
        } catch (e) {
          console.log("problem running angular render", e);
        }
      });
    };

    var fetchDatalistDocsIfEmpty = function() {

      if (!$scope.corpus || !$scope.datalist || !$scope.corpus.confidential || !$scope.corpus.confidential.secretkey || !$scope.corpus.fetchCollection) {
        fetchDatalistDocsExponentialDecay = fetchDatalistDocsExponentialDecay * 2;
        if (fetchDatalistDocsExponentialDecay >= Infinity) {
          console.log(" Giving up on getting a real corpus. Already at " + fetchDatalistDocsExponentialDecay + ".");
          return;
        }
        $timeout(function() {
          if ($scope.datalist && $scope.datalist.docs && $scope.datalist.docs.length > 0) {
            return;
          } else {
            fetchDatalistDocsIfEmpty();
          }
        }, fetchDatalistDocsExponentialDecay);
        console.log(" No real corpus is available, waiting another " + fetchDatalistDocsExponentialDecay + " until trying to fetch docs again.");
        if ($scope.datalist) {
          $scope.datalist.fetchDatalistDocsExponentialDecay = fetchDatalistDocsExponentialDecay;
        }
        return;
      }
      // if (FieldDB && FieldDB.Database) {
      //   $scope.corpus.authUrl = FieldDB.Database.prototype.BASE_AUTH_URL;
      // }
      // $scope.corpus.debugMode = true;

      // console.log("fetching docs for ", $scope.corpus.toJSON());
      // $scope.datalist.title = "";
      var whatToFetch = $scope.datalist.api;
      if ($scope.datalist.docIds && $scope.datalist.docIds.length && $scope.datalist.docIds.length >= 0) {
        whatToFetch = $scope.datalist.docIds;
      }
      if (!whatToFetch || whatToFetch === []) {
        // $scope.datalist.docs = {
        //   _collection: []
        // };
        try {
          if (!$scope.$$phase) {
            $scope.$digest(); //$digest or $apply
          }
        } catch (e) {
          console.log("problem running angular render", e);
        }
        return;
      }
      $scope.corpus.fetchCollection(whatToFetch).then(function(results) {
        // Reset the exponential decay to normal for subsequent requests
        fetchDatalistDocsExponentialDecay = 2000;

        console.log("downloaded docs", results);
        $scope.datalist.confidential = $scope.corpus.confidential;
        $scope.datalist.populate(results.map(function(doc) {
          // doc.url = $scope.corpus.url;
          return doc;
        }));

        try {
          if (!$scope.$$phase) {
            $scope.$digest(); //$digest or $apply
          }
        } catch (e) {
          console.warn("render threw errors");
        }


      }, function(reason) {

        console.log("No docs docs...", reason);
        fetchDatalistDocsExponentialDecay = fetchDatalistDocsExponentialDecay * 2;
        $scope.datalist.fetchDatalistDocsExponentialDecay = fetchDatalistDocsExponentialDecay;
        console.log(" No connetion, Waiting another " + fetchDatalistDocsExponentialDecay + " until trying to fetch docs again.");
        try {
          if (!$scope.$$phase) {
            $scope.$digest(); //$digest or $apply
          }
        } catch (e) {
          console.log("problem running angular render", e);
        }
        $timeout(function() {
          if ($scope.datalist && $scope.datalist.docs && $scope.datalist.docs.length > 0) {
            return;
          } else {
            fetchDatalistDocsIfEmpty();
          }
        }, fetchDatalistDocsExponentialDecay);

      });

    };


    var askDocsToFetchThemSelves = function() {

      if (!$scope.corpus || !$scope.datalist || !$scope.corpus.confidential || !$scope.corpus.confidential.secretkey || !$scope.corpus.fetchCollection) {
        fetchDatalistDocsExponentialDecay = fetchDatalistDocsExponentialDecay * 2;
        if (fetchDatalistDocsExponentialDecay >= Infinity) {
          console.log(" Giving up on getting a real corpus. Already at " + fetchDatalistDocsExponentialDecay + ".");
          return;
        }
        $timeout(function() {
          if ($scope.datalist && $scope.datalist.docs && $scope.datalist.docs.length > 0) {
            return;
          } else {
            askDocsToFetchThemSelves();
          }
        }, fetchDatalistDocsExponentialDecay);
        console.log(" No real corpus is available, waiting another " + fetchDatalistDocsExponentialDecay + " until trying to fetch docs again.");
        if ($scope.datalist) {
          $scope.datalist.fetchDatalistDocsExponentialDecay = fetchDatalistDocsExponentialDecay;
        }
        return;
      }
      if ($scope.datalist.docs && $scope.datalist.docs.length && $scope.datalist.docs.length >= 0) {
        $scope.datalist.docs.map(function(doc) {
          if (doc && typeof doc.fetch === "function") {
            doc.fetch().done(function() {
              try {
                if (!$scope.$$phase) {
                  $scope.$digest(); //$digest or $apply
                }
              } catch (e) {
                console.log("problem running angular render", e);
              }
            });
          }
        });
      }


    };

    // askDocsToFetchThemSelves();

    $scope.undo = function() {
      var type = $scope.datalist.fieldDBtype;
      if (!type || !FieldDB[type]) {
        type = "DataList";
      }
      $scope.datalist = new FieldDB[type]({
        id: $scope.datalist.id,
        dbname: $scope.datalist.dbname,
        url: $scope.datalist.url
      });
      $scope.datalist.fetch().then(function() {
        fetchDatalistDocsIfEmpty();
      });
    };

    $scope.canAddNewItemsToDataList = function() {
      return false;
    };

  };
  controller.$inject = ["$scope", "$timeout"];

  var directiveDefinitionObject = {
    templateUrl: function(elem, attrs) {
      if (attrs.view === "SubExperimentDataList") {
        return "components/experiment/sub-experiment-datalist.html";
      } else if (attrs.view === "Lesson") {
        return "components/datalist/datalist.html";
      } else {
        return "components/datalist/datalist.html";
      }
    },
    restrict: "A",
    transclude: false,
    scope: {
      datalist: "=json",
      corpus: "=corpus"
    },
    controller: controller,
    link: function postLink() {},
    priority: 0,
    replace: false,
    controllerAs: "stringAlias"
  };
  return directiveDefinitionObject;
});

"use strict";

angular.module("fielddbAngular").directive("fielddbCorpus", function() {

  var directiveDefinitionObject = {
    templateUrl: "components/corpus/corpus.html", // or // function(tElement, tAttrs) { ... },
    restrict: "A",
    transclude: false,
    scope: {
      corpus: "=json"
    },
    // controller: function($scope, $element, $attrs, $transclude, otherInjectables) {
    // controller: function($scope, $element, $attrs, $transclude) {
    //   console.log("in controller");
    //   console.log($element.html());
    // },
    link: function postLink() {
    },
    priority: 0,
    replace: false,
    controllerAs: "stringAlias"
    // require: "siblingDirectiveName", // or // ["^parentDirectiveName", "?optionalDirectiveName", "?^optionalParent"],
    // compile: function compile(tElement, tAttrs, transclude) {
    //   return {
    //     pre: function preLink(scope, iElement, iAttrs, controller) {
    //       console.log("in preLink");
    //     },
    //     post: function postLink(scope, iElement, iAttrs, controller) {
    //       console.log("in postLink");
    //       console.log(iElement.html());
    //       iElement.text("this is the corpus directive");
    //     }
    //   }
    //   // or
    //   // return function postLink( ... ) { ... }
    // }
  };
  return directiveDefinitionObject;
});

"use strict";

angular.module("fielddbAngular").directive("fielddbCorpusTermsOfUse", function() {
  return {
    templateUrl: "components/corpus/terms-of-use.html",
    restrict: "A",
    transclude: false,
    scope: {
      corpus: "=json"
    },
    // controller: function($scope, $element, $attrs, $transclude) {},
    link: function postLink() {
    }
  };
});

"use strict";

angular.module("fielddbAngular").directive("fielddbOfflineControls", function() {
  return {
    templateUrl: "components/connection/offline-controls.html",
    restrict: "A",
    transclude: false,
    scope: {
      connection: "=json"
    },
    link: function postLink() {
    }
  };
});

"use strict";

/**
 * @ngdoc directive
 * @name fielddbAngular.directive:fielddbCollection
 * @description
 * # fielddbCollection
 */
angular.module("fielddbAngular").directive("fielddbCollection", function() {


  var controller = function($scope) {
    // $scope.dropSuccessHandler = function($event, index, array) {
    //   // array.splice(index, 1);
    //   // $scope.orphanedItem =
    //   console.log("removing " + index);
    // };

    $scope.onDrop = function($event, $data, index) {
      console.log("inserting at " + index, $data);
      if ($scope.collection && $scope.collection) {
        if ($scope.collection.find($data).length === 0) {
          $scope.collection.add($data);
        }
        $scope.collection.reorder($data, index);
      }
    };

    $scope.removeItemFromList = function(item) {
      if ($scope.collection && $scope.collection) {
        $scope.collection.remove(item);
      }
    };

    $scope.save = function() {
      $scope.collection.save().then(function() {
        try {
          if (!$scope.$$phase) {
            $scope.$digest(); //$digest or $apply
          }
        } catch (e) {
          console.warn("render threw errors");
        }
      });
    };
    $scope.undo = function() {
      var type = $scope.collection.fieldDBtype;
      if (!type || !FieldDB[type]) {
        type = "Collection";
      }
      console.log("TODO add undo functionality");
    };

    $scope.canAddNewItemsToCollection = function() {
      return false;
    };

  };
  controller.$inject = ["$scope", "$timeout"];

  var directiveDefinitionObject = {
    templateUrl: function() {
      return "components/collection/collection.html";
    },
    restrict: "A",
    transclude: false,
    scope: {
      collection: "=json",
      corpus:"=corpus"
    },
    controller: controller,
    link: function postLink() {},
    priority: 0,
    replace: false,
    controllerAs: "stringAlias"
  };
  return directiveDefinitionObject;
});

"use strict";


/**
 * @ngdoc directive
 * @name fielddbAngular.directive:fielddbAuthentication
 * @description
 * # fielddbAuthentication
 */
angular.module("fielddbAngular").directive("fielddbAuthentication", function() {

  var controller = function($scope, $rootScope) {
    /* initialize or confirm scope is prepared */
    $scope.loginDetails = $scope.loginDetails || {};
    // $scope.application.authentication = $scope.application.authentication || {};
    // $scope.application.authentication.user = $scope.application.authentication.user || {};
    if ($scope.application && typeof $scope.application.debug === "function") {
      $scope.application.debug("Scope authentication is ", $scope.application.authentication);
    } else {
      console.warn("Somethign is wrong, there is no app defined. ");
    }

    $rootScope.register = function(registerDetails) {
      console.log("running register");
      try {
        return $scope.application.authentication.register(registerDetails).then(function(user) {
          console.log("User has been downloaded. listen to 'authenticated' event to redirect the user", user);
          return $scope;
        }, function(error) {
          $scope.application.authentication.error = error.userFriendlyErrors.join(" ");
          if ($scope.application.authentication.error.toLowerCase().indexOf("username") > -1) {
            registerDetails.username = "";
          }
          $scope.application.authentication.render();
          return $scope;
        });

      } catch (e) {
        console.log("there was a problem running register", e);
      }
    };

    $scope.login = function(loginDetails) {
      return $scope.application.authentication.login(loginDetails).then(function(user) {
        console.log("User has been downloaded. listen to 'authenticated' event to redirect the user", user);
        return $scope;
      }, function(error) {
        $scope.application.authentication.error = error.userFriendlyErrors.join(" ");
        $scope.application.authentication.render();
        return $scope;
      });
    };

    $scope.logout = function() {
      return $scope.application.authentication.logout().then(function(serverReply) {
        console.log("User has been logged out. ", serverReply);
        return $scope;
        // $scope.application.authentication = {
        //   user: new FieldDB.User({
        //     authenticated: false
        //   })
        // };
        // if (window.location.pathname.indexOf("welcome") < 0 && window.location.pathname.indexOf("bienvenu") < 0) {
        //   $scope.$apply(function() {
        //     // $location.path($scope.application.basePathname +  "/#/welcome/", false);
        //     window.location.replace($scope.application.basePathname + "/#/welcome");
        //   });
        // }
        // $scope.$digest();
      }, function(error) {
        $scope.application.authentication.error = error.userFriendlyErrors.join(" ");
        try {
          if (!$scope.$$phase) {
            $scope.$digest(); //$digest or $apply
          }
        } catch (e) {
          console.warn("render threw errors");
        }
        return $scope;
      });
    };


  };
  controller.$inject = ["$scope", "$rootScope"];

  /* Directive declaration */
  var directiveDefinitionObject = {
    templateUrl: "components/authentication/authentication.html", // or // function(tElement, tAttrs) { ... },
    restrict: "A",
    transclude: false,
    // scope: {
    //   authentication: "=json"
    // },
    controller: controller,
    link: function postLink() {},
    priority: 0,
    replace: true,
    controllerAs: "stringAlias"
  };
  return directiveDefinitionObject;
});

/* globals FieldDB */
"use strict";

/**
 * @ngdoc directive
 * @name fielddbAngular.directive:fielddbAudioVideoRecorder
 * @description
 * # fielddbAudioVideoRecorder
 */
angular.module("fielddbAngular").directive("fielddbAudioVideoRecorder", function() {

  return {
    templateUrl: "components/audio-video/audio-video-recorder.html",
    restrict: "A",
    transclude: false,
    scope: {
      parent: "=parent"
    },
    controller: ["$scope", function($scope) {
      var debugging = true;
      if (debugging) {
        console.log("loading fielddbAudioVideoRecorder", $scope.parent);
      }

      if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application) {
        $scope.application = FieldDB.FieldDBObject.application;
        if (!$scope.importer) {
          $scope.importer = new FieldDB.Import({
            importType: "audioVideo",
            parent: $scope.parent,
            dbname: $scope.parent.dbname,
            corpus: FieldDB.FieldDBObject.application.corpus,
            dontShowSecondStep: true
          });
        }
        // $scope.importer = $scope.application.importer;
        if ($scope.locale) {
          /*jshint camelcase: false */
          $scope.locale.locale_Import = "Import audio, video, images";
        }

      }

      var onAudioFail = function(error) {
        if (error === "Already running") {
          return;
        }
        $scope.datum.warn("Audio peripheralsCheck failed", error);
        try {
          if (!$scope.$$phase) {
            $scope.$digest(); //$digest or $apply
          }
        } catch (err) {
          console.warn("Rendering generated an erorr", err);
        }
      };
      var onAudioSuccess = function(s) {
        console.log("On audio sucess ", s);
        $scope.audioRecorder.element = $scope.audioRecorder.element || angular.element($scope.element.find("p")[0])[0];
        $scope.audioRecorder.parent = {
          addFile: $scope.addFile
          // dbname: $scope.parent.dbname
        };

        try {
          if (!$scope.$$phase) {
            $scope.$digest(); //$digest or $apply
          }
        } catch (e) {
          console.warn("Rendering generated an erorr", e);
        }
      };

      $scope.peripheralsCheck = function(type) {
        if (!$scope.audioRecorder && FieldDB) {
          $scope.audioRecorder = new FieldDB.AudioVideoRecorder({});
        }
        if (type === "video") {
          type = true;
          $scope.mutedAudioInstructions = true;
        } else if (type === "picture") {
          type = true;
          $scope.showPictureInstructions = true;
        } else {
          type = false;
          $scope.mutedAudioInstructions = true;
        }
        $scope.audioRecorder.peripheralsCheck(type, {
          image: $scope.element.find("img")[1],
          audio: $scope.element.find("audio")[0],
          video: $scope.element.find("video")[0],
          canvas: $scope.element.find("canvas")[0]
        }).then(onAudioSuccess, onAudioFail);
      };

      /* hack for add file since spreadsheet datum dont have addFile function */
      $scope.addFile = function(newAudioFile) {
        $scope.parent.audioVideo = $scope.parent.audioVideo || [];
        $scope.parent.images = $scope.parent.images || [];
        $scope.parent.relatedData = $scope.parent.relatedData || [];
        $scope.parent.unsaved = true;
        if (!newAudioFile.filename) {
          console.warn("Filename not specified.");
          return;
        }
        newAudioFile.dbname = $scope.parent.dbname;
        if (FieldDB && FieldDB.AudioVideo) {
          var audioVideoImageOrOtherFile = new FieldDB.AudioVideo(newAudioFile).toJSON();
          delete audioVideoImageOrOtherFile.data;
        }
        if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application && FieldDB.FieldDBObject.application.corpus) {
          $scope.importer.corpus = FieldDB.FieldDBObject.application.corpus;
          $scope.importer.uploadFiles(newAudioFile.data).then(function() {
            $scope.parent.render();
          }, function(error) {
            console.log(error);
            $scope.parent.bug(error.userFriendlyErrors.join());
            // todo download the file locally.
            $scope.parent.render();
          });
        }

        // if (audioVideoImageOrOtherFile.type.indexOf("audio") === 0) {
        //   $scope.parent.audioVideo.add(audioVideoImageOrOtherFile);
        // } else if (audioVideoImageOrOtherFile.type.indexOf("video") === 0) {
        //   $scope.parent.audioVideo.add(audioVideoImageOrOtherFile);
        // } else if (audioVideoImageOrOtherFile.type.indexOf("images") === 0) {
        //   $scope.parent.images.push(audioVideoImageOrOtherFile);
        // } else {
        //   $scope.parent.relatedData.push(audioVideoImageOrOtherFile);
        // }

        // i
      };

    }],
    link: function postLink(scope, el) {
      console.log("keeping a reference to this element");
      scope.element = el;
      // if (FieldDB && FieldDB.AudioVideoRecorder && FieldDB.AudioVideoRecorder.Recorder) {
      //   FieldDB.AudioVideoRecorder.Recorder.initRecorder();
      // }
    }
  };
});

/* globals console, window */

"use strict";

angular.module("fielddbAngular").controller("FieldDBController", ["$scope", "$rootScope", function($scope, $rootScope) {

  if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application) {
    $scope.application = FieldDB.FieldDBObject.application;
    FieldDB.FieldDBObject.render = function() {
      // try {
      //   if (!$scope.$$phase) {
      //     $scope.$apply(); //$digest or $apply
      //   }
      // } catch (e) {
      //   console.warn("Rendering generated probably a digest erorr");
      // }
    };

  } else {
    console.warn("The fielddb application was never created, are you sure you did new FieldDB.APP() somewhere?");
    window.alert("The app cannot load, please report this. ");
  }
  $rootScope.contextualize = function(message) {
    if (!FieldDB || !FieldDB.FieldDBObject || !FieldDB.FieldDBObject.application || !FieldDB.FieldDBObject.application.contextualizer || !FieldDB.FieldDBObject.application.contextualizer.data) {
      return message;
    }
    var result = FieldDB.FieldDBObject.application.contextualize(message);
    if ($rootScope.corpus && $rootScope.corpus.dbname && FieldDB) {
      var url = $rootScope.corpus.url || FieldDB.Database.prototype.BASE_DB_URL + "/" + $rootScope.corpus.dbname;
      result = result
        .replace(/CORPUS_DB_URL/g, url)
        .replace(/CORPUS_PAGE_URL/g, "http://lingsync.org/" + $rootScope.corpus.dbname.replace("-", "/") + "/" + $rootScope.corpus.titleAsUrl);
    }
    // if (!$scope.$$phase) {
    //   $scope.$digest(); //$digest or $apply
    // }
    return result;
  };

  $scope.loginDetails = $scope.loginDetails || {
    username: "",
    password: ""
  };

  // FieldDB.FieldDBConnection.connect();


  $scope.FieldDBComponents = {};
  for (var klass in FieldDB) {
    if(! FieldDB.hasOwnProperty(klass)){
      continue;
    }
    $scope.FieldDBComponents[klass] = {
      fieldDBtype: klass,
      url: "http://opensourcefieldlinguistics.github.io/FieldDB/docs/javascript/" + klass + ".html"
    };
  }
  // $scope.application.currentCorpusDashboard = ":team/:corpusidentifier/import/:importType";
  $scope.FieldDBComponents.Activity.route = "/lingllama/communitycorpus/activityfeed";//+ "/activityfeed/123";

  console.log("FieldDBController was loaded, this means almost everything in the corpus is available now");
}]);

angular.module("fielddbAngular").run(["$templateCache", function($templateCache) {$templateCache.put("app/main/main.html","<div class=\"jumbotron text-center\"><h1>FieldDB-Angular</h1><p class=\"lead\">Re-usable Angular Components for FieldDB: an offline/online field database which adapts to its user\'s terminology and I-Language</p><p><a class=\"btn btn-lg btn-success\" ng-href=\"http://opensourcefieldlinguistics.github.io/FieldDB/docs/javascript/App.html\" target=\"_blank\">View JS Docs</a></p><p>Nested views demo <a ui-sref=\"dashboard.team({team: \'lingllama\'})\" class=\"btn btn-primary\">User Page</a> <a ui-sref=\"dashboard.corpus({team: \'lingllama\', corpusidentifier: \'communitycorpus\'})\" class=\"btn btn-danger\">Corpus Page</a> <a href=\"/jenkins\" class=\"btn btn-primary\">Jenkins Page</a> <a href=\"/jenkins/firstcorpus\" class=\"btn btn-danger\">Jenkin\'s First Corpus</a><pre ng-show=\"application.debugMode\">\r\n    {{application.routeParams | json}}\r\n    </pre></p></div><div ui-view=\"\"></div><div class=\"row\"><div class=\"col-sm-6 col-md-4\" ng-repeat=\"fieldDBModel in FieldDBComponents | orderBy:\'length\'\"><div class=\"thumbnail\"><div class=\"caption\"><h3><a href=\"{{fieldDBModel.route}}\">{{fieldDBModel.fieldDBtype}}</a></h3></div></div></div></div>");
$templateCache.put("components/activity/activity-feedd.html","");
$templateCache.put("components/activity/activity-list-item.html","");
$templateCache.put("components/authentication/authentication.html","<form class=\"navbar-form navbar-right\" role=\"login\"><div class=\"form-group\" ng-hide=\"application.authentication.user.authenticated\"><input type=\"text\" placeholder=\"Username\" class=\"form-control\" ng-model=\"loginDetails.username\" name=\"username\" value=\"\" tabindex=\"1\"> &nbsp; <input type=\"password\" placeholder=\"Password\" class=\"form-control\" ng-model=\"loginDetails.password\" name=\"password\" tabindex=\"2\"> &nbsp; <button type=\"submit\" class=\"btn btn-default\" ng-click=\"login(loginDetails)\" tabindex=\"3\">Login</button></div><div ng-show=\"application.authentication.error\">{{application.authentication.error}}</div><span class=\"form-group\" ng-show=\"application.authentication.user.authenticated\"><button class=\"btn btn-default\" ng-click=\"logout()\" tabindex=\"3\">Logout</button> <span data-fielddb-locales=\"\"></span></span></form>");
$templateCache.put("components/audio-video/audio-video-recorder.html","<div class=\"span6\"><form class=\"btn-toolbar\"><div class=\"btn-group\"><button class=\"btn btn-success\" ng-click=\"peripheralsCheck(\'audio\')\"><i class=\"fa\" ng-class=\"{\'fa-microphone\': (application.audioRecordingVerified || application.audioRecordingVerified==undefined), \'fa-microphone-slash\': application.audioRecordingVerified==false }\"></i></button> <button class=\"btn btn-success hide hidden\" ng-click=\"peripheralsCheck(\'video\')\" ng-disabled=\"application.videoRecordingVerified==false\"><i class=\"fa\" ng-class=\"{\'fa-video-camera\': (application.videoRecordingVerified || application.videoRecordingVerified==undefined), \'fa-microphone-slash \': application.videoRecordingVerified==false }\"></i></button> <button class=\"btn btn-success hide hidden\" ng-click=\"peripheralsCheck(\'picture\')\" ng-disabled=\"application.videoRecordingVerified==false\"><i class=\"fa\" ng-class=\"{\'fa-camera\': (application.videoRecordingVerified || application.videoRecordingVerified==undefined), \'fa-eye-close\': application.videoRecordingVerified==false }\"></i></button></div><img src=\"images/spinner-small.gif\" ng-show=\"processingAudio\"></form><p ng-hide=\"showPictureInstructions\" class=\"span6 RecordMP3js-recorder\" data-format=\"mp3\" data-callback=\"showFile\"></p><p class=\"\"><span ng-show=\"showPictureInstructions\">Click preview when ready to take a picture</span></p><h3 ng-show=\"application.audioRecordingVerified\">Preview Audio/Video/Image</h3><small ng-show=\"mutedAudioInstructions\">Note: audio/video is muted to reduce audio feedback noises. If you are using a headset, you can unmute them to listen to the audio as you record.</small><audio hidden=\"\" class=\"hide\" autoplay=\"\" controls=\"\"></audio><video hidden=\"\" class=\"hide\" autoplay=\"\" controls=\"\"></video><canvas hidden=\"\" class=\"hide\" ng-hide=\"true===true\"></canvas><img hidden=\"\" class=\"hide\"><p></p></div><div class=\"span6\" data-fielddb-import=\"\" json=\"importer\" corpus=\"application.corpus\"></div><div class=\"span12\" ng-model=\"audioRecorder.status\"></div>");
$templateCache.put("components/collection/collection.html","<button class=\"hide btn pull-right\" ng-click=\"save()\" ng-class=\"{\'btn-default\': collection.saving, \'btn-success\': !collection.saving}\">Save</button> <button class=\"hide btn pull-right\" ng-click=\"undo()\" ng-class=\"{\'btn-default\': collection.saving, \'btn-inverse\': !collection.saving}\">Undo</button><div class=\"row\" ng-class=\"{\'drop-zone\': collection.docsAreReorderable}\"><div class=\"lead topRow\" ng-show=\"collection.docsAreReorderable\">Drag and drop a item\'s number to re-order it</div><div class=\"well\" ng-class=\"{\'col-md-12\': collection.showDocCheckboxes}\" ng-repeat=\"item in collection._collection track by $index\" drag-hover-class=\"drop-zone-instructions-can-reorder-here\" ui-on-drop=\"onDrop($event, $data, $index, collection._collection)\"><div ng-class=\"{\'col-md-1\': collection.showDocCheckboxes || collection.docsAreReorderable}\"><span><input type=\"checkbox\" ng-show=\"collection.showDocCheckboxes\"></span> <span class=\"badge badge-info\" ng-show=\"collection.docsAreReorderable\" title=\"Position in list\" ui-draggable=\"true\" drag=\"item\" on-drop-success=\"dropSuccessHandler($event, $index, collection._collection)\">N. {{$index +1}}</span> <span ng-click=\"removeItemFromList(item)\"><i class=\"fa fa-times-circle\"></i></span></div><div ng-class=\"{\'col-md-10\': collection.showDocCheckboxes}\" data-fielddb-doc=\"\" json=\"item\"></div></div></div><div ng-show=\"canAddNewItemsToCollection()\"><i class=\"fa fa-plus-circle\"></i> Add</div><blockquote hidden=\"\" ng-hide=\"true\" class=\"status\">{{collection.warnMessage}} {{collection.warnMessage}}</blockquote>");
$templateCache.put("components/corpus/corpus-page.html","<div class=\"row well\"><div class=\"col-md-4\" data-fielddb-doc=\"\" json=\"application.corpus.team\"></div><div class=\"col-md-6\"><div class=\"row\" data-fielddb-corpus=\"\" json=\"application.corpus\"></div><div class=\"row\" data-fielddb-activity-heatmap=\"\"></div><div class=\"row\" data-fielddb-search=\"\"></div><div data-fielddb-lexicon-connected-graph=\"\" class=\"fielddb-lexicon lexicon-connected-graph\" json=\"application.corpus\"></div><div id=\"glosser\" class=\"fielddb-lexicon\"></div><div data-fielddb-lexicon-nodes=\"\" class=\"fielddb-lexicon lexicon-nodes\" json=\"application.corpus\"></div></div></div><h1>Fieldlinguist Widgets</h1><div class=\"row well\" data-fielddb-datalist=\"\" json=\"application.datumsList\" corpus=\"application.corpus\"></div><div class=\"row well\" data-fielddb-datalist=\"\" json=\"application.commentsList\" corpus=\"application.corpus\"></div><div class=\"row well\" data-fielddb-datalist=\"\" json=\"application.sessionsList\" corpus=\"application.corpus\"></div><div class=\"row well\" data-fielddb-datalist=\"\" json=\"application.datalistsList\" corpus=\"application.corpus\"></div><div class=\"row well\" data-fielddb-datalist=\"\" json=\"application.speakersList\" corpus=\"application.corpus\"></div><div class=\"row well\" data-fielddb-datalist=\"\" json=\"application.consultantsList\" corpus=\"application.corpus\"></div><h1>General Widgets</h1><div class=\"row well\" data-fielddb-datalist=\"\" json=\"application.usersList\" corpus=\"application.corpus\"></div><div class=\"row well\">Tags</div><div class=\"row well\">States</div><div class=\"row well\">Fields</div><h1>Psycholinguistics Widgets</h1><div class=\"row well\" data-fielddb-datalist=\"\" json=\"application.participantsList\" corpus=\"application.corpus\"></div><div class=\"row well\" data-fielddb-datalist=\"\" json=\"application.responsesList\" corpus=\"application.corpus\"></div><div class=\"row well\" data-fielddb-datalist=\"\" json=\"application.reportsList\" corpus=\"application.corpus\"></div><div class=\"row well\" data-fielddb-import=\"\" json=\"application.importer\"></div><div id=\"lexicon\" class=\"fielddb-lexicon\"></div><div data-fielddb-lexicon-data=\"\" json=\"application.corpus\" class=\"fielddb-lexicon\" placeholder=\"Lexicon raw data\"></div><div class=\"row col-md-12\" data-fielddb-corpus-terms-of-use=\"\" json=\"application.corpus\"></div>");
$templateCache.put("components/corpus/corpus.html","<h1>{{corpus.title}}</h1>{{corpus.corpus}}<div><a href=\"http://app.lingsync.org/{{corpus.dbname}}\" class=\"pull-right\"><img ng-src=\"https://secure.gravatar.com/avatar/{{corpus.gravatar}}?d=retro&r=pg\" alt=\"Corpus image\"></a><div><div>{{corpus.description}}</div></div></div>{{corpus.status}} {{corpus.warn}}");
$templateCache.put("components/corpus/terms-of-use.html","<div class=\"tabbable\"><ul class=\"nav nav-tabs\"><li class=\"active\"><a href=\"#terms\" data-toggle=\"tab\">Terms of Use for {{corpus.title}} {{corpus.copyright}}</a></li><li><a href=\"#emeldtermsreccomendations\" data-toggle=\"tab\">Why have a Terms of Use?</a></li></ul><div class=\"tab-content\"><div id=\"terms\" class=\"tab-pane active\"><p>{{corpus.termsOfUse.humanReadable}}</p><span>License:</span> <a href=\"{{corpus.license.link}}\" rel=\"license\" title=\"More details about {{corpus.license.title}}\">{{corpus.license.title}}</a><p>{{corpus.license.humanReadable}}</p><img ng-src=\"{{corpus.license.imgURL}}\" alt=\"License\"></div><div id=\"emeldtermsreccomendations\" class=\"tab-pane\"><ul><li><dl>EMELD digital language documentation Best Practices #7:<dt>Rights</dt><dd>Resource creators, researchers and the speech communities who provide the primary data have different priorities over who has access to language resources.</dd><dt>Solution</dt><dd>Terms of use should be well documented, and enforced if necessary with encryption or licensing. It is important however to limit the duration of <a target=\"_blank\" href=\"http://emeld.org/school/classroom/ethics/access.html\">access restrictions</a> : A resource whose access is permanently restricted to one user is of no long-term value since it cannot be used once that user is gone.</dd></dl></li></ul></div></div></div>");
$templateCache.put("components/connection/offline-controls.html","<label class=\"topcoat-switch\"><input type=\"checkbox\" ng-model=\"connection.online\" class=\"btn-large topcoat-switch__input\"><div class=\"topcoat-switch__toggle\"></div></label> {{connection.apiURL}} {{connection.offlineCouchURL}}");
$templateCache.put("components/datalist/all-data-page.html","<div data-fielddb-datalist=\"\" json=\"application.datumsList\" corpus=\"application.corpus\"></div>");
$templateCache.put("components/datalist/datalist.html","<button class=\"hide btn pull-right\" ng-click=\"save()\" ng-class=\"{\'btn-default\': datalist.saving, \'btn-success\': !datalist.saving}\">Save</button> <button class=\"hide btn pull-right\" ng-click=\"undo()\" ng-class=\"{\'btn-default\': datalist.saving, \'btn-inverse\': !datalist.saving}\">Undo</button><h1>{{datalist.title.default}}</h1><p>{{datalist.description.default}}</p><p ng-show=\"typeof (datalist.title == \'string\')\">{{datalist.description}}</p><div class=\"row\" ng-class=\"{\'drop-zone\': datalist.docsAreReorderable}\"><div class=\"lead topRow\" ng-show=\"datalist.docsAreReorderable\">Drag and drop a item\'s number to re-order it</div><div class=\"well\" ng-class=\"{\'col-md-12\': datalist.showDocCheckboxes}\" ng-repeat=\"item in datalist.docs._collection track by $index\" drag-hover-class=\"drop-zone-instructions-can-reorder-here\" ui-on-drop=\"onDrop($event, $data, $index, datalist.docs._collection)\"><div ng-class=\"{\'col-md-1\': datalist.showDocCheckboxes || datalist.showDocPosition}\"><span><input type=\"checkbox\" ng-show=\"datalist.showDocCheckboxes\"></span> <span class=\"badge badge-info\" ng-show=\"datalist.showDocPosition\" title=\"Position in list\" ui-draggable=\"true\" drag=\"item\" on-drop-success=\"dropSuccessHandler($event, $index, datalist.docs._collection)\">N. {{$index +1}}</span> <span ng-click=\"removeItemFromList(item)\"><i class=\"fa fa-times-circle\"></i></span></div><div ng-class=\"{\'col-md-10\': datalist.showDocCheckboxes}\" data-fielddb-doc=\"\" json=\"item\" corpus=\"corpus\"></div></div></div><div ng-show=\"canAddNewItemsToDataList()\"><i class=\"fa fa-plus-circle\"></i> Add</div><pre ng-show=\"datalist.debugMode\">\r\n  {{datalist.docs._collection}}\r\n</pre><blockquote ng-show=\"datalist.debugMode\" class=\"status\">{{datalist.warnMessage}} {{datalist.docs.warnMessage}}</blockquote>");
$templateCache.put("components/datalist/datalists-page.html","Manage Data Lists<div data-fielddb-datalist=\"\" json=\"application.datalistsList\" corpus=\"application.corpus\"></div>");
$templateCache.put("components/doc/data-page.html","<div data-fielddb-doc=\"\" json=\"application.currentDoc\" corpus=\"application.corpus\"></div>");
$templateCache.put("components/experiment/reports-page.html","Manage Reports<div data-fielddb-datalist=\"\" json=\"application.reportsList\"></div>");
$templateCache.put("components/experiment/sub-experiment-datalist.html","<button class=\"btn pull-right\" ng-click=\"save()\" ng-class=\"{\'btn-default\': datalist.saving, \'btn-success\': !datalist.saving}\">Save</button> <button class=\"btn pull-right\" ng-click=\"undo()\" ng-class=\"{\'btn-default\': datalist.saving, \'btn-inverse\': !datalist.saving}\">Undo</button><h1 ng-model=\"datalist.label\"></h1><h3>{{datalist.title.default}}</h3><ul class=\"list-unstyled\"><li ng-repeat=\"context in datalist.title\" ng-hide=\"!context || context.indexOf(\'_\') > -1\" contenteditable=\"\" ng-model=\"context\"></li></ul><h3>Descriptions:</h3><ul class=\"list-unstyled\"><li ng-repeat=\"context in datalist.description\" ng-hide=\"!context || context.indexOf(\'_\') > -1\" contenteditable=\"\" ng-model=\"context\"></li></ul><h3>Instructions:</h3><ul class=\"list-unstyled\"><li ng-repeat=\"context in datalist.instructions\" ng-hide=\"!context || context.indexOf(\'_\') > -1\" contenteditable=\"\" ng-model=\"context\"></li></ul><h3>Reinforcement Cartoon:</h3><div><img title=\"Before Start\" class=\"gravatar-medium\" ng-src=\"{{datalist.reinforcementAnimation.firstImageSrc}}\"> <img title=\"N. {{$index + 1}}\" class=\"gravatar-medium\" ng-repeat=\"image in datalist.reinforcementAnimation.animationImages\" ng-src=\"{{image.incompleteImageFile}}\"> <img title=\"After Last\" class=\"gravatar-medium\" ng-src=\"{{datalist.reinforcementAnimation.lastImageSrc}}\"></div><h3>Passing Score:</h3><div contenteditable=\"\" ng-model=\"datalist.passingScore\"></div><h3></h3><div class=\"row\" ng-class=\"{\'drop-zone\': datalist.docsAreReorderable}\"><div class=\"lead topRow\" ng-show=\"datalist.docsAreReorderable\">Drag and drop a stimulus\' number to re-order it</div><div class=\"well\" ng-class=\"{\'col-md-12\': datalist.showDocCheckboxes}\" ng-repeat=\"item in datalist.docs._collection track by $index\" drag-hover-class=\"drop-zone-instructions-can-reorder-here\" ui-on-drop=\"onDrop($event, $data, $index, datalist.docs._collection)\"><div ng-class=\"{\'col-md-1\': datalist.showDocCheckboxes || datalist.showDocPosition}\"><span><input type=\"checkbox\" ng-show=\"datalist.showDocCheckboxes\"></span> <span class=\"badge badge-info\" ng-show=\"datalist.showDocPosition\" title=\"Position in list\" ui-draggable=\"true\" drag=\"item\" on-drop-success=\"dropSuccessHandler($event, $index, datalist.docs._collection)\">N. {{$index +1}}</span> <span ng-click=\"removeItemFromList(item)\"><i class=\"fa fa-times-circle\"></i></span></div><div ng-class=\"{\'col-md-10\': datalist.showDocCheckboxes}\" data-fielddb-doc=\"\" json=\"item\" corpus=\"corpus\"></div></div></div><div ng-show=\"canAddNewItemsToDataList()\"><i class=\"fa fa-plus-circle\"></i> Add</div><blockquote hidden=\"\" ng-hide=\"true\" class=\"status\">{{datalist.warnMessage}} {{datalist.docs.warnMessage}}</blockquote>");
$templateCache.put("components/help/faq.html","<iframe height=\"1000\" width=\"100%\" ng-src=\"{{application.faq}}\" allowtransparency=\"true\" frameborder=\"0\"></iframe>");
$templateCache.put("components/datum/datum-field.html","<span class=\"pull-right {{datumField.label}}\"><span>{{contextualize(\'locale_Encrypt_if_confidential\')}}</span> <input type=\"checkbox\" ng-class=\"{\'shouldBeEncrypted\': datumField.shouldBeEncrypted}\"><i class=\"remove-datum-field icon-remove-sign\"></i></span> <label>{{contextualize(\'locale_Title\')}}</label> <input class=\"{\'choose-field: datumField.userchooseable}\" ng-model=\"datumField.labelFieldLinguists\" type=\"text\"> <label>{{contextualize(\'locale_Help_Text\')}}</label> <textarea class=\"help-text\" placeholder=\"{{contextualize(\'locale_Help_Text_Placeholder\')}}\" ng-model=\"datumField.helpLinguists\"></textarea>");
$templateCache.put("components/datum/datum.html","<span ng-click=\"showGeneric()\"><i class=\"fa fa-list\"></i></span> <span ng-click=\"showListItem()\"><i class=\"fa fa-th-list\"></i></span> <span ng-click=\"showSpreadsheetStyle()\"><i class=\"fa fa-table\"></i></span> <span ng-click=\"showLanguageLessonStyle()\"><i class=\"fa fa-child\"></i></span> <span ng-click=\"showStimulusStyle()\"><i class=\"fa fa-image\"></i></span><br>As a List Item:<div class=\"well\" ng-include=\"\'components/datum/datum_list_item.html\'\"></div>As an Interlinear Glossed Text:<div class=\"well\" ng-include=\"\'components/datum/datum_igt.html\'\"></div>As a Spreadsheet Row:<div class=\"well\" ng-include=\"\'components/datum/datum_spreadsheet.html\'\"></div>As a Language Lesson:<div class=\"well\" ng-include=\"\'components/datum/datum_language_lesson.html\'\"></div>As a Stimulus:<div class=\"well\" ng-include=\"\'components/datum/datum_stimulus.html\'\"></div>Showing Everything:<div class=\"well\" ng-include=\"\'components/datum/datum_generic.html\'\"></div>");
$templateCache.put("components/datum/datum_generic.html","<div class=\"row\"><div class=\"pull-right\"><button class=\"hide btn btn-{{datum.buttonColor}} save-datum\" value=\"Save\">{{locale.locale_Save}}</button></div><a class=\"datum_id\" name=\"{{datum._id}}\"></a><div class=\"col-md-6 images-area\" ng-repeat=\"image in datum.images._collection\"><img ng-src=\"{{image.URL}}\" title=\"{{image.caption}}\"><p>{{image.caption}}</p></div><div class=\"col-md-6 preview_IGT_area\"></div><dl class=\"col-md-6 datum_fields_ul unstyled\" ng-repeat=\"field in datum.datumFields._collection\"><dt ng-show=\"showThisFieldForThisUserType(field)\">{{field.label}}:</dt><dd ng-show=\"showThisFieldForThisUserType(field)\" title=\"field.help\" contenteditable=\"\" ng-model=\"field.value\"></dd></dl><button class=\"hide\" title=\"{{locale.locale_See_Fields}}\" rel=\"tooltip\"><i class=\"icons fa fa-list-alt pull-right\"></i></button><div class=\"row-fluid\"><div class=\"col-md-6\"><div class=\"hide btn-group\"><a href=\"#corpus/{{datum.dbname}}/datum/new\" class=\"btn btn-mini btn-primary\" title=\"{{locale.locale_Insert_New_Datum}}\" rel=\"tooltip\"><i class=\"fa fa-plus\"></i></a> <button class=\"btn btn-mini btn-primary\" title=\"{{locale.locale_Duplicate}}\" rel=\"tooltip\"><i class=\"fa fa-copy\"></i></button> <button class=\"btn btn-mini btn-primary\" title=\"{{locale.locale_Encrypt}}\" rel=\"tooltip\"><i class=\"fa\" ng-class=\"{\'fa-lock\': !datum.encrypted, \'fa-unlock\': datum.encrypted}\"></i></button> <button class=\"btn btn-mini btn-primary\" title=\"{{locale.locale_Show_confidential_items_Tooltip}}\" rel=\"tooltip\"><i class=\"fa\" ng-class=\"{\'fa-eye\': !datum.decryptedMode, \'fa-eye-slash\': datum.decryptedMode}\"></i></button> <button class=\"btn btn-mini btn-primary play-audio\" title=\"{{locale.locale_Play_Audio}}\" rel=\"tooltip\"><i class=\"fa fa-bullhorn\"></i></button> <button class=\"btn btn-mini btn-info\" title=\"{{locale.locale_Plain_Text_Export_Tooltip}}\" rel=\"tooltip\"><i class=\"fa fa-paste\"></i></button> <button class=\"LaTeX btn btn-mini btn-info\" title=\"{{locale.locale_LaTeX}}\" rel=\"tooltip\"><i>LaTeX</i></button> <button class=\"CSV btn btn-mini btn-info\" title=\"{{locale.locale_CSV_Tooltip}}\" rel=\"tooltip\"><i>CSV</i></button> <button class=\"btn btn-mini btn-danger trash-button\" title=\"Put datum in the trash\" rel=\"tooltip\"><i class=\"fa fa-trash\"></i></button></div><br><button class=\"hide audio_video\" title=\"{{locale.locale_Drag_and_Drop_Audio_Tooltip}}\" rel=\"tooltip\"></button><ul class=\"audio_video_ul unstyled\" ng-repeat=\"audioVideo in datum.audioVideo._collection\"><audio id=\"{{audioVideo.URL}}\" title=\"{{audioVideo.description}}\" preload=\"\" controls=\"\"><source ng-src=\"{{audioVideo.URL}}\" type=\"{{audioVideo.audioType}}\"></audio>{{audioVideo.startTime}} - {{audioVideo.endTime}}</ul></div><div class=\"hide col-md-3 border-left\"><ul class=\"datum_tags_ul unstyled\"></ul><div class=\"controls no-margin-left\"><div class=\"input-append\"><input class=\"add_tag col-md-6\" type=\"text\" data-provide=\"typeahead\" data-items=\"4\" data-source=\"[&quot;Passive&quot;,&quot;Nominalization&quot;]\"><button class=\"btn btn-small btn-primary add_datum_tag\" type=\"button\"><i class=\"fa fa-tag\"></i> <span>{{locale.locale_Add}}</span></button></div></div></div><div class=\"hide datum_state col-md-3 border-left\"><span class=\"label label-{{datum.datumstatecolor}} datum-primary-validation-status-color\"><i class=\"fa fa-flag\"></i><span class=\"datum-state-value\">{{datum.datumstate}}</span></span><br></div></div><ul class=\"comments unstyled\" ng-repeat=\"comment in datum.comments\"></ul><div class=\"extra-datum-info-which-can-be-hidden\"><span class=\"last-modified\">{{datum.dateModified}}</span><i class=\"fa fa-save\"></i><br><span class=\"date-created\">{{datum.dateEntered}}</span><i class=\"fa fa-time\"></i><br><span class=\"session-link\" data-fielddb-session=\"\" json=\"datum.session\"></span><div class=\"new-comment-area\"></div></div></div>");
$templateCache.put("components/datum/datum_igt.html","<div class=\"row\" ng-class=\"{\'scrollable\': datum.datumFields.utterance.value.length > 100}\"><div class=\"col-md-1\"><input type=\"checkbox\" class=\"datum-checkboxes\"> <i ng-show=\"datum.audioVideo.length > 0\" class=\"icon-bullhorn play-audio\"></i>{{datum.numberInCollection}}</div><div class=\"col-md-1\"><span class=\"latex-judgement\">{{datum.datumFields.judgement.value}}</span></div><div class=\"col-md-6\"><span ng-repeat=\"tuple in datum.igt\" class=\"glossCouplet\">{{tuple}}</span><br><span class=\"datum-latex-translation\">{{datum.datumFields.translation.value}}</span></div></div>");
$templateCache.put("components/datum/datum_language_lesson.html","<div class=\"pull-right\"><button class=\"btn btn-{{buttonColor}} save-datum\" value=\"Save\">{{locale_Save}}</button></div><h1>Gegina\'matimgewei</h1><h3>{{datum.datumFields.utterance.value}}</h3><p><i>{{datum.datumFields.translation.value}}</i></p><a class=\"datum_id\" name=\"{{datum.id}}\"></a><div class=\"row images-area\"></div><div class=\"row preview_IGT_area\"></div><a href=\"#\" title=\"{{locale_See_Fields}}\" rel=\"tooltip\"><i class=\"icons icon-list-alt pull-right\"></i></a><div class=\"row-fluid\"><div class=\"span6\"><div class=\"btn-group hide\"><a href=\"#corpus/{{dbname}}/datum/new\" class=\"btn btn-mini btn-primary\" title=\"{{locale_Insert_New_Datum}}\" rel=\"tooltip\"><i class=\"icon-plus\"></i></a> <a href=\"#\" class=\"btn btn-mini btn-primary\" title=\"{{locale_Duplicate}}\" rel=\"tooltip\"><i class=\"icon-copy\"></i></a> <a href=\"#\" class=\"btn btn-mini btn-primary\" title=\"{{locale_Encrypt}}\" rel=\"tooltip\"><i class=\"fa\" ng-class=\"{\'fa-lock\': !datum.encrypted, \'fa-unlock\': datum.encrypted}\"></i></a> <a href=\"#\" class=\"btn btn-mini btn-primary\" title=\"{{locale_Show_confidential_items_Tooltip}}\" rel=\"tooltip\"><i class=\"fa\" ng-class=\"{\'fa-eye\': !datum.decryptedMode, \'fa-eye-slash\': datum.decryptedMode}\"></i></a> <a href=\"#\" class=\"btn btn-mini btn-primary play-audio\" title=\"{{locale_Play_Audio}}\" rel=\"tooltip\"><i class=\"icon-bullhorn\"></i></a> <a href=\"#\" class=\"btn btn-mini btn-info\" title=\"{{locale_Plain_Text_Export_Tooltip}}\" rel=\"tooltip\"><i class=\"icon-paste\"></i></a> <a href=\"#\" class=\"LaTeX btn btn-mini btn-info\" title=\"{{locale_LaTeX}}\" rel=\"tooltip\"><i>LaTeX</i></a> <a href=\"#\" class=\"CSV btn btn-mini btn-info\" title=\"{{locale_CSV_Tooltip}}\" rel=\"tooltip\"><i>CSV</i></a> <a href=\"#\" class=\"btn btn-mini btn-danger trash-button\" title=\"Put datum in the trash\" rel=\"tooltip\"><i class=\"icon-trash\"></i></a></div><br><a href=\"#\" class=\"audio_video\" title=\"{{locale_Drag_and_Drop_Audio_Tooltip}}\" rel=\"tooltip\"></a><ul class=\"audio_video_ul unstyled\"></ul></div><div class=\"span3 border-left hide\"><ul class=\"datum_tags_ul unstyled\"></ul><div class=\"controls no-margin-left\"><div class=\"input-append\"><input class=\"add_tag span6\" type=\"text\" data-provide=\"typeahead\" data-items=\"4\" data-source=\"[&quot;Passive&quot;,&quot;Nominalization&quot;]\"><button class=\"btn btn-small btn-primary add_datum_tag\" type=\"button\"><i class=\"icon-tag\"></i> <span>{{locale_Add}}</span></button></div></div></div><div class=\"datum_state span3 border-left hide\"><span class=\"label label-{{datumstatecolor}} datum-primary-validation-status-color\"><i class=\"icon-flag\"></i><span class=\"datum-state-value\">{{datum.datumstate}}</span></span><br></div></div><ul class=\"comments unstyled\"></ul><div class=\"extra-datum-info-which-can-be-hidden\"><table class=\"datum_fields_ul unstyled language-learning-lesson\"></table><span class=\"last-modified\">{{datum.dateModified}}</span><i class=\"icon-save\"></i><br><span class=\"date-created\">{{datum.dateEntered}}</span><i class=\"icon-time\"></i><br><span class=\"session-link hide\"></span><div class=\"new-comment-area\"></div></div>");
$templateCache.put("components/datum/datum_list_item.html","<div class=\"row\"><span class=\"col-md-2\"><img class=\"gravatar-medium\" ng-repeat=\"image in datum.images._collection\" ng-src=\"{{image.URL}}\" title=\"{{image.caption}}\"></span> <span class=\"col-md-1\">{{datum.datumFields.utterance.value}}</span> <span class=\"audio_video_ul col-md-6\"><audio id=\"{{audioVideo.URL}}\" ng-repeat=\"audioVideo in datum.audioVideo._collection\" title=\"{{audioVideo.description}} {{audioVideo.startTime}} - {{audioVideo.endTime}}\" preload=\"\" controls=\"\"><source ng-src=\"{{audioVideo.URL}}\" type=\"{{audioVideo.audioType}}\"></audio><span>{{datum.datumFields.tags.value}}</span></span> <span class=\"hide datum_state col-md-1 border-left\"><span class=\"label label-{{datum.datumstatecolor}} datum-primary-validation-status-color\"><i class=\"fa fa-flag\"></i><span class=\"datum-state-value\">{{datum.datumstate}}</span></span><br></span> <span class=\"col-md-1\"><i class=\"fa fa-comments\">{{datum.comments.length}}</i></span></div>");
$templateCache.put("components/datum/datum_spreadsheet.html","<div class=\"row Spreadsheet-selectedRow\" ng-hide=\"datum.fetching==true\"><div ng-show=\"selected==$index\"><form ng-submit=\"markAsEdited(datum);\"><div class=\"col-md-5\"><input guess-morphemes-from-utterance=\"\" auto-glosser-on=\"{{useAutoGlosser}}\" keypress-mark-as-edited=\"\" class=\"col-md-5\" type=\"text\" ng-model=\"datum.datumFields[corpus.datumFields._collection[0].id].value\" ng-hide=\"corpus.datumFields._collection[0].id==\'\'\" placeholder=\"{{corpus.datumFields._collection[0].help}}\" title=\"{{corpus.datumFields._collection[0].help}}\"> <input guess-gloss-from-morphemes=\"\" guess-utterance-from-morphemes=\"\" auto-glosser-on=\"{{useAutoGlosser}}\" keypress-mark-as-edited=\"\" class=\"col-md-5\" type=\"text\" ng-model=\"datum.datumFields[corpus.datumFields._collection[1].id].value\" value=\"{{datum.datumFields[corpus.datumFields._collection[1].id]}}\" ng-hide=\"corpus.datumFields._collection[1].id==\'\'\" placeholder=\"{{corpus.datumFields._collection[1].help}}\" title=\"{{corpus.datumFields._collection[1].help}}\"> <input keypress-mark-as-edited=\"\" class=\"col-md-5\" type=\"text\" ng-model=\"datum.datumFields[corpus.datumFields._collection[2].id].value\" ng-hide=\"corpus.datumFields._collection[2].id==\'\'\" placeholder=\"{{corpus.datumFields._collection[2].help}}\" title=\"{{corpus.datumFields._collection[2].help}}\"></div><div class=\"col-md-5\"><input keypress-mark-as-edited=\"\" class=\"col-md-5\" type=\"text\" ng-model=\"datum.datumFields[corpus.datumFields._collection[3].id].value\" ng-hide=\"corpus.datumFields._collection[3].id==\'\'\" placeholder=\"{{corpus.datumFields._collection[3].help}}\" title=\"{{corpus.datumFields._collection[3].help}}\"> <input keypress-mark-as-edited=\"\" class=\"col-md-5\" type=\"text\" ng-model=\"datum.datumFields[corpus.datumFields._collection[4].id].value\" ng-hide=\"corpus.datumFields._collection[4].id==\'\'\" placeholder=\"{{corpus.datumFields._collection[4].help}}\" title=\"{{corpus.datumFields._collection[4].help}}\"> <input keypress-mark-as-edited=\"\" class=\"col-md-5\" type=\"text\" ng-model=\"datum.datumFields[corpus.datumFields._collection[5].id].value\" ng-hide=\"corpus.datumFields._collection[5].id==\'\'\" placeholder=\"{{corpus.datumFields._collection[5].help}}\" title=\"{{corpus.datumFields._collection[5].help}}\"></div><div class=\"col-md-2 entered_modified_info\"><span title=\"Date entered {{datum.dateEntered | fielddbPrettyDate}}\"><i class=\"fa whiteicon fa-clock-o\"></i> Entered: {{datum.dateEntered | fielddbPrettyDate}}</span><br><span ng-hide=\"!datum.enteredByUser\"><img title=\"{{datum.enteredByUser.username}}\" ng-hide=\"!datum.enteredByUser.gravatar\" ng-src=\"https://secure.gravatar.com/avatar/{{datum.enteredByUser.gravatar}}?s=30&d=identicon\"><br></span><br><span title=\"Date modified {{datum.dateModified | fielddbPrettyDate}}\"><i class=\"fa whiteicon fa-clock-o\"></i>Last edit: {{datum.dateModified | fielddbPrettyDate}}</span><br><span ng-hide=\"!datum.modifiedByUser.users[0]\"><i class=\"fa whiteicon fa-group\"></i> Edited:<br></span> <span ng-repeat=\"modifiedByUser in datum.modifiedByUser.users\"><img ng-src=\"https://secure.gravatar.com/avatar/{{modifiedByUser.gravatar}}?s=30&d=identicon\" title=\"{{modifiedByUser.username}}\">&nbsp;</span><div ng-click=\"toggleExpanded()\"><i ng-show=\"datum.audioVideo.length > 0\" class=\"fa whiteicon fa-bullhorn\"></i> <i ng-show=\"datum.comments.length > 0\" class=\"fa whiteicon fa-comment\"></i> <i class=\"fa whiteicon\" ng-class=\"{\'fa-list\': !expanded, \'fa-th-list\': expanded}\"></i></div></div></form><div class=\"row\" ng-show=\"expanded==true && !datum.id\"><div class=\"col-md-10 offset1 pagination-centered\"><b>You must \'Save\' your changes to have access to the audio, comment, and delete features of this record.</b></div></div><div class=\"container-fluid\"><div class=\"row\" ng-show=\"expanded==true && datum.id!=undefined\"><div class=\"col-md-10 Spreadsheet-expandedDataComments\"><div class=\"Spreadsheet-expandedDataInner\"><ul class=\"unstyled\"><li ng-hide=\"corpus.prefs.dontShowComments\" ng-repeat=\"comment in datum.comments\"><a ng-click=\"removeComment(comment, datum)\" class=\"floatLeft delete_button\"><i class=\"fa fa-times-circle\"></i></a> <img title=\"{{comment.username}}\" ng-src=\"https://secure.gravatar.com/avatar/{{comment.gravatar}}?s=30&d=identicon\">&nbsp; <i class=\"fa fa-comment\"></i> {{comment.text}} <i class=\"fa fa-clock-o\"></i> {{comment.timestamp | fielddbPrettyDate}}</li></ul><button ng-show=\"commentPermissions==true\" class=\"btn btn-primary\" ng-click=\"addComment(datum);\"><i class=\"fa whiteicon fa-comment\"></i> Add Comment</button></div></div></div><div class=\"row\" ng-show=\"expanded==true && datum.id!=undefined\"><div class=\"col-md-3 Spreadsheet-expandedData\"><div class=\"expandedDataInner\"><button ng-class=\"recordingButtonClass\" ng-click=\"startRecording(datum);markAsEdited(datum);\" ng-show=\"audioCompatible==true\"><i class=\"fa {{recordingIcon}}\"></i>&nbsp;{{recordingStatus}}</button></div></div><div class=\"col-md-7 Spreadsheet-expandedData\"><div class=\"expandedDataInner\"><form id=\"form_{{datum.id}}_audio-file\"><i class=\"fa fa-bullhorn\"></i>&nbsp; <input id=\"{{datum.id}}_audio-file\" type=\"file\" multiple=\"\" ng-model=\"fileToUpload\"> <button class=\"btn btn-primary\" ng-click=\"uploadFile(datum);\"><i class=\"fa whiteicon fa-file\"></i> Upload File(s)</button>&nbsp;&nbsp;</form></div></div><div class=\"col-md-1\"><span ng-show=\"processingAudio==true\"><img ng-src=\"img/spinner-small.gif\"></span></div></div><div class=\"row\" ng-show=\"expanded==true && datum.id!=undefined\"><div class=\"col-md-10\"><table><tr ng-repeat=\"audioFile in datum.audioVideo\" ng-hide=\"audioFile.trashed == \'deleted\'\"><td><span class=\"form-horizontal\"><a class=\"delete_button btn btn-danger floatLeft\" ng-click=\"trashAudio(audioFile)\"><i class=\"fa fa-trash-o whiteicon\"></i></a><audio controls=\"\"><source ng-src=\"{{audioFile.URL}}\" type=\"audio/wav\"></audio></span></td><td><span class=\"form-horizontal\"><input type=\"text\" keypress-mark-as-edited=\"\" placeholder=\"Optional description\" title=\"Optional description\" ng-model=\"audioFile.description\"> &nbsp; <button hidden=\"\" class=\"btn-small btn-primary\" ng-click=\"saveAudio(audioFile)\" ng-show=\"datum.id!=undefined\">Save Description</button></span></td><td><a href=\"{{audioFile.URL}}\" target=\"_blank\"><i class=\"fa whiteicon fa-link\"></i></a></td></tr></table><hr><button class=\"btn btn-inverse\" type=\"button\" ng-click=\"trashDatum(datum)\"><i class=\"fa fa-trash-o\"></i> Delete This Record</button></div></div></div></div></div>");
$templateCache.put("components/datum/datum_stimulus.html","<div class=\"row\"><a class=\"datum_id\" name=\"{{datum._id}}\"></a><div class=\"col-md-6 images-area\"><div ng-repeat=\"image in datum.images._collection\"><img class=\"gravatar-large\" ng-src=\"{{image.URL}}\" title=\"{{image.caption}}\"><dl><dt>Image File:</dt><dd>{{image.filename}}</dd><dt>Image Caption:</dt><dd contenteditable=\"\" ng-model=\"image.caption\"></dd></dl></div></div><div class=\"col-md-6 audio_video_ul\"><div ng-repeat=\"audioVideo in datum.audioVideo._collection\"><audio id=\"{{audioVideo.URL}}\" title=\"{{audioVideo.description}} {{audioVideo.startTime}} - {{audioVideo.endTime}}\" preload=\"\" controls=\"\"><source ng-src=\"{{audioVideo.URL}}\" type=\"{{audioVideo.audioType}}\"></audio><br><dl><dt>Audio File:</dt><dd>{{audioVideo.filename}}</dd><dt>Audio Description:</dt><dd contenteditable=\"\" ng-model=\"audioVideo.description\"></dd></dl></div></div><dl class=\"col-md-6 datum_fields_ul\"><dt>Orthography:</dt><dd title=\"datum.datumFields.orthography.help\" contenteditable=\"\" ng-model=\"datum.datumFields.orthography.value\"></dd><dt>International Phonetic Alphabet:</dt><dd title=\"datum.datumFields.utterance.help\" contenteditable=\"\" ng-model=\"datum.datumFields.utterance.value\"></dd><dt>Tags:</dt><dd title=\"datum.datumFields.tags.help\" contenteditable=\"\" ng-model=\"datum.datumFields.tags.value\"></dd></dl><div class=\"col-md-6\"><ul class=\"comments unstyled\"><li ng-repeat=\"comment in datum.comments\">comment.text</li></ul><div class=\"extra-datum-info-which-can-be-hidden\"><i class=\"fa fa-save\"></i> <span class=\"last-modified\" title=\"{{datum.dateModified | fielddbPrettyDate}}\">{{datum.dateModified | fielddbAgoDate}}</span><br><i class=\"fa fa-time\"></i> <span class=\"date-created\" title=\"{{datum.dateEntered | fielddbPrettyDate}}\">{{datum.dateEntered | fielddbPrettyDate}}</span><br></div></div></div>");
$templateCache.put("components/locales/locales.html","<span ng-hide=\"showFullView\">{{locales.currentLocale.iso}}</span> <label ng-show=\"showFullView\">Change the user interface language:</label><select class=\"btn btn-inverse\" ng-model=\"locales.currentLocale\" ng-options=\"locale[localeKeyToShow] for locale in locales.availableLanguages._collection\" ng-change=\"persistUsersChosenLocale(locales.currentLocale)\"></select><select class=\"hide btn btn-default\" ng-model=\"application.authentication.user.prefs.preferredDashboardType\" title=\"Which kind of dashboard defaults would you like to use view this corpus?\"><option value=\"experimenterNormalUser\">Experiment Administrator (basic)</option><option value=\"psychoLinguistPowerUser\">Psycho Linguist (advanced)</option><option value=\"fieldLinguistNormalUser\">Field Linguist (basic)</option><option value=\"fieldLinguistPowerUser\">Field Linguist/Translator (advanced)</option><option value=\"speaker\">Language Speaker</option><option value=\"languageLearnerCourseUser\">Language Learner (course work)</option><option value=\"languageLearnerImmersionUser\">Language Learner (immersion)</option><option value=\"translatorNormalUser\">Translator</option></select><p ng-show=\"showFullView\">Current Locale: {{locales.currentLocale.nativeName}} - {{locales.currentLocale.name}}<br><button class=\"btn btn-inverse\" ng-click=\"clearLocalizerUserPreferences()\"><i class=\"fa fa-remove\"></i> Reset to defaults</button></p><div hidden=\"\">Locale Settings Popup too</div>");
$templateCache.put("components/navbar/navbar.html","<nav class=\"navbar navbar-static-top navbar-inverse\" ng-controller=\"NavbarCtrl\"><div class=\"container-fluid\"><div class=\"navbar-header\"><button type=\"button\" class=\"navbar-toggle\" data-toggle=\"collapse\" data-target=\"#fielddb-navbar-mobile-menu\"><span class=\"sr-only\">Toggle navigation</span> <span class=\"icon-bar\"></span> <span class=\"icon-bar\"></span> <span class=\"icon-bar\"></span></button> <a class=\"navbar-brand\" ng-href=\"{{application.website}}\" target=\"_blank\">{{application.brand}}</a></div><div class=\"collapse navbar-collapse\" id=\"fielddb-navbar-mobile-menu\"><ul class=\"nav navbar-nav\"><li class=\"active\"><a href=\"/#\">Home</a></li><li><a ui-sref=\"faq\">About</a></li><li><a ui-sref=\"contact\">Contact</a></li></ul><ul class=\"nav navbar-nav navbar-right\"><li>Current date: {{ date | date:\'yyyy-MM-dd\' }}</li></ul></div></div></nav>");
$templateCache.put("components/import/import-page.html","<p class=\"lead\">Import Dashboard</p><div class=\"row well\" data-fielddb-datalist=\"\" json=\"datumsList\" ng-show=\"application.importer.importType == application.datumsList.api\"></div><div class=\"row well\" data-fielddb-datalist=\"\" json=\"application.participantsList\" ng-show=\"application.importer.importType == application.participantsList.api\"></div><div class=\"row well\" data-fielddb-import=\"\" json=\"application.importer\"></div>");
$templateCache.put("components/import/import.html","<div class=\"container-fluid\"><div class=\"row-fluid\"><div><h1 ng-hide=\"importer.importType==\'audioVideo\'\"><span>{{locale.locale_Import}}</span> <small>{{corpus.dbname}}</small></h1><h5 ng-hide=\"importer.importType==\'audioVideo\'\"><span>{{locale.locale_Import_Instructions}}</span> <a href=\"http://www.facebook.com/LingSyncApp\" target=\"_blank\"><i class=\"icons icon-facebook\"></i></a> <a href=\"https://twitter.com/lingsync\" target=\"_blank\"><i class=\"icons icon-twitter\"></i></a></h5><pre hidden=\"\" ng-hide=\"true\" class=\"status\">\r\n        status: {{importer.status}}\r\n        bugMessage:  {{importer.bugMessage}}\r\n        warnMessage:  {{importer.warnMessage}}\r\n\r\n        corpus bugMessage: {{importer.corpus.bugMessage}}\r\n        corpus warnMessage: {{importer.corpus.warnMessage}}\r\n      </pre></div></div><div class=\"row-fluid\"></div><div class=\"\" id=\"import-first-step\"><span ng-hide=\"importer.importType==\'audioVideo\'\">{{locale.locale_Import_First_Step}}</span> <label ng-show=\"linguistApp\"><i class=\"fa fa-gift\"></i> <span>New! Import long audio/video stimuli(s)</span></label><form class=\"form-inline button-group btn-mini\" role=\"form\" enctype=\"multipart/form-data\"><span class=\"btn btn-file btn-info\"><span><i class=\"fa fa-file\"></i> {{contextualize(\'locale_choose_files\')}}</span> <input class=\"uploadAudioForTextGridformFiles\" type=\"file\" multiple=\"true\" name=\"files\" ng-file-select=\"onFileSelect($files)\" data-multiple=\"true\" value=\"Audio/Video/Image/Text files to be imported\"></span> <input class=\"hidden hide\" hidden=\"\" type=\"text\" name=\"token\" ng-model=\"uploadInfo.token\"> <input class=\"hidden hide\" hidden=\"\" type=\"text\" name=\"username\" ng-model=\"uploadInfo.username\"> <input class=\"hidden hide\" hidden=\"\" type=\"text\" name=\"dbname\" ng-model=\"uploadInfo.dbname\"> <input class=\"hidden hide\" hidden=\"\" type=\"text\" name=\"returnTextGrid\" ng-model=\"uploadInfo.returnTextGrid\"></form><textarea class=\"fielddb-large-textarea drop-zone\" ng-blur=\"guessFormatAndPreviewImport()\" placeholder=\"{{contextualize(\'locale_Drag_and_Drop_Placeholder\')}}\" ng-file-drop=\"onFileSelect($files)\" ng-file-drag-over-class=\"drop-zone-can-drop-now\" ng-file-drag-over-delay=\"200\" ng-model=\"importer.rawText\"></textarea><div class=\"btn-group pull-right\" ng-hide=\"importer.importType==\'audioVideo\'\"><button class=\"btn btn-info dropdown-toggle\" data-toggle=\"dropdown\"><span>Import from</span> <span class=\"caret\"></span></button><ul class=\"dropdown-menu\" ng-model=\"whichFormatToImport\"><li ng-click=\"importer.importTextIGT(importer.rawText)\"><a tabindex=\"-1\">Handout/Doc</a></li><li ng-click=\"importer.importCSV(importer.rawText)\"><a tabindex=\"-1\">CSV</a></li><li ng-click=\"importer.importTabbed(importer.rawText)\"><a tabindex=\"-1\">Tabbed</a></li><li ng-click=\"importer.importXML(importer.rawText)\"><a tabindex=\"-1\">XML</a></li><li ng-click=\"importer.importElanXML(importer.rawText)\"><a tabindex=\"-1\">ElanXML</a></li><li ng-click=\"importer.importToolbox(importer.rawText)\"><a tabindex=\"-1\">Toolbox</a></li><li ng-click=\"importer.importTextGrid(importer.rawText)\"><a tabindex=\"-1\">Praat Text Grid</a></li><li ng-click=\"importer.importLatex(importer.rawText)\"><a tabindex=\"-1\">LaTex</a></li></ul></div><span class=\"pull-right\" ng-hide=\"importer.importType==\'audioVideo\'\">Did the app guess the wrong format?</span></div><div class=\"well\" ng-show=\"importer.showImportSecondStep\"><span>{{locale.locale_Import_Second_Step}}</span> <button class=\"btn btn-info add-column pull-right hide\">{{locale.locale_Add_Extra_Columns}}</button><div class=\"container span11\"><div id=\"import-datum-field-labels\" class=\"row-fluid\"><span class=\"pull-left label label-info\" ui-draggable=\"true\" ng-repeat=\"participantField in importer.corpus.participantFields\" drag=\"participantField.labelExperimenter\" on-drop-success=\"dropSuccessHandler(participantField)\" ng-model=\"participantField.labelExperimenter\">{{participantField.labelExperimenter}}</span></div></div><div class=\"scrollable\"><table id=\"csv-table-area\" class=\"table table-striped table-bordered table-condensed\"><tr><th></th><th class=\"drop-zone\" ng-repeat=\"headerField in importer.extractedHeaderObjects._collection track by $index\" title=\"headerField.help\"><input ng-model=\"headerField.labelExperimenter\" drag-hover-class=\"drop-zone-can-drop-now\" ui-on-drop=\"onDropFieldLabelRecieved($data, importer.extractedHeaderObjects._collection, $index)\"></th></tr><tr ng-repeat=\"row in importer.asFieldMatrix track by $index\"><td ng-click=\"removeRow($index)\"><i class=\"fa fa-times-circle\"></i></td><td ng-repeat=\"cell in row track by $index\"><span contenteditable=\"\" ng-model=\"cell.value\" title=\"cell | json\" ng-hide=\"cell.type\"></span> <input ng-model=\"cell.value\" title=\"cell | json\" ng-show=\"cell.type\" nt-type=\"cell.type\"></td></tr></table></div><button class=\"btn btn-success approve-import\" ng-show=\"importer.asFieldMatrix.length > 0\" ng-click=\"previewDatalist()\">{{locale.locale_Attempt_Import}}</button></div><progress class=\"import-progress\" ng-value=\"importer.progress.completed\" ng-max=\"importer.progress.total\" ng-show=\"importer.progress.total\"><strong>{{locale.locale_percent_completed}}</strong></progress><div class=\"well container-fluid\" ng-show=\"importer.showImportThirdStep\"><span>{{locale.locale_Import_Third_Step}}</span><div class=\"row-fluid\" data-fielddb-datalist=\"\" json=\"importer.datalist\" corpus=\"importer.corpus\"></div><div class=\"well\" data-fielddb-doc=\"\" json=\"importer.session\" corpus=\"importer.corpus\"></div><button class=\"btn btn-success approve-save disabled\" ng-click=\"runImport()\">{{locale.locale_Save_And_Import}}</button></div></div>");
$templateCache.put("components/permission/permissions.html","<h2>{{contextualize(\'locale_users_with_access_message\')}} {{application.corpus.title}}</h2><ul class=\"list-unstyled\"><li ng-show=\"application.corpus.permissions.loading\"><img src=\"images/spinner-small.gif\"></li><li ng-repeat=\"permission in application.corpus.permissions._collection\"><h3>{{permission.id}}</h3><ul class=\"list-unstyled\"><li ng-repeat=\"user in permission.users._collection\"><img class=\"gravatar-large\" ng-src=\"https://secure.gravatar.com/avatar/{{user.gravatar}}?d=identicon\"> <span ng-click=\"removeAccessFromUser(user.username, [\'permission\'])\"><i class=\"fa fa-remove\"></i></span> {{user.username}}</li></ul></li></ul>");
$templateCache.put("components/session/session.html","<div class=\"row\"><div class=\"pull-right\"><button class=\"hide btn btn-{{session.buttonColor}} save-session\" value=\"Save\">{{locale.locale_Save}}</button></div><a class=\"session_id\" name=\"{{session._id}}\"></a><dl class=\"col-md-6 session_fields_ul unstyled\" ng-repeat=\"field in session.fields._collection\"><dt ng-show=\"showThisFieldForThisUserType(field)\">{{field.label}}:</dt><dd ng-show=\"showThisFieldForThisUserType(field)\" title=\"field.help\" contenteditable=\"\" ng-model=\"field.value\"></dd></dl><ul class=\"comments unstyled\" ng-repeat=\"comment in session.comments\"></ul><div class=\"extra-session-info-which-can-be-hidden\"><span class=\"last-modified\">{{session.dateModified}}</span><i class=\"fa fa-save\"></i><br><span class=\"date-created\">{{session.dateEntered}}</span><i class=\"fa fa-time\"></i><br><div class=\"new-comment-area\"></div></div></div>");
$templateCache.put("components/session/session_list_item.html","<a href=\"#/data/{{session.id}}\"><i class=\"icon-calendar\"></i> <span>{{session.dateElicited}}</span></a> -- <span>{{session.consultants}}</span><br><span>{{contextualize(\'locale_Goal\')}}</span> <span>{{session.goal}}</span>");
$templateCache.put("components/session/sessions-page.html","Manage Elicitation Sessions<div data-fielddb-datalist=\"\" json=\"application.sessionsList\" corpus=\"application.corpus\"></div>");
$templateCache.put("components/search/search-page.html","Search Dashboard<div class=\"row\" data-fielddb-search=\"\" json=\"application.search\"></div>");
$templateCache.put("components/search/search.html","<form role=\"form\" class=\"form-inline\" id=\"searchCorpus\" ng-action=\"{{corpus.searchUrl}}/{{corpus.dbname}}\" method=\"POST\" enctype=\"application/json\"><input type=\"text\" class=\"form-control\" id=\"queryString\" name=\"queryString\" placeholder=\"Enter search terms…\"> <button type=\"submit\" id=\"corpus_search\" class=\"btn btn-success\"><i style=\"margin-top:2px\" class=\"fa fa-search fa fa-white\"></i> Search…</button> <button id=\"corpus_build\" class=\"form-control btn btn-info\" ng-click=\"reindex(\'{{corpus.dbname}}\')\"><i class=\"fa fa-refresh fa fa-white\"></i> Rebuild search lexicon</button><div class=\"progress col-md-2\"><div class=\"progress-bar progress-bar-info\" role=\"progressbar\" aria-valuenow=\"60\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 60%;\"></div></div></form><p id=\"clearresults\" class=\"hide\"><button type=\"button\" id=\"clear_results\" onclick=\"clearresults()\" class=\"btn btn-mini btn-danger\"><i style=\"margin-top:2px\" class=\"fa fa-remove fa fa-white\"></i> Clear…</button></p>");
$templateCache.put("components/user/consultants-page.html","Language Consultants who participate in this corpus<div data-fielddb-datalist=\"\" json=\"application.consultantsList\" corpus=\"application.corpus\"></div>");
$templateCache.put("components/user/participant.html","<i class=\"fa pull-right\" ng-class=\"{\'fa-eye\': !user.decryptedMode, \'fa-eye-slash\': user.decryptedMode}\" ng-click=\"toggleViewDecryptedDetails()\" title=\"Toggle display of participant\'s confidential details\"></i><h3><i class=\"fa fa-child\"></i> Élève</h3><ul class=\"list-unstyled\"><li title=\"{{user.fields.firstname.help}}\">{{user.fields.firstname.labelExperimenters}}: <span class=\"child_specific_results\" contenteditable=\"true\">{{user.firstname}}</span></li><li title=\"{{user.fields.lastname.help}}\">{{user.fields.lastname.labelExperimenters}}: <span class=\"child_specific_results\" contenteditable=\"true\">{{user.lastname}}</span></li><li title=\"{{user.fields.dateOfBirth.help}}\">{{user.fields.dateOfBirth.labelExperimenters}}: <span class=\"child_specific_results\" contenteditable=\"true\">{{user.dateOfBirth}}</span></li><li title=\"{{user.fields.anonymousCode.help}}\">{{user.fields.anonymousCode.labelExperimenters}}: <span class=\"\" contenteditable=\"true\">{{user.anonymousCode}}</span></li><li ng-repeat=\"field in user.fields._collection\" title=\"{{field.help}}\" ng-show=\"field.value\">{{field.labelExperimenters}}: <span class=\"\" contenteditable=\"true\">{{field.value}}</span></li></ul>");
$templateCache.put("components/user/participants-page.html","Manage Participants<div data-fielddb-datalist=\"\" json=\"application.participantsList\" corpus=\"application.corpus\"></div>");
$templateCache.put("components/user/speakers-page.html","(Native) Speakers who participate in this corpus<div data-fielddb-datalist=\"\" json=\"application.speakersList\" corpus=\"application.corpus\"></div>");
$templateCache.put("components/user/team-page.html","<div data-fielddb-user=\"\" json=\"team\"></div><div class=\"well\"><dl><dt><i style=\"margin-top:3px\" class=\"fa fa-folder-open\"></i> &nbsp;&nbsp;Interests:</dt><dd>{{team.researchInterest}}</dd><dt><i style=\"margin-top:3px\" class=\"fa fa-team\"></i> &nbsp;&nbsp;Affiliation:</dt><dd>{{team.affiliation}}</dd><dt><i style=\"margin-top:3px\" class=\"fa fa-comment\"></i> &nbsp;&nbsp;Description:</dt><dd>{{team.description}}</dd></dl></div><div ng-repeat=\"corpus in team.corpora\"><div data-fielddb-corpus=\"\" json=\"corpus\"></div></div>{{team.status}}");
$templateCache.put("components/user/user-page.html","<div data-fielddb-user=\"\" json=\"application.user\"></div><div class=\"well\"><dl><dt><i style=\"margin-top:3px\" class=\"fa fa-folder-open\"></i> &nbsp;&nbsp;Interests: {{application.user.researchInterest}}</dt><dd></dd><dt><i style=\"margin-top:3px\" class=\"fa fa-user\"></i> &nbsp;&nbsp;Affiliation: {{application.user.affiliation}}</dt><dd></dd><dt><i style=\"margin-top:3px\" class=\"fa fa-comment\"></i> &nbsp;&nbsp;Description: {{application.user.description}}</dt><dd></dd></dl></div>");
$templateCache.put("components/user/user.html","<i class=\"fa pull-right\" ng-class=\"{\'fa-eye\': !user.decryptedMode, \'fa-eye-slash\': user.decryptedMode}\" ng-click=\"toggleViewDecryptedDetails()\"></i><p class=\"text-center\"><img ng-src=\"https://secure.gravatar.com/avatar/{{user.gravatar}}?d=identicon\" alt=\"{{user.name}}\" class=\"img-polaroid\"></p><div><h1>{{user.firstname}} {{user.lastname}}</h1><p>{{user.username}}</p></div>");}]);