export default {
  name: 'app',
  data () {
    return {
      loggedIn: false,
      displayName : "",
      driveFiles: [],
      edit: {
        id: "",
        name: "",
        content: ""
      },
      newfile: {
        name: "",
        content: ""
      }
    }
  },
  created() {
    console.log('App.vue created');
    console.log('App.vue created - Loading GAPI Client and Auth2');
    gapi.load('client:auth2', this.initializeGAPI);
  },
  methods: {
    initializeGAPI() {
      console.log('App.vue methods initializeGAPI');
        // Initialize the client with API key and People API, and initialize OAuth with an
        // OAuth 2.0 client ID and scopes (space delimited string) to request access.
        gapi.client.init({
            apiKey: 'AIzaSyCkkcuOuaHe5InK-kaC4WMeGCQxrzku9ZE',
            discoveryDocs: [
              "https://www.googleapis.com/discovery/v1/apis/people/v1/rest", // loads people api into gapi.client.people
              "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest" // loads drive api into gapi.client.drive
            ],
            clientId: '776376867893-ef7btf6n7m5rh9dt5nbvmq0c7emouab0.apps.googleusercontent.com',
            scope: 'https://www.googleapis.com/auth/drive.appdata ' + // allows access to creating application specific files
                    'https://www.googleapis.com/auth/drive.file ' + // Modify files created with appdata scope
                    'https://www.googleapis.com/auth/userinfo.profile ',  // Name, Email, Photo
        }).then(function() {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus);

          // Handle the initial sign-in state.
          this.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

          // Initial set up for files table
          this.listFilesFromDrive();
        }.bind(this));

        console.log('App.vue methods initializeGAPI complete');
    },
    updateSigninStatus(isSignedIn) {
      console.log('App.vue updateSigninStatus isSignedIn: ' + isSignedIn);
      // When signin status changes, this function is called.
      // If the signin status is changed to signedIn, we make an API call.
      if (isSignedIn) {
        this.getUserData();
        this.listFilesFromDrive();
      }
      this.loggedIn = isSignedIn;
    },
    handleSignInClick(event) {
      console.log('App.vue handleSignInClick event: ' + JSON.stringify(event));
      // Ideally the button should only show up after gapi.client.init finishes, so that this
      // handler won't be called before OAuth is initialized.
      gapi.auth2.getAuthInstance().signIn();
    },
    handleSignOutClick(event) {
      console.log('App.vue handleSignOutClick event: ' + JSON.stringify(event));
      gapi.auth2.getAuthInstance().signOut();
    },
    getUserData() {
      console.log('App.vue makeApiCall');
      // Make an API call to the People API, and print the user's given name.
      gapi.client.people.people.get({
        'resourceName': 'people/me',
        'personFields': 'photos,metadata,names,emailAddresses',
      }).then(function(response) {
        console.log('makeApiCall response result')
        console.log(response.result);
        this.displayName = response.result.names[0].displayName + " - " + response.result.emailAddresses[0].value;
      }.bind(this));
    },

    // DRIVE FUNCTIONS
    saveFile(file, done) {
      function addContent(fileId) {
        return gapi.client.request({
            path: '/upload/drive/v3/files/' + fileId,
            method: 'PATCH',
            params: {
              uploadType: 'media'
            },
            name: file.name,
            body: file.content,
            fields: 'content'
          });
      }

      if (file.id) { //just update
        addContent(file.id).then(function(resp) {
          console.log('File just updated', resp.result);
          done(resp.result);
        })
      } else { //create and update
        // TODO: Handle Reading from different folders
        gapi.client.drive.files.create({
          name: file.name,
          parents: [ 'appDataFolder'],
        }).then(function(resp) {
          addContent(resp.result.id).then(function(resp) {
            console.log('created and added content', resp.result);
            done(resp.result);

          })
        });
      }
    },
    listFilesFromDrive() {
      // TODO: Handle Reading from different folders
      console.log('App.vue listFilesFromDrive');
      var request = gapi.client.drive.files.list({
        spaces: 'appDataFolder',
        fields: 'nextPageToken, files(id, name)',
        pageSize: 100
      }).execute(function(response) {
          console.log('App.vue listFilesFromDriveResponse');
          console.log(response);
          this.driveFiles = response.files;
        }.bind(this));
    },
    getFileFromDrive(file_id, callback) {
      gapi.client.drive.files.get({
        fileId: file_id,
        alt: 'media'
      }).then(callback);
    },
    deleteFileFromDrive(file_id) {
      gapi.client.drive.files.delete({
        fileId: file_id,
      }).then(function(response) {
        console.log('App.vue deleteFileFromDrive delete response');
        console.log(response);
        this.listFilesFromDrive();
      }.bind(this));
    },
    setEditData(file_id, file_name) {
      this.edit.name = file_name;
      this.edit.id = file_id;
      this.edit.content = "Loading..."
      this.getFileFromDrive(file_id, function(response) {
        console.log(response.body);
        this.edit.content = response.body;
        this.listFilesFromDrive();
      }.bind(this));
    },    
    updateFile(data) {
      this.saveFile(data, function(response) {
        console.log("Editted Data Updated!");
        this.listFilesFromDrive();
      }.bind(this));
    }
  }
}
