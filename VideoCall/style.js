import { StyleSheet, Platform, Dimensions } from 'react-native';
import { widthScale } from '../../Utils/utils';
import { Colors } from '../../../res/Colors';
import fonts from "../../Utils/fonts";

const HEIGHT = Dimensions.get('window').height;

const styles = StyleSheet.create({
  main: { flex: 1, alignItems: 'center', backgroundColor: Colors.colourDarkGray },
  scroll: { flex: 1, width: '100%' },
  remoteVideoView: { width: '100%', height: HEIGHT },
  myVideoView: {
    height: HEIGHT / 8,
    borderRadius: 8,
    overflow: 'hidden',
    width: '20%',
    alignSelf: 'flex-end',
    backgroundColor: 'rgb(19,19,19)',
    marginRight: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  absoluteContainer: {
    position: 'absolute',
    width: '100%',
    height: HEIGHT,
    justifyContent: 'flex-end',
  },
  btnsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: 10,
    paddingBottom: Platform.OS === 'android' ? 0 : 20
  },
  callActionBtn: {
    height: widthScale(40),
    width: widthScale(40),
  },
  actionBtnContainer: {
    backgroundColor: Colors.colorWhite,
    height: widthScale(55),
    width: widthScale(55),
    borderRadius: widthScale(55 / 2),
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 25,
  },
  head: { fontSize: 20 },
  info: { backgroundColor: '#ffffe0', color: '#0000ff' },
  placeHolderContainer: {
    flex: 0.589,
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeHolderPic: {
    height: 250,
    width: 250,
    borderRadius: 125
  },
  myPlaceHolderPic: {
    height: 70,
    width: 70,
    borderRadius: 35
  },
  callConnectingText: {
    color: Colors.colorWhite,
    fontFamily: fonts.MontserratBold,
    fontSize: 16
  }
});

export default styles;
