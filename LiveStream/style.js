import { StyleSheet, Platform, Dimensions } from 'react-native';

import { heightScale, widthScale } from '../../Utils/utils';
import fonts from '../../Utils/fonts';
import color, { Colors } from '../../../res/Colors';

const HEIGHT = Dimensions.get('window').height;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.colourDarkGray,
  },
  scroll: { flex: 1, width: '100%' },
  myVideoView: { width: '100%', height: HEIGHT },
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
    paddingBottom: Platform.OS === 'android' ? 0 : 20,
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
    flex: 0.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeHolderPic: {
    height: 250,
    width: 250,
    borderRadius: 125,
  },
  videoPausedText: {
    color: Colors.colorWhite,
    fontFamily: fonts.MontserratBold,
    fontSize: 16,
    paddingTop: 50,
    textAlign: 'center',
    lineHeight: 25,
  },
  placeHolderTxtContainer: {
    width: '65%',
  },
});

export default styles;
