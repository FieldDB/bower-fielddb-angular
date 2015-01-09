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
var app = angular.module("fielddbAngularApp", [
  "ngAnimate",
  "ngCookies",
  "ngResource",
  "ngRoute",
  "ngSanitize",
  "ngTouch",
  "angularFileUpload",
  "contenteditable",
  "ang-drag-drop"
]).config(function($routeProvider, $sceDelegateProvider) {
  // console.log($routeProvider);

  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    "self",
    // Allow loading from outer domain.
    "https://youtube.com/**",
    "https://youtu.be/**",
    "https://soundcloud.com/**",
    "https://*.lingsync.org/**",
    "https://localhost:3184/**",
    "https://localhost/**"
  ]);
  if (FieldDB && FieldDB.PsycholinguisticsApp && FieldDB.Contextualizer && FieldDB.User) {
    var fieldDBApp = new FieldDB.PsycholinguisticsApp({
      authentication: {
        user: new FieldDB.User({
          authenticated: false
        })
      },
      contextualizer: new FieldDB.Contextualizer().loadDefaults(),
      online: true,
      apiURL: "https://localhost:3181/v2/",
      offlineCouchURL: "https://localhost:6984",
      brand: "LingSync",
      website: "http://lingsync.org",
      basePathname: "/",
    });
    if (window.location.pathname.indexOf("android_asset") > -1) {
      fieldDBApp.basePathname = window.location.pathname;
    }
  }
  // if (window.location.hash.indexOf("#") > -1) {
  //   fieldDBApp.basePathname = window.location.pathname + "#";
  // }

  // FieldDB.Database.prototype.BASE_DB_URL = "https://corpusdev.example.org";
  // FieldDB.Database.prototype.BASE_AUTH_URL = "https://authdev.example.org";
  // FieldDB.AudioVideo.prototype.BASE_SPEECH_URL = "https://speechdev.example.org";

});
console.log(app);
// app.run(["$route", "$rootScope", "$location",
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
/* globals FieldDB */

