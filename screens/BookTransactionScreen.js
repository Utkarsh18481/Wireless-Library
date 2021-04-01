import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, TextInput, Image, KeyboardAvoidingView, Alert, ToastAndroid } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import firebase from 'firebase';
import db from '../config';

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        scannedBookId: '',
        scannedStudentId:'',
        hasCameraPermissions: null,
        scanned: false,
        buttonState: 'normal',
        transactionMessage:''
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }
    handleTransaction = async()=>{
      var transactionMessage=null;
      db.collection('books').doc(this.state.scannedBookId).get()
      .then((doc)=>{
        console.log(doc.data())
        var book=doc.data()
        if(book.bookAvailability){
          this.initiateBookIssue()
          transactionMessage='Book Issued'
         //Alert.alert(transactionMessage)
        ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
        }else{
          this.initiateBookReturn()
          transactionMessage='Book Return'
          //Alert.alert(transactionMessage)
          ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
        }
      })
      this.setState({
        transactionMessage:transactionMessage
      })
    }
    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state
      if(buttonState=='bookID'){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState=='studentID'){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
    }
    initiateBookIssue=async()=>{
      db.collection('transaction').add({
        'studentId':this.state.scannedStudentId,
        'bookId':this.state.scannedBookId,
        'data':firebase.firestore.Timestamp.now().toDate(),
        'transactionType':'Issue'
      })
      db.collection('books').doc(this.state.scannedBookId).update({
        'bookAvailability':false
      })
      db.collection('students').doc(this.state.scannedStudentId).update({
        'noOfBookIssued':firebase.firestore.FieldValue.increment(1)
      })
      this.setState({
        scannedBookId:'',
        scannedStudentId:''
      })
    }
    initiateBookReturn=async()=>{
      db.collection('transaction').add({
        'studentId':this.state.scannedStudentId,
        'bookId':this.state.scannedBookId,
        'data':firebase.firestore.Timestamp.now().toDate(),
        'transactionType':'Return'
      })
      db.collection('books').doc(this.state.scannedBookId).update({
        'bookAvailability':true
      })
      db.collection('students').doc(this.state.scannedStudentId).update({
        'noOfBookIssued':firebase.firestore.FieldValue.increment(-1)
      })
      this.setState({
        scannedBookId:'',
        scannedStudentId:''
      })
    }
    
    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;

      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView style={styles.container} behavior='padding' enabled>
          <View style={styles.container}>
          <View>
          <Image source ={require('../assets/images-_2_.png')} style={{width:200, height:200}}></Image>
          </View>
          <View style={styles.inputView}>
          <TextInput style={styles.inputBox} placeholder='Book ID' value={this.state.scannedBookId} onChangeText={text =>this.setState({scannedBookId:text})}></TextInput>
          <TouchableOpacity style={styles.scanButton} onPress={()=>{
            this.getCameraPermissions('bookID')
          }}>
          <Text style={styles.buttonText}>
          Scan
          </Text>
          </TouchableOpacity>
          </View>
          <View style={styles.inputView}>
          <TextInput style={styles.inputBox} placeholder='Student ID' value={this.state.scannedStudentId} onChangeText={text =>this.setState({scannedStudentId:text})}></TextInput>
          <TouchableOpacity style={styles.scanButton} onPress={()=>{
            this.getCameraPermissions('studentID')
          }}>
          <Text style={styles.buttonText}>
          Scan
          </Text>
          </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={async()=>{
                var transactionMessage = this.handleTransaction();
                this.setState(
                  {scannedBookId:'',
                   scannedStudentId:''})
              }}>
          <Text style={styles.submitButtonText}>
          Submit
          </Text>
          </TouchableOpacity>
          {/* <Text style={styles.displayText}>{
            hasCameraPermissions===true ? this.state.scannedData: "Request Camera Permission"
          }</Text>     

          <TouchableOpacity
            onPress={this.getCameraPermissions}
            style={styles.scanButton}>
            <Text style={styles.buttonText}>Scan QR Code</Text>
          </TouchableOpacity> */}
        </View>
        </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 20,
      textAlign:'center',
      marginTop:10,

    },
    inputView:{
      flexDirection:'row',
      margin:20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    submitButton:{
      backgroundColor:'blue',
      width: 100,
      height: 50,
    },
    submitButtonText:{
      padding:10,
      textAlign: 'center',
      fontSize:20,
      fontWeight:'bold',
      color: 'white',
      }
    
  });