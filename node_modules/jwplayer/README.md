# jwplayer

url : http://developer.jwplayer.com/jw-platform/reference/v1/index.html

An server side API for implementation of jwplayer uplaoad function.
It is an conversion of php API.

----------------------------------------------------------------------------

Usage : 

#Step 1

Download the php kit of jwplayer from (http://support-static.jwplayer.com/API/php-api-kit-20151013.zip) and in this kit you will find an js with name 
  *php-api-examples-20151013/upload/botr/upload.js

#Step 2
Include the upload.js in your project

#Step 3
In your angular controller do something like this

```javascript


angular.module('app')
  .factory('uploadService', function ($http, CurrentUser) {
    return {
      getUploadUrl: function() {
        return $http.get('/JWPlayer/createKey');
      },
      saveVideoData: function(data) {
        return $http.get('/JWPlayer/saveVideoData', {params: {vdoData: data, vdoKey: data.media.key, userId: CurrentUser.user().id}});
      },
    }
  });


angular.module('app').controller('JWController', ['$scope', 'uploadService', '$log', function ($scope, uploadService, $log) {
var filename;
  uploadService.getUploadUrl().success(function(data){
    console.log(data);

    // Attach a BotrUpload instance to the form.
    var upload = new BotrUpload(data.link, data.session_id, {
      "url": "", //set the url here
      params: {
        "video_key": data.media.key
      }
    });

    $log.log(upload);

    upload.useForm($("#uploadFile").get(0));
    $("body").append(upload.getIframe());
    upload.pollInterval = 1000;

       // When the upload starts, we hide the input, show the progress and disable the button.
    upload.onStart = function() { //alert(1);
      filename = $("#uploadFile").val().split(/[\/\\]/).pop();
      $("#uploadFile").css('display','none');
      $("#uploadBar").css('display','block');
      $("#uploadButton").attr('disabled','disabled');
      /*if(pauseButton) {
        pauseButton.removeAttr('disabled');
      }*/
    };

    // During upload, we update both the progress div and the text below it.
    upload.onProgress = function(bytes, total) {
      // Round to one decimal
      var pct = Math.floor(bytes * 1000 / total) / 10;
      $("#uploadProgress").animate({'width': pct + '%'}, 400);
      $("#uploadText").html('Uploading ' + filename + ' (' + pct + '%) ...');
    };//#######

    //oncomplete of upload run a service to save data.
    upload.onCompleted = function(size, redirect) {
      $log.info("Finished uploading " + size + " bytes.");
      //call a service here to save data to the database
      uploadService.saveVideoData(data).success(function(data){
        
      });
    };

  });

}]);

```

#Step 4 
On your server write this function

```javascript
var jwplayer = require('jwplayer');

/**
   *  jwplayer api used to generate api key and upload file
   *  json response 
   *  @Dependency : jwplayer 
   *
  */
createKey: function (req, res) {
    var arguments = {'resumable': 'False'};
    jwplayer.setArguments(arguments, function(error, response, body) {
      if(error) {
        res.send(error);
      } else {
        res.send(body);
      }
    });
  },

```

# Dependencies 

1. [sha1] (https://www.npmjs.com/package/sha1)
2. [request] (https://www.npmjs.com/package/request)
2. [php2js] (https://www.npmjs.com/package/php2js)