angular.module("fielddbAngularApp").controller("FieldDBController", ["$scope", "$routeParams", "$rootScope",
  function($scope, $routeParams, $rootScope) {

    if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application) {
      $scope.application = FieldDB.FieldDBObject.application;
      FieldDB.FieldDBObject.render = function() {
        try {
          if (!$scope.$$phase) {
            $scope.$apply(); //$digest or $apply
          }
        } catch (e) {
          console.warn("Rendering generated an erorr", e);
        }
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
      if ($rootScope.corpus && $rootScope.corpus.pouchname && FieldDB) {
        var url = $rootScope.corpus.url || FieldDB.Database.prototype.BASE_DB_URL + "/" + $rootScope.corpus.pouchname;
        result = result
          .replace(/CORPUS_DB_URL/g, url)
          .replace(/CORPUS_PAGE_URL/g, "http://lingsync.org/" + $rootScope.corpus.pouchname.replace("-", "/") + "/" + $rootScope.corpus.titleAsUrl);
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
    $scope.application.debug($scope.application);
    if ($routeParams) {
      $scope.application.processRouteParams($routeParams);
    }
    // FieldDB.FieldDBConnection.connect();

    console.log("FieldDBController was loaded, this means almost everything in the corpus is available now");
  }
]);

"use strict";

angular.module("fielddbAngularApp").directive("fielddbCorpus", function() {

  var directiveDefinitionObject = {
    templateUrl: "views/corpus.html", // or // function(tElement, tAttrs) { ... },
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

angular.module("fielddbAngularApp").directive("fielddbUser", function() {
  return {
    templateUrl: "views/user.html",
    restrict: "A",
    transclude: false,
    scope: {
      user: "=json"
    },
    controller: function($scope) {
      $scope.toggleViewDecryptedDetails = function() {
        $scope.user.decryptedMode = !$scope.user.decryptedMode;
      };
    },
    link: function postLink() {}
  };
});

"use strict";

angular.module("fielddbAngularApp").directive("fielddbSearch", function() {
  var search = {};
  search.sortBy = "dateCreated";
  search.fields = ["utterance", "translation"];
  return {
    templateUrl: "views/search.html",
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

angular.module("fielddbAngularApp").directive("fielddbCorpusTermsOfUse", function() {
  return {
    templateUrl: "views/terms-of-use.html",
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

angular.module("fielddbAngularApp").directive("fielddbOfflineControls", function() {
  return {
    templateUrl: "views/offline-controls.html",
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
/* globals FieldDB */


/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbAuthentication
 * @description
 * # fielddbAuthentication
 */
angular.module("fielddbAngularApp").directive("fielddbAuthentication", function() {

  var controller = function($scope, $location, $timeout) {
    /* initialize or confirm scope is prepared */
    $scope.loginDetails = $scope.loginDetails || {};
    // $scope.application.authentication = $scope.application.authentication || {};
    // $scope.application.authentication.user = $scope.application.authentication.user || {};
    if ($scope.application && typeof $scope.application.debug === "function") {
      $scope.application.debug("Scope authentication is ", $scope.application.authentication);
    } else {
      console.warn("Somethign is wrong, there is no app defined. ");
    }
    var processUserDetails = function(user) {
      user.authenticated = true;
      user.accessibleDBS = user.accessibleDBS || [];
      user.mostrecentdb = "/";
      user.roles.map(function(role) {
        var dbname = role.substring(0, role.lastIndexOf("_"));
        if (role.indexOf("-") > -1 && role.indexOf("_reader") > -1 && user.accessibleDBS.indexOf(dbname) === -1 && dbname.indexOf("lingllama-communitycorpus") === -1 && dbname.indexOf("public-firstcorpus") === -1) {
          dbname = dbname.replace("-", "/");
          if (dbname.indexOf("public") === -1 && dbname.indexOf("lingllama") === -1) {
            user.accessibleDBS.push(dbname);
            user.mostrecentdb = dbname;
          }
        }
        return role;
      });
      // try {
      //   // $scope.application.authentication.user = new FieldDB.User(user);
      // } catch (e) {
      //   console.log("problem parsing user", e, user);
      // }

      // $scope.team = user;
      // $rootScope.authenticated = true;
      // console.log($scope);

      if ($scope.application.authentication.user.accessibleDBS.indexOf("sails/fr-ca") > -1) {
        console.log("Redirecting the user to the manage sails dashboard" + "/sails/fr-ca/datalists");
        $scope.$apply(function() {
          $location.path($scope.application.basePathname + "/sails/fr-ca/datalists", false);
        });
      } else if ($location.path().indexOf("welcome") > -1 || $location.path().indexOf("bienvenu") > -1 || window.location.pathname.indexOf("welcome") > -1 || window.location.pathname.indexOf("bienvenu") > -1 || (window.location.pathname === $scope.application.basePathname + "/" && $scope.application.authentication.user.accessibleDBS.length === 1)) {
        $scope.$apply(function() {
          //http://joelsaupe.com/programming/angularjs-change-path-without-reloading/
          $location.path($scope.application.basePathname + "/" + $scope.application.authentication.user.mostrecentdb, false);
        });
      }
      $timeout(function() {
        if (!$scope.$$phase) {
          $scope.$digest(); //$digest or $apply
        }
      }, 500);
    };
    $scope.register = function(registerDetails) {
      console.warn("TODO use $scope.corpus.register", registerDetails);
    };

    $scope.login = function(loginDetails) {
      $scope.isContactingServer = true;
      $scope.application.authentication.error = "";
      if (!FieldDB || !FieldDB.Database) {
        console.warn("Authentication is handled by FieldDB, whcih is not currently loaded");
        return;
      }
      FieldDB.Database.prototype.login(loginDetails).then(function(user) {
        console.log("User has been downloaded. ", user);
        user = new FieldDB.User(user);
        $scope.application.authentication.user.merge("self", user, "overwrite");
        processUserDetails($scope.application.authentication.user);
        // $scope.isContactingServer = false;
      }, function(reason) {
        $scope.application.authentication.error = reason;
        // $scope.isContactingServer = false;
      }).catch(function() {
        $scope.isContactingServer = false;
        $scope.loginDetails.password = "";
        $scope.$digest();
      }).done(function() {
        $scope.isContactingServer = false;
        $scope.loginDetails.password = "";
        $scope.$digest();
      });
    };

    $scope.logout = function() {
      $scope.application.authentication.error = "";
      if (!FieldDB || !FieldDB.Database) {
        console.warn("Authentication is handled by FieldDB, whcih is not currently loaded");
        return;
      }
      FieldDB.Database.prototype.logout().then(function(serverReply) {
        console.log("User has been logged out. ", serverReply);
        $scope.application.authentication = {
          user: new FieldDB.User({
            authenticated: false
          })
        };
        if (window.location.pathname.indexOf("welcome") < 0 && window.location.pathname.indexOf("bienvenu") < 0) {
          $scope.$apply(function() {
            // $location.path($scope.application.basePathname +  "/welcome/", false);
            window.location.replace($scope.application.basePathname + "/welcome");
          });
        }
        $scope.$digest();
      }, function(reason) {
        $scope.application.authentication.error = reason;
        $scope.$digest();
      }).done(function() {
        $scope.isContactingServer = false;
        $scope.$digest();
      });
    };

    $scope.resumeAuthenticationSession = function() {
      // if (!$scope.corpus) {
      //   console.log("User cant resume authentication session, corpus is not defined ");
      //   return;
      // }
      if (!FieldDB || !FieldDB.Database) {
        console.warn("Authentication is handled by FieldDB, whcih is not currently loaded");
        return;
      }
      FieldDB.Database.prototype.resumeAuthenticationSession().then(function(sessionInfo) {
        $scope.application.debug(sessionInfo);
        if (sessionInfo.ok && sessionInfo.userCtx.name) {
          $scope.application.authentication.user.username = sessionInfo.userCtx.name;
          $scope.application.authentication.user.roles = sessionInfo.userCtx.roles;
          processUserDetails($scope.application.authentication.user);
        } else {
          if (window.location.pathname.indexOf("welcome") < 0 && window.location.pathname.indexOf("bienvenu") < 0) {
            $scope.$apply(function() {
              // $location.path($scope.application.basePathname + "/welcome/", false);
              window.location.replace($scope.application.basePathname + "/welcome");
            });
          }
        }
      }, function(reason) {
        console.log("Unable to login ", reason);
        $scope.error = "Unable to resume.";
        $scope.$digest();
        // $scope.$apply(function() {
        //   $location.path($scope.application.basePathname + "/welcome");
        // });
      });
    };
    $scope.resumeAuthenticationSession();


  };
  controller.$inject = ["$scope", "$location", "$timeout"];

  /* Directive declaration */
  var directiveDefinitionObject = {
    templateUrl: "views/authentication.html", // or // function(tElement, tAttrs) { ... },
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

"use strict";
/* globals FieldDB */

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbImport
 * @description
 *
 * uses drag and drop from https://github.com/codef0rmer/angular-dragdrop example: https://stackoverflow.com/questions/18679645/angularjs-drag-and-drop-plugin-drop-issue
 * # fielddbImport
 */
angular.module("fielddbAngularApp").directive("fielddbImport", function() {
  var rootScope;
  var controller = function($scope, $upload, $rootScope) {
    rootScope = $rootScope;
    if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application) {
      $scope.application = FieldDB.FieldDBObject.application;
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
    $scope.onDropRecieved = function(data, extractedHeader, headerCellIndex) {
      $scope.importer.debug("onDropRecieved", data, extractedHeader, headerCellIndex);
      extractedHeader[headerCellIndex] = data;
      $scope.importer.todo("change Import.js to use fields for the extractedHeader cells instead of just labels.");
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
          $scope.$digest();
          $scope.importer.guessFormatAndPreviewImport();
          $scope.$digest();

        }, function(failedOptions) {
          console.log("Error reading files ", failedOptions);
          $scope.$digest();
        });
      } else {
        $scope.importer.uploadFiles($files).then(function(result) {
          $scope.importer.todo(" Got an upload result in the angular directive", result);
          $scope.$digest();
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

    $scope.runImport = function() {
      if (!$scope.importer) {
        console.warn("The importer is undefined and the user is trying to import are you sure you passed an importer to this directive? or that your application has an importer?");
        return;
      }
      $scope.importer.convertTableIntoDataList().then(function(results) {
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
    templateUrl: "views/import.html",
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
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbDoc
 * @description
 * # fielddbDoc
 */
angular.module("fielddbAngularApp").directive("fielddbDoc", function($compile) {
  var templates = {
    UserMask: "<div data-fielddb-user json='doc' corpus='corpus'></div>",
    User: "<div data-fielddb-user json='doc' corpus='corpus'></div>",
    Team: "<div data-fielddb-user json='doc' corpus='corpus'></div>",
    Speaker: "<div data-fielddb-user json='doc' corpus='corpus'></div>",
    Consultant: "<div data-fielddb-user json='doc' corpus='corpus'></div>",
    Participant: "<div data-fielddb-user json='doc' corpus='corpus'></div>",

    Corpus: "<div data-fielddb-corpus json='doc' corpus='corpus'></div>",
    Session: "<div data-fielddb-datum json='doc' corpus='corpus'></div>",

    DataList: "<div data-fielddb-datalist json='doc' corpus='corpus'></div>",
    LessonDataList: "<div data-fielddb-datalist json='doc' corpus='corpus' view='LessonDataList'></div>",
    SubExperimentDataList: "<div class='well' data-fielddb-datalist json='doc' corpus='corpus' view='SubExperimentDataList'></div>",

    Document: "<div class='well' data-fielddb-datum json='doc' corpus='corpus'></div>",
    DatumField: "<div class='well' data-fielddb-datum-field json='doc' corpus='corpus'></div>",
    Datum: "<div class='well' data-fielddb-datum json='doc' corpus='corpus'></div>",
    MultipleChoice: "<div data-fielddb-datum json='doc' corpus='corpus'></div>",
    Stimulus: "<div data-fielddb-datum json='doc' corpus='corpus'></div>",

    Response: "<div data-fielddb-datum json='doc' corpus='corpus'></div>"
  };
  return {
    template: "{{doc.fieldDBtype}} Unable to display this document. {{doc._id}}",
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
          console.log("doc type is ", scope.doc.fieldDBtype);
          if (templates[scope.doc.fieldDBtype]) {
            element.html(templates[scope.doc.fieldDBtype]);
            if (scope && scope.doc && !scope.doc.fetch) {
              console.warn("This doc doesnt have the FieldDBObject methods to it, cant turn it into a " + scope.doc.fieldDBtype + " without loosing its references. Please pass it as a complex object if you need its functionality.");
              // scope.doc = new FieldDB[scope.doc.fieldDBtype](scope.doc);
            }
          } else {
            element.html("{{doc.fieldDBtype}} Unable to display this document. {{doc | json}}");
            if (scope && scope.doc && scope.doc.fetch) {
              console.log("TODO fetch the doc details and refresh the render to the right template if necessary");
              // doc.fetch().then(function(){
              //   scope.$digest();
              // });
            }
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
});

"use strict";

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbDatalist
 * @description
 * # fielddbDatalist
 */
angular.module("fielddbAngularApp").directive("fielddbDatalist", function() {


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
        if (!$scope.$$phase) {
          $scope.$digest(); //$digest or $apply
        }
      });
    };

    var fetchDatalistDocsIfEmpty = function() {

      if (!$scope.corpus || !$scope.corpus.confidential || !$scope.corpus.confidential.secretkey || !$scope.corpus.fetchCollection) {
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
      if (FieldDB && FieldDB.Database) {
        $scope.corpus.authUrl = FieldDB.Database.prototype.BASE_AUTH_URL;
      }
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
          doc.url = FieldDB.Database.prototype.BASE_DB_URL + "/" + $scope.corpus.dbname;
          return doc;
        }));

        if (!$scope.$$phase) {
          $scope.$digest(); //$digest or $apply
        }

      }, function(reason) {

        console.log("No docs docs...", reason);
        fetchDatalistDocsExponentialDecay = fetchDatalistDocsExponentialDecay * 2;
        $scope.datalist.fetchDatalistDocsExponentialDecay = fetchDatalistDocsExponentialDecay;
        console.log(" No connetion, Waiting another " + fetchDatalistDocsExponentialDecay + " until trying to fetch docs again.");
        if (!$scope.$$phase) {
          $scope.$digest(); //$digest or $apply
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

    fetchDatalistDocsIfEmpty();

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
      $scope.datalist.fetch(FieldDB.Database.prototype.BASE_DB_URL).then(function() {
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
        return "views/sub-experiment-datalist.html";
      } else if (attrs.view === "Lesson") {
        return "views/datalist.html";
      } else {
        return "views/datalist.html";
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

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbDatum
 * @description
 * # fielddbDatum
 */
angular.module("fielddbAngularApp").directive("fielddbDatum", function() {
  return {
    templateUrl: "views/datum.html",
    restrict: "A",
    transclude: false,
    scope: {
      datum: "=json",
      corpus: "=corpus"
    },
    controller: function($scope, $rootScope) {
      $scope.toggleViewDecryptedDetails = function() {
        $scope.datum.decryptedMode = !$scope.datum.decryptedMode;
      };
      $scope.showThisFieldForThisUserType = function(field) {
        // Don"t show empty fields
        if (!field.value) {
          return false;
        }
        // Only values which would be interesting for this user
        var prefs = $rootScope.application.prefs;
        // console.log(prefs);
        var userType = prefs.preferedDashboardType || "experimenterNormalUser";
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

    },
    link: function postLink() {}
  };
});

"use strict";

/**
 * @ngdoc filter
 * @name fielddbAngularApp.filter:fielddbPrettyDate
 * @function
 * @description Converts any date format (json format, timestamp etc) into something nicer (for the locale, with hour and minutes)
 * # fielddbPrettyDate
 * Filter in the fielddbAngularApp.
 */
angular.module("fielddbAngularApp").filter("fielddbPrettyDate", function() {
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
 * @name fielddbAngularApp.filter:fielddbAgoDate
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
 * Filter in the fielddbAngularApp.
 */
angular.module("fielddbAngularApp").filter("fielddbAgoDate", function() {
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

    if (isNaN(dayDiff) || dayDiff < 0) {
      return "--";
    }
    if (dayDiff >= 1430) {
      return (Math.round(dayDiff / 365) + " years ago");
    }
    if (dayDiff >= 1278) {
      return "3.5 years ago";
    }
    if (dayDiff >= 1065) {
      return "3 years ago";
    }
    if (dayDiff >= 913) {
      return "2.5 years ago";
    }
    if (dayDiff >= 730) {
      return "2 years ago";
    }
    if (dayDiff >= 540) {
      return "1.5 years ago";
    }
    if (dayDiff >= 50) {
      return (Math.round(dayDiff / 31) + " months ago");
    }
    if (dayDiff >= 48) {
      return "1.5 months ago";
    }
    if (dayDiff >= 40) {
      return "1 month ago";
    }
    if (dayDiff >= 16) {
      return (Math.round(dayDiff / 7) + " weeks ago").replace("1 weeks", "1 week");
    }
    if (dayDiff >= 2) {
      return (Math.round(dayDiff / 1) + " days ago").replace("1 days", "1 day");
    }
    if (dayDiff >= 1) {
      return "Yesterday";
    }

    if (minuteDiff >= 5000) {
      return (Math.floor(minuteDiff / 3600) + " hours ago").replace("1 hours", "1.5 hours");
    }

    if (minuteDiff >= 4000) {
      return "1 hour ago";
    }
    //  if(minuteDiff >= 7200 ){
    //    Math.floor(minuteDiff / 3600) + " 1 hour ago";
    //  }
    if (minuteDiff >= 70) {
      return Math.floor(minuteDiff / 60) + " minutes ago";
    }
    if (minuteDiff >= 120) {
      return "1 minute ago";
    }
    return "just now";

  };
});

"use strict";

/**
 * @ngdoc filter
 * @name fielddbAngularApp.filter:fielddbShortDate
 * @function
 * @description
 * # fielddbShortDate
 * Filter in the fielddbAngularApp.
 */
angular.module("fielddbAngularApp").filter("fielddbShortDate", function() {
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
 * @name fielddbAngularApp.filter:fielddbVisiblyEmpty
 * @function
 * @description
 * # fielddbVisiblyEmpty
 * Filter in the fielddbAngularApp.
 */
angular.module("fielddbAngularApp").filter("fielddbVisiblyEmpty", function() {
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
/* globals FieldDB */


/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbLocales
 * @description
 * # fielddbLocales
 */
angular.module("fielddbAngularApp").directive("fielddbLocales", function() {

  var controller = function($scope, $timeout) {

    /**
     * Error: 10 $digest() iterations reached. Aborting!
     * @type {[type]}
     * http://stackoverflow.com/questions/14376879/error-10-digest-iterations-reached-aborting-with-dynamic-sortby-predicate
     */
    $timeout(function() {
      if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application && FieldDB.FieldDBObject.application.contextualizer) {
        $scope.locales = FieldDB.FieldDBObject.application.contextualizer;
      } else {
        console.warn("locales is not available on the scope. ");
      }
    }, 1000);

    $scope.persistUsersChosenLocale = function(currentLocale) {
      $scope.locales.userOverridenLocalePreference = currentLocale;
    };

    $scope.clearLocalizerUserPreferences = function(){
      $scope.locales.userOverridenLocalePreference = null;
    };

  };
  controller.$inject = ["$scope", "$timeout"];

  /* Directive declaration */
  var directiveDefinitionObject = {
    templateUrl: "views/locales.html", // or // function(tElement, tAttrs) { ... },
    restrict: "A",
    transclude: false,
    // scope: {
    //   locales: "=json"
    // },
    controller: controller,
    link: function postLink(scope, element, attrs) {
      console.log("linking locales directive", scope, element, attrs);
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

/* globals FieldDB */
"use strict";

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbAudioVideoRecorder
 * @description
 * # fielddbAudioVideoRecorder
 */
angular.module("fielddbAngularApp").directive("fielddbAudioVideoRecorder", function() {

  return {
    templateUrl: "views/audio-video-recorder.html",
    restrict: "A",
    transclude: false,
    scope: {
      parent: "=parent"
    },
    controller: function($scope) {
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
            dbname: $scope.parent.pouchname,
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

      var onAudioFail = function(e) {
        if (e === "Already running") {
          return;
        }
        $scope.datum.warn("Audio peripheralsCheck failed", e);
        if (!$scope.$$phase) {
          $scope.$digest(); //$digest or $apply
        }
      };
      var onAudioSuccess = function(s) {
        console.log("On audio sucess ", s);
        $scope.audioRecorder.element = $scope.audioRecorder.element || angular.element($scope.element.find("p")[0])[0];
        $scope.audioRecorder.parent = {
          addFile: $scope.addFile
          // dbname: $scope.parent.pouchname
        };

        if (!$scope.$$phase) {
          $scope.$digest(); //$digest or $apply
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
        $scope.parent.markAsNeedsToBeSaved();
        if (!newAudioFile.filename) {
          console.warn("Filename not specified.");
          return;
        }
        newAudioFile.dbname = $scope.parent.pouchname;
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

    },
    link: function postLink(scope, el) {
      console.log("keeping a reference to this element");
      scope.element = el;
      // if (FieldDB && FieldDB.AudioVideoRecorder && FieldDB.AudioVideoRecorder.Recorder) {
      //   FieldDB.AudioVideoRecorder.Recorder.initRecorder();
      // }
    }
  };
});

"use strict";

/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbDatumField
 * @description
 * # fielddbDatumField
 */

angular.module("fielddbAngularApp").directive("fielddbDatumField", function() {

  var directiveDefinitionObject = {
    templateUrl: "views/datum-field.html", // or // function(tElement, tAttrs) { ... },
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
 * @name fielddbAngularApp.directive:fielddbCollection
 * @description
 * # fielddbCollection
 */
angular.module("fielddbAngularApp").directive("fielddbCollection", function() {


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
        if (!$scope.$$phase) {
          $scope.$digest(); //$digest or $apply
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
      return "views/collection.html";
    },
    restrict: "A",
    transclude: false,
    scope: {
      collection: "=json"
    },
    controller: controller,
    link: function postLink() {},
    priority: 0,
    replace: false,
    controllerAs: "stringAlias"
  };
  return directiveDefinitionObject;
});
