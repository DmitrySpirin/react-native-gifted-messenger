import React, {Text, View, Animated, Image, Linking, StyleSheet} from 'react-native';
import ParsedText from 'react-native-parsed-text';
let styles = StyleSheet.create({
  bubble: {
    borderRadius: 10,
    padding: 10,
    paddingTop: 5
  },
  text: {
    color: '#000',
  },
  textLeft: {
    fontSize: 15,
    lineHeight: 20,
    color:'#686868',
    fontFamily: 'SF UI Text'
  },
  textRight: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 20,
    fontFamily: 'SF UI Text'
  },
  bubbleLeft: {
    marginRight: 66,
    backgroundColor: '#E7E7E7',
    alignSelf: "flex-start",
  },
  bubbleRight: {
    marginLeft: 66,
    backgroundColor: '#5A99FF',
    alignSelf: "flex-end"
  },
  url: {
    textDecorationLine: 'underline',
  },
  bubbleError: {
    backgroundColor: '#e01717'
  },

});

export default class Bubble extends React.Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    Object.assign(styles, this.props.styles);
  }

  handleUrlPress(url) {
    Linking.openURL(url);
  }

  handlePhonePress(phone) {
    //AlertIOS.alert(`${phone} has been pressed!`);
  }

  handleEmailPress(email) {
    Linking.openURL(email);
  }

  renderText(text = "", position) {

    if (this.props.renderCustomText) {
      return this.props.renderCustomText(this.props);
    }
    var parseArray = [
      {type: 'url',                       style: styles.url, onPress: this.handleUrlPress},
      {type: 'phone',                     style: styles.url, onPress: this.handlePhonePress},
      {type: 'email',                     style: styles.url, onPress: this.handleEmailPress},
    ];
    return (
        <ParsedText parse={parseArray} style={[styles.text, (position === 'left' ? styles.textLeft : styles.textRight)]}>
          {text}
        </ParsedText>
    );
  }

  render(){
    var flexStyle = {};
    if ( this.props.text.length > 40 ) {
      flexStyle.flex = 1;
    }

    return (
        <View style={[styles.bubble,
        (this.props.position === 'left' ? styles.bubbleLeft : styles.bubbleRight),
        (this.props.status === 'ErrorButton' ? styles.bubbleError : null),
        flexStyle]}>
          {this.props.name}
          {this.renderText(this.props.text, this.props.position)}
        </View>
    )
  }
}

Bubble.propTypes = {
  position: React.PropTypes.oneOf(['left','right']),
  status: React.PropTypes.string,
  text: React.PropTypes.string,
  renderCustomText: React.PropTypes.func,
  name: React.PropTypes.element
}
