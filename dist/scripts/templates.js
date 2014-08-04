angular.module('fielddbAngularApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/authentication.html',
    "<form class=\"navbar-form navbar-right\" role=\"login\"><div class=\"form-group\" ng-hide=\"authentication.user.authenticated\"><input type=\"text\" placeholder=\"Username\" class=\"form-control\" ng-model=\"loginDetails.username\" name=\"username\" value=\"\" tabindex=\"1\"> &nbsp; <input type=\"password\" placeholder=\"Password\" class=\"form-control\" ng-model=\"loginDetails.password\" name=\"password\" tabindex=\"2\"> &nbsp; <button type=\"submit\" class=\"btn btn-default\" ng-click=\"login(loginDetails)\" tabindex=\"3\">Login</button></div>{{authentication.error}} <button ng-show=\"authentication.user.authenticated\" class=\"btn btn-default\" ng-click=\"logout()\" tabindex=\"3\">Logout</button></form>"
  );


  $templateCache.put('views/core.html',
    ""
  );


  $templateCache.put('views/corpus-page.html',
    "<div class=\"row col-md-12\"><div class=\"col-md-4\" data-fielddb-user json=\"team\"></div><div class=\"col-md-6\"><div class=\"row\" data-fielddb-corpus json=\"corpus\"></div><div class=\"row\" data-fielddb-activity-heatmap></div><div class=\"row\" data-fielddb-search></div><div hidden data-fielddb-lexicon-connected-graph class=\"fielddb-lexicon lexicon-connected-graph\" json=\"corpus\"></div><div id=\"glosser\" class=\"fielddb-lexicon\"></div><div hidden data-fielddb-lexicon-nodes class=\"fielddb-lexicon lexicon-nodes\" json=\"corpus\"></div></div></div><div id=\"lexicon\" class=\"fielddb-lexicon\"></div><div hidden data-fielddb-lexicon-data json=\"corpus\" class=\"fielddb-lexicon\" placeholder=\"Lexicon raw data\"></div><div class=\"row col-md-12\" data-fielddb-corpus-terms-of-use json=\"corpus\"></div>"
  );


  $templateCache.put('views/corpus.html',
    "<h1>{{corpus.title}}</h1>{{corpus.corpus}}<div><a href=\"http://app.lingsync.org/{{corpus.pouchname}}\" class=\"pull-right\"><img ng-src=\"https://secure.gravatar.com/avatar/{{corpus.gravatar}}?d=retro&r=pg\" alt=\"Corpus image\"></a><div><div>{{corpus.description}}</div></div></div>"
  );


  $templateCache.put('views/data-page.html',
    "<div data-fielddb-data json=\"data\"></div>"
  );


  $templateCache.put('views/import.html',
    "<div class=\"container-fluid\"><div class=\"row-fluid\"><div><!--Body content--><h1><span>{{locale.locale_Import}}</span> <small>{{corpus.dbname}}</small></h1><h5><span>{{locale.locale_Import_Instructions}}</span> <a href=\"http://www.facebook.com/LingSyncApp\" target=\"_blank\"><i class=\"icons icon-facebook\"></i></a> <a href=\"https://twitter.com/lingsync\" target=\"_blank\"><i class=\"icons icon-twitter\"></i></a></h5><blockquote class=\"status\">{{importer.status}}</blockquote></div></div><div class=\"row-fluid\"></div><div class=\"well\" id=\"import-first-step\"><span>{{locale.locale_Import_First_Step}}</span><label ng-show=\"linguistApp\"><i class=\"fa fa-gift\"></i> <span>New! Import long audio/video stimuli(s)</span></label><form class=\"form-inline button-group btn-mini\" role=\"form\"><span class=\"btn btn-file btn-info\"><span><i class=\"fa fa-file\"></i> Choose file(s)</span> <input type=\"file\" multiple name=\"files\" ng-file-select=\"onFileSelect($files)\" data-multiple=\"true\" value=\"Audio/Video/Image/Text files to be imported\"></span> <input class=\"hidden\" type=\"text\" name=\"uptoken\" ng-model=\"uploadInfo.token\"> <input class=\"hidden\" type=\"text\" name=\"username\" ng-model=\"uploadInfo.username\"> <input class=\"hidden\" type=\"text\" name=\"dbname\" ng-model=\"uploadInfo.dbname\"> <input class=\"hidden\" type=\"text\" name=\"returnTextGrid\" ng-model=\"uploadInfo.returnTextGrid\"></form><textarea class=\"export-large-textarea drop-zone\" placeholder=\"{{locale.locale_Drag_and_Drop_Placeholder}}\" ng-file-drop=\"onFileSelect($files)\" ng-file-drag-over-class=\"over\" ng-file-drag-over-delay=\"200\" ng-model=\"importer.rawText\"></textarea><div class=\"btn-group pull-right\"><button class=\"btn btn-info dropdown-toggle\" data-toggle=\"dropdown\"><span>Import from</span> <span class=\"caret\"></span></button><ul class=\"dropdown-menu\" ng-model=\"whichFormatToImport\"><li><a class=\"import-format\" tabindex=\"-1\">CSV</a></li><li><a class=\"import-format\" tabindex=\"-1\">Tabbed</a></li><li><a class=\"import-format\" tabindex=\"-1\">XML</a></li><li><a class=\"import-format\" tabindex=\"-1\">ElanXML</a></li><li><a class=\"import-format\" tabindex=\"-1\">Toolbox</a></li><li><a class=\"import-format\" tabindex=\"-1\">Praat Text Grid</a></li><li><a class=\"import-format\" tabindex=\"-1\">LaTex</a></li><li><a class=\"import-format\" tabindex=\"-1\">Handout</a></li></ul></div><span class=\"pull-right\">Did the app guess the wrong format?</span></div><div class=\"well\" ng-show=\"importer.importSecondStep\"><span>{{locale.locale_Import_Second_Step}}</span> <button class=\"btn btn-info add-column pull-right hide\">{{locale.locale_Add_Extra_Columns}}</button><div class=\"container span11\"><div id=\"import-datum-field-labels\" class=\"row-fluid\"><span class=\"pull-left label label-info\" draggable ng-repeat=\"participantField in importer.corpus.participantFields\" data-drag=\"true\" data-jqyoui-options=\"{revert: 'invalid', cursor: 'move', helper: 'clone'}\" jqyoui-draggable=\"{index: {{$index}},  animate:true, placeholder: 'keep'}\" ng-model=\"participantField.labelLinguists\">{{participantField.labelLinguists}}</span></div></div><div class=\"scrollable\"><table id=\"csv-table-area\" class=\"table table-striped table-bordered table-condensed\"><tr><th><th class=\"drop-zone\" ng-repeat=\"headerCell in importer.extractedHeader\"><input ng-model=\"headerCell\" data-drop=\"true\" data-jqyoui-options=\"{hoverClass: 'over'}\" jqyoui-droppable=\"{multiple:true}\"><tr ng-repeat=\"row in importer.asCSV\"><td ng-click=\"removeRow($index)\"><i class=\"fa fa-times-circle\"></i><td ng-repeat=\"cell in row\" contenteditable ng-model=\"cell\"></table></div><button class=\"btn btn-success approve-import\" ng-show=\"importer.asCSV.length > 0\" ng-click=\"importer.convertTableIntoDataList()\">{{locale.locale_Attempt_Import}}</button></div><div class=\"well container-fluid\" ng-show=\"importer.importThirdStep\"><span>{{locale.locale_Import_Third_Step}}</span><div id=\"import-data-list\" class=\"row-fluid\"><div id=\"import-data-list-header\"></div><div class=\"container span11\"><ul class=\"unstyled import-data-list-paginated-view\"></ul><div class=\"pagination-control row span11\"></div></div></div><div id=\"import-session\" class=\"well\"></div><button class=\"btn btn-success approve-save disabled\">{{locale.locale_Save_And_Import}}</button><progress class=\"import-progress\" max=\"5\" value=\"0\"><strong>{{locale.locale_percent_completed}}</strong></progress></div></div>"
  );


  $templateCache.put('views/offline-controls.html',
    "<label class=\"topcoat-switch\"><input type=\"checkbox\" ng-model=\"connection.online\" class=\"btn-large topcoat-switch__input\"><div class=\"topcoat-switch__toggle\"></div></label>{{connection.apiURL}} {{connection.offlineCouchURL}}"
  );


  $templateCache.put('views/participants.html',
    "<h1>Participants</h1><div><i class=\"fa fa-plus-circle\"></i> New participant</div><div ng-repeat=\"participant in participants\"><div data-fielddb-user json=\"participant\"></div></div>"
  );


  $templateCache.put('views/search.html',
    "<form role=\"form\" class=\"form-inline\" id=\"searchCorpus\" ng-action=\"{{corpus.searchUrl}}/{{corpus.pouchname}}\" method=\"POST\" enctype=\"application/json\"><input type=\"text\" class=\"form-control\" id=\"queryString\" name=\"queryString\" placeholder=\"Enter search terms…\"> <button type=\"submit\" id=\"corpus_search\" class=\"btn btn-success\"><i style=\"margin-top:2px\" class=\"fa fa-search fa fa-white\"></i> Search…</button> <button id=\"corpus_build\" class=\"form-control btn btn-info\" ng-click=\"reindex('{{corpus.pouchname}}')\"><i class=\"fa fa-refresh fa fa-white\"></i> Rebuild search lexicon</button><div class=\"progress col-md-2\"><div class=\"progress-bar progress-bar-info\" role=\"progressbar\" aria-valuenow=\"60\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 60%\"></div></div></form><p id=\"clearresults\" class=\"hide\"><button type=\"button\" id=\"clear_results\" onclick=\"clearresults()\" class=\"btn btn-mini btn-danger\"><i style=\"margin-top:2px\" class=\"fa fa-remove fa fa-white\"></i> Clear…</button></p>"
  );


  $templateCache.put('views/terms-of-use.html',
    "<div class=\"tabbable\"><ul class=\"nav nav-tabs\"><li class=\"active\"><a href=\"#terms\" data-toggle=\"tab\">Terms of Use for {{corpus.title}} {{corpus.copyright}}</a></li><li><a href=\"#emeldtermsreccomendations\" data-toggle=\"tab\">Why have a Terms of Use?</a></li></ul><div class=\"tab-content\"><div id=\"terms\" class=\"tab-pane active\"><p>{{corpus.termsOfUse.humanReadable}}</p><span>License:</span> <a href=\"{{corpus.license.link}}\" rel=\"license\" title=\"More details about {{corpus.license.title}}\">{{corpus.license.title}}</a><p>{{corpus.license.humanReadable}}</p><img ng-src=\"{{corpus.license.imgURL}}\" alt=\"License\"></div><div id=\"emeldtermsreccomendations\" class=\"tab-pane\"><ul><li><dl>EMELD digital language documentation Best Practices #7:<dt>Rights<dd>Resource creators, researchers and the speech communities who provide the primary data have different priorities over who has access to language resources.<dt>Solution<dd>Terms of use should be well documented, and enforced if necessary with encryption or licensing. It is important however to limit the duration of <a target=\"_blank\" href=\"http://emeld.org/school/classroom/ethics/access.html\">access restrictions</a> : A resource whose access is permanently restricted to one user is of no long-term value since it cannot be used once that user is gone.</dl></li></ul></div></div></div>"
  );


  $templateCache.put('views/user-page.html',
    "<div data-fielddb-user json=\"user\"></div>"
  );


  $templateCache.put('views/user.html',
    "<p class=\"text-center\"><img ng-src=\"https://secure.gravatar.com/avatar/{{user.gravatar}}?d=identicon\" alt=\"{{user.name}}\" class=\"img-polaroid\"></p><div><h1>{{user.firstname}} {{user.lastname}}</h1><p>{{user.username}}</p></div><div class=\"well\"><dl><dt><i style=\"margin-top:3px\" class=\"fa fa-folder-open\"></i> &nbsp;&nbsp;Interests: {{user.researchInterest}}<dd><dt><i style=\"margin-top:3px\" class=\"fa fa-user\"></i> &nbsp;&nbsp;Affiliation: {{user.affiliation}}<dd><dt><i style=\"margin-top:3px\" class=\"fa fa-comment\"></i> &nbsp;&nbsp;Description: {{user.description}}<dd></dl></div>"
  );

}]);
