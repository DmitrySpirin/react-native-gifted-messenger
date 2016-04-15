'use strict';

var React = require('react-native');
import Message from './Message';
var GiftedSpinner = require('react-native-gifted-spinner');
var {
    Text,
    View,
    ListView,
    TextInput,
    Dimensions,
    Animated,
    Image,
    TouchableHighlight,
    Platform,
    PixelRatio
} = React;

var moment = require('moment');

var Button = require('react-native-button');

var GiftedMessenger = React.createClass({

  firstDisplay: true,
  listHeight: 0,
  footerY: 0,

  getDefaultProps() {
    return {
      displayNames: true,
      displayNamesInsideBubble: false,
      placeholder: 'Type a message...',
      styles: {},
      autoFocus: true,
      onErrorButtonPress: (message, rowID) => {},
      loadEarlierMessagesButton: false,
      loadEarlierMessagesButtonText: 'Load earlier messages',
      onLoadEarlierMessages: (oldestMessage, callback) => {},
      parseText: false,
      handleUrlPress: (url) => {},
      handlePhonePress: (phone) => {},
      handleEmailPress: (email) => {},
      initialMessages: [],
      messages: [],
      handleSend: (message, rowID) => {},
      maxHeight: Dimensions.get('window').height,
      senderName: 'Sender',
      senderImage: null,
      sendButtonText: 'Send',
      onImagePress: null,
      onMessageLongPress: null,
      hideTextInput: false,
      keyboardDismissMode: 'interactive',
      keyboardShouldPersistTaps: true,
      submitOnReturn: false,
      forceRenderImage: false,
      onChangeText: (text) => {},
      autoScroll: false,
    };
  },

  propTypes: {
    displayNames: React.PropTypes.bool,
    displayNamesInsideBubble: React.PropTypes.bool,
    placeholder: React.PropTypes.string,
    styles: React.PropTypes.object,
    autoFocus: React.PropTypes.bool,
    onErrorButtonPress: React.PropTypes.func,
    loadMessagesLater: React.PropTypes.bool,
    loadEarlierMessagesButton: React.PropTypes.bool,
    loadEarlierMessagesButtonText: React.PropTypes.string,
    onLoadEarlierMessages: React.PropTypes.func,
    parseText: React.PropTypes.bool,
    handleUrlPress: React.PropTypes.func,
    handlePhonePress: React.PropTypes.func,
    handleEmailPress: React.PropTypes.func,
    initialMessages: React.PropTypes.array,
    messages: React.PropTypes.array,
    handleSend: React.PropTypes.func,
    onCustomSend: React.PropTypes.func,
    renderCustomText: React.PropTypes.func,
    maxHeight: React.PropTypes.number,
    senderName: React.PropTypes.string,
    senderImage: React.PropTypes.object,
    sendButtonText: React.PropTypes.string,
    onImagePress: React.PropTypes.func,
    onMessageLongPress: React.PropTypes.func,
    hideTextInput: React.PropTypes.bool,
    keyboardDismissMode: React.PropTypes.string,
    keyboardShouldPersistTaps: React.PropTypes.bool,
    forceRenderImage: React.PropTypes.bool,
    onChangeText: React.PropTypes.func,
    autoScroll: React.PropTypes.bool,
  },

  getInitialState: function() {
    this._data = [];
    this._rowIds = [];

    var textInputHeight = 44;
    if (this.props.hideTextInput === false) {
      if (this.props.styles.hasOwnProperty('textInputContainer')) {
        textInputHeight = this.props.styles.textInputContainer.height || textInputHeight;
      }
    }

    this.listViewMaxHeight = this.props.maxHeight - textInputHeight;

    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => {
      if (typeof r1.status !== 'undefined') {
        return true;
      }
      return r1 !== r2;
    }});
    return {
      dataSource: ds.cloneWithRows([]),
      text: '',
      inpExtStyle: null,
      disabled: true,
      height: new Animated.Value(this.listViewMaxHeight),
      isLoadingEarlierMessages: false,
      allLoaded: false,
      appearAnim: new Animated.Value(0),
    };
  },

  getMessage(rowID) {
    if (typeof this._rowIds[this._rowIds.indexOf(rowID)] !== 'undefined') {
      if (typeof this._data[this._rowIds[this._rowIds.indexOf(rowID)]] !== 'undefined') {
        return this._data[this._rowIds[this._rowIds.indexOf(rowID)]];
      }
    }
    return null;
  },

  getPreviousMessage(rowID) {
    if (typeof this._rowIds[this._rowIds.indexOf(rowID - 1)] !== 'undefined') {
      if (typeof this._data[this._rowIds[this._rowIds.indexOf(rowID - 1)]] !== 'undefined') {
        return this._data[this._rowIds[this._rowIds.indexOf(rowID - 1)]];
      }
    }
    return null;
  },

  getNextMessage(rowID) {
    if (typeof this._rowIds[this._rowIds.indexOf(rowID + 1)] !== 'undefined') {
      if (typeof this._data[this._rowIds[this._rowIds.indexOf(rowID + 1)]] !== 'undefined') {
        return this._data[this._rowIds[this._rowIds.indexOf(rowID + 1)]];
      }
    }
    return null;
  },

  renderDate(rowData = {}, rowID = null) {
    var diffMessage = null;
    if (rowData.isOld === true) {
      diffMessage = this.getPreviousMessage(rowID);
    } else {
      diffMessage = this.getNextMessage(rowID);
    }
    if (rowData.date instanceof Date) {
      if (diffMessage === null) {
        return (
            <Text style={[this.styles.date]}>
              {moment(rowData.date).calendar()}
            </Text>
        );
      } else if (diffMessage.date instanceof Date) {
        let diff = moment(rowData.date).diff(moment(diffMessage.date), 'minutes');
        if (diff > 5) {
          return (
              <Text style={[this.styles.date]}>
                {moment(rowData.date).calendar()}
              </Text>
          );
        }
      }
    }
    return null;
  },

  renderRow(rowData = {}, sectionID = null, rowID = null) {

    var diffMessage = null;
    if (rowData.isOld === true) {
      diffMessage = this.getPreviousMessage(rowID);
    } else {
      diffMessage = this.getNextMessage(rowID);
    }
    var dateLine = this.renderDate(rowData, rowID);
    return (
        <View>
          {dateLine}
          <Message
              rowData={rowData}
              rowID={rowID}
              onErrorButtonPress={this.props.onErrorButtonPress}
              displayNames={this.props.displayNames}
              displayNamesInsideBubble={this.props.displayNamesInsideBubble}
              diffMessage={diffMessage}
              prevMessage={(!dateLine)?this.getPreviousMessage(rowID):null}
              position={rowData.position}
              forceRenderImage={this.props.forceRenderImage}
              onImagePress={this.props.onImagePress}
              onMessageLongPress={this.props.onMessageLongPress}
              renderCustomText={this.props.renderCustomText}

              styles={this.styles}
          />
        </View>
    )
  },

  onChangeText(e) {
    var text = e.nativeEvent.text;
    var inptSize = e.nativeEvent.contentSize;
    this.setState({
      text: text,
      inpExtStyle: {height: inptSize.height}
    });
    if (text.trim().length > 0) {
      this.setState({
        disabled: false
      })
    } else {
      this.setState({
        disabled: true
      })
    }

    this.props.onChangeText(text);
  },

  componentDidMount() {
    this.scrollResponder = this.refs.listView.getScrollResponder();

    if (this.props.messages.length > 0) {
      this.appendMessages(this.props.messages);
    } else if (this.props.initialMessages.length > 0) {
      this.appendMessages(this.props.initialMessages);
    } else {
      // Set allLoaded, unless props.loadMessagesLater is set
      if (!this.props.loadMessagesLater) {
        this.setState({
          allLoaded: true
        });
      }
    }

  },

  componentWillReceiveProps(nextProps) {
    this._data = [];
    this._rowIds = [];
    this.appendMessages(nextProps.messages);

    var textInputHeight = 44;
    if (nextProps.styles.hasOwnProperty('textInputContainer')) {
      textInputHeight = nextProps.styles.textInputContainer.height || textInputHeight;
    }

    if (nextProps.maxHeight !== this.props.maxHeight) {
      this.listViewMaxHeight = nextProps.maxHeight;
    }

    if (nextProps.hideTextInput && !this.props.hideTextInput) {
      this.listViewMaxHeight += textInputHeight;

      this.setState({
        height: new Animated.Value(this.listViewMaxHeight),
      });
    } else if (!nextProps.hideTextInput && this.props.hideTextInput) {
      this.listViewMaxHeight -= textInputHeight;

      this.setState({
        height: new Animated.Value(this.listViewMaxHeight),
      });
    }
  },

  onKeyboardWillHide(e) {
    Animated.timing(this.state.height, {
      toValue: this.listViewMaxHeight,
      duration: 150,
    }).start();
  },

  onKeyboardWillShow(e) {
    Animated.timing(this.state.height, {
      toValue: this.listViewMaxHeight - (e.endCoordinates ? e.endCoordinates.height : e.end.height),
      duration: 200,
    }).start();
  },

  onKeyboardDidShow(e) {
    if(React.Platform.OS == 'android') {
      this.onKeyboardWillShow(e);
    }
    this.scrollToBottom();
  },
  onKeyboardDidHide(e) {
    if(React.Platform.OS == 'android') {
      this.onKeyboardWillHide(e);
    }
  },

  scrollToBottom() {
    if (this.listHeight && this.footerY && this.footerY > this.listHeight-59) {
      var scrollDistance = this.listHeight - this.footerY;
      /*this.scrollResponder.scrollTo({
       y: -scrollDistance,
       });*/
      this.scrollResponder.scrollTo(-(scrollDistance-59));
    }
  },

  scrollWithoutAnimationToBottom() {
    if (this.listHeight && this.footerY && this.footerY > this.listHeight-59) {
      var scrollDistance = this.listHeight - this.footerY;
      /*this.scrollResponder.scrollTo({
       y: -scrollDistance,
       x: 0,
       animated: false,
       });*/
      this.scrollResponder.scrollTo(-(scrollDistance-59), null, false);
    }
  },

  onSend() {
    var message = {
      text: this.state.text.trim(),
      name: this.props.senderName,
      image: this.props.senderImage,
      position: 'right',
      date: new Date(),
    };
    if (this.props.onCustomSend) {
      this.props.onCustomSend(message);
    } else {
      var rowID = this.appendMessage(message, true);
      this.props.handleSend(message, rowID);
      this.setState({text:'', inpExtStyle:null});
      this.props.onChangeText('');
    }
  },

  postLoadEarlierMessages(messages = [], allLoaded = false) {
    this.prependMessages(messages);
    this.setState({
      isLoadingEarlierMessages: false
    });
    if (allLoaded === true) {
      this.setState({
        allLoaded: true,
      });
    }
  },

  preLoadEarlierMessages() {
    this.setState({
      isLoadingEarlierMessages: true
    });
    this.props.onLoadEarlierMessages(this._data[this._rowIds[this._rowIds.length - 1]], this.postLoadEarlierMessages);
  },

  renderLoadEarlierMessages() {
    if (this.props.loadEarlierMessagesButton === true) {
      if (this.state.allLoaded === false) {
        if (this.state.isLoadingEarlierMessages === true) {
          return (
              <View style={this.styles.loadEarlierMessages}>
                <GiftedSpinner />
              </View>
          );
        } else {
          return (
              <View style={this.styles.loadEarlierMessages}>
                <Button
                    style={this.styles.loadEarlierMessagesButton}
                    onPress={() => {this.preLoadEarlierMessages()}}
                >
                  {this.props.loadEarlierMessagesButtonText}
                </Button>
              </View>
          );
        }
      }
    }
    return null;
  },

  prependMessages(messages = []) {
    var rowID = null;
    for (let i = 0; i < messages.length; i++) {
      this._data.push(messages[i]);
      this._rowIds.unshift(this._data.length - 1);
      rowID = this._data.length - 1;
    }
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this._data, this._rowIds),
    });
    return rowID;
  },

  prependMessage(message = {}) {
    var rowID = this.prependMessages([message]);
    return rowID;
  },

  appendMessages(messages = []) {
    var rowID = null;
    for (let i = 0; i < messages.length; i++) {
      messages[i].isOld = true;
      this._data.push(messages[i]);
      this._rowIds.push(this._data.length - 1);
      rowID = this._data.length - 1;
    }

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this._data, this._rowIds),
    });

    return rowID;
  },

  appendMessage(message = {}, scrollToBottom = true) {
    var rowID = this.appendMessages([message]);

    if (scrollToBottom === true) {
      setTimeout(() => {
        // inspired by http://stackoverflow.com/a/34838513/1385109
        this.scrollToBottom();
      }, (Platform.OS === 'android' ? 200 : 100));
    }

    return rowID;
  },

  refreshRows() {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this._data, this._rowIds),
    });
  },

  setMessageStatus(status = '', rowID) {
    if (status === 'ErrorButton') {
      if (this._data[rowID].position === 'right') {
        this._data[rowID].status = 'ErrorButton';
        this.refreshRows();
      }
    } else {
      if (this._data[rowID].position === 'right') {
        this._data[rowID].status = status;

        // only 1 message can have a status
        for (let i = 0; i < this._data.length; i++) {
          if (i !== rowID && this._data[i].status !== 'ErrorButton') {
            this._data[i].status = '';
          }
        }
        this.refreshRows();
      }
    }
  },
  renderJobBtn(){
    if(typeof(this.props.jobFunction) != 'function') return null;
    return (
        <TouchableHighlight underlayColor='transparent' style={this.styles.jobBtnContainer} onPress={this.props.jobFunction}>
          <View style={this.styles.jobBtn} >
            <Text style={this.styles.jobBtnText}>view job</Text>
          </View>
        </TouchableHighlight>
    );
  },
  renderAnimatedView() {
    return (
        <Animated.View
            style={{
          flex: 1,
        }}

        >
          <ListView
              ref='listView'
              dataSource={this.state.dataSource}
              automaticallyAdjustContentInsets={false}
              renderRow={this.renderRow}
              renderHeader={this.renderLoadEarlierMessages}
              onLayout={(event) => {
            var layout = event.nativeEvent.layout;
            this.listHeight = layout.height;
            if (this.firstDisplay === true) {
              requestAnimationFrame(() => {
                this.firstDisplay = false;
                this.scrollWithoutAnimationToBottom();
              });
            }

          }}
              renderFooter={() => {
            return <View style={this.styles.placeholder} onLayout={(event)=>{
              var layout = event.nativeEvent.layout;
              this.footerY = layout.y;

              if (this.props.autoScroll) {
                this.scrollToBottom();
              }
            }}></View>
          }}




              style={this.styles.listView}


              // not working android RN 0.14.2
              onKeyboardWillShow={this.onKeyboardWillShow}
              onKeyboardDidShow={this.onKeyboardDidShow}
              onKeyboardWillHide={this.onKeyboardWillHide}
              onKeyboardDidHide={this.onKeyboardDidHide}


              keyboardShouldPersistTaps={this.props.keyboardShouldPersistTaps} // @issue keyboardShouldPersistTaps={false} + textInput focused = 2 taps are needed to trigger the ParsedText links
              keyboardDismissMode={this.props.keyboardDismissMode}


              initialListSize={10}
              pageSize={this.props.messages.length}


              {...this.props}
          />

        </Animated.View>
    );
  },

  render() {
    return (
        <View
            style={this.styles.container}
            ref='container'
        >
          {this.renderAnimatedView()}
          {this.renderJobBtn()}
          {this.renderTextInput()}
        </View>
    )
  },

  renderTextInput() {
    if (this.props.hideTextInput === false) {
      return (
          <View style={this.styles.textInputContainer}>
            <TextInput
                style={[this.styles.textInput, this.state.inpExtStyle]}
                placeholder={this.props.placeholder}
                ref='textInput'
                multiline={true}
                onChange={this.onChangeText}
                value={this.state.text}
                autoFocus={this.props.autoFocus}
                returnKeyType={this.props.submitOnReturn ? 'send' : 'default'}
                onSubmitEditing={this.props.submitOnReturn ? this.onSend : null}
                enablesReturnKeyAutomatically={true}

                blurOnSubmit={false}
            />
            <View style={this.styles.btnContainer}>
              <Button
                  style={this.styles.sendButton}
                  styleDisabled={this.styles.sendButtonDisabled}
                  onPress={this.onSend}
                  disabled={this.state.disabled}
              >
                {this.props.sendButtonText}
              </Button>
            </View>
          </View>
      );
    }
    return null;
  },

  componentWillMount() {
    this.styles = {
      container: {
        flex: 1,
        backgroundColor: '#FFF',
      },
      listView: {
        flex: 1,
        paddingTop: 10
      },
      jobBtnContainer:{
        marginTop: -48,
        backgroundColor: 'transparent'
      },
      jobBtn:{
        width: Dimensions.get('window').width,
        height: 47,
        alignSelf: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderColor: 'white',
        backgroundColor: "#5A99FF",

      },
      jobBtnText:{
        color: 'white',
        fontSize: 16,
        listHeight: 19,
        alignSelf: 'center',
        fontWeight: '500',
        fontFamily: 'SF UI Text'
      },
      textInputContainer: {
        borderTopWidth: 1 / PixelRatio.get(),
        borderColor: '#b2b2b2',
        flexDirection: 'row',
        paddingTop:7,
        paddingBottom:11,
        paddingLeft: 10,
        paddingRight: 10,
        justifyContent: 'center',
      },
      textInput: {
        alignSelf: 'center',
        height: 30,
        width: 100,
        backgroundColor: '#FFF',
        flex: 1,
        padding: 0,
        margin: 0,
        fontSize: 15,
      },
      placeholder:{
        height: 59
      },
      btnContainer:{
        /*flex: 1,
         justifyContent: 'center'*/
      },
      sendButton: {
        flex: 1,
        marginLeft: 10,
      },
      date: {
        color: '#aaaaaa',
        fontSize: 12,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 8,
      },
      link: {
        color: '#007aff',
        textDecorationLine: 'underline',
      },
      linkLeft: {
        color: '#000',
      },
      linkRight: {
        color: '#fff',
      },
      loadEarlierMessages: {
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
      },
      loadEarlierMessagesButton: {
        fontSize: 14,
      },
    };

    Object.assign(this.styles, this.props.styles);
  },
});

module.exports = GiftedMessenger;
