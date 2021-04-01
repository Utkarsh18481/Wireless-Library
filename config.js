import  firebase from 'firebase';
//require('@firebase/firestore')
var firebaseConfig = {
    apiKey: "AIzaSyAoQNjL96nLmnSv_m8Jks-Oh9-i6vhg_a4",
    authDomain: "wireleibrary-a8150.firebaseapp.com",
    projectId: "wireleibrary-a8150",
    storageBucket: "wireleibrary-a8150.appspot.com",
    messagingSenderId: "224510837463",
    appId: "1:224510837463:web:b0620e9288ac2e18c06692"
  };
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();