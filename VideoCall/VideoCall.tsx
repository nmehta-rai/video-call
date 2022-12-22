import React, { useRef, useState, useEffect } from 'react';
import {
  Text,
  View,
  PermissionsAndroid,
  Platform,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  RtcSurfaceView,
  ChannelProfileType,
} from 'react-native-agora';
import styles from './style';
import {
  MicIcon,
  CamRotateIcon,
  MuteMicIcon,
  EndCallIcon,
  VideoOnIcon,
  VideoOffIcon,
  DummyProfileIcon,
} from '../../../res/images/images';
import useGoBackHandler from '../Hooks/useGoBack';
import { useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { Constant } from '../../../res/Constant';

const VideoCall = ({ route, navigation }) => {
  const appId = 'c09951627d35448e8e28d93760f43e72';
  const channelName = route.params.channelName;
  const token = route.params.token;
  const uid = route.params.myId;
  const profilePic = route.params.profilePic;
  const foreground = route.params.foreground;
  const myDP = route.params.myDP;

  const agoraEngineRef = useRef<IRtcEngine>(); // Agora engine instance
  const [isJoined, setIsJoined] = useState(false); // Indicates if the local user has joined the channel
  const [remoteUid, setRemoteUid] = useState(0); // Uid of the remote user
  const [displayRemote, setDisplayRemote] = useState(true);
  const isFocused = useIsFocused();
  const [muteLocalAudio, setMuteLocalAudio] = useState(false);
  const [muteLocalVideo, setMuteLocalVideo] = useState(
    Platform.OS === 'android' ? true : false
  );
  const [remoteJoined, setRemoteJoined] = useState(false);
  const [switchCam, setSwitchCam] = useState(false);

  useEffect(() => {
    // Initialize Agora engine when the app starts
    setupVideoSDKEngine();
  });

  useEffect(() => {
    if (isFocused) {
      join();
    }
  }, [isFocused]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      setTimeout(join, 300);
      setTimeout(() => setMuteLocalVideo(false), 1000);
    }
  }, []);

  useGoBackHandler(() => {
    if (Platform.OS === 'android') {
      Alert.alert('End Call', 'Are you sure you want to end this call?', [
        {
          text: 'Yes',
          onPress: leave,
        },
        {
          text: 'No',
        },
      ]);
    } else {
      Alert.alert('Call ended!');
      leave();
    }

    return true;
  }, []);

  const setupVideoSDKEngine = async () => {
    try {
      // use the helper function to get permissions
      if (Platform.OS === 'android') {
        await getPermission();
      }
      agoraEngineRef.current = createAgoraRtcEngine();
      const agoraEngine = agoraEngineRef.current;
      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: () => {
          setIsJoined(true);
        },
        onUserJoined: (_connection, Uid) => {
          setRemoteUid(Uid);
        },
        onUserOffline: (_connection) => {
          setRemoteUid(0);
        },
        onRemoteVideoStateChanged: (connection, remoteUid, _state, reason) => {
          if (reason === 7) {
            leave();
          } else if (reason === 5) {
            setDisplayRemote(false);
          } else if (reason === 6) {
            setDisplayRemote(true);
            setRemoteJoined(true)
          }
        },
      });
      agoraEngine.initialize({
        appId: appId,
        channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
      });
      agoraEngine.enableVideo();
    } catch (e) {
      console.log(e);
    }
  };

  const getPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
    }
  };

  const join = async () => {
    if (isJoined) {
      return;
    }
    try {
      agoraEngineRef.current?.setChannelProfile(
        ChannelProfileType.ChannelProfileCommunication
      );
      agoraEngineRef.current?.startPreview();
      agoraEngineRef.current?.joinChannel(token, channelName, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const leave = () => {
    try {
      agoraEngineRef.current?.leaveChannel();
      setRemoteUid(0);
      setIsJoined(false);
    } catch (e) {
      console.log(e);
    } finally {
      if (foreground) {
        navigation.navigate(Constant.HOME_SCREEN);
      } else {
        navigation.goBack();
      }
    }
  };

  const handleAudioMute = () => {
    agoraEngineRef.current?.muteLocalAudioStream(muteLocalAudio ? false : true);
    setMuteLocalAudio(!muteLocalAudio);
  };

  const handleRotateCamera = () => {
    agoraEngineRef.current?.switchCamera();
  };

  const handleStopLocalVid = () => {
    agoraEngineRef.current?.muteLocalVideoStream(muteLocalVideo ? false : true);
    setMuteLocalVideo(!muteLocalVideo);
  };

  const handleSwitchCam = () => {
    setSwitchCam(!switchCam);
  };

  const Placeholder = () => {
    return (
      <>
        {remoteJoined ? (
          <View style={styles.placeHolderContainer}>
            <Image
              source={{
                uri: profilePic
                  ? profilePic
                  : Image.resolveAssetSource(DummyProfileIcon).uri,
              }}
              style={styles.placeHolderPic}
            />
          </View>
        ) : <View style={styles.placeHolderContainer}>
          <Text style={styles.callConnectingText}>Please wait while the call connects</Text>
          </View>}
      </>
    );
  };

  const MyPlaceholder = () => {
    return (
      <View style={styles.myVideoView}>
        <Image
          source={{
            uri: myDP ? myDP : Image.resolveAssetSource(DummyProfileIcon).uri,
          }}
          style={styles.myPlaceHolderPic}
        />
      </View>
    );
  };

  return (
    <View style={styles.main}>
      <StatusBar barStyle='light-content' />
      <View style={styles.scroll}>
        {isJoined && displayRemote && remoteJoined ? (
          <React.Fragment key={switchCam ? 0 : remoteUid}>
            <RtcSurfaceView
              canvas={{ uid: switchCam ? 0 : remoteUid }}
              style={styles.remoteVideoView}
            />
          </React.Fragment>
        ) : (
          <Placeholder />
        )}
        <View style={styles.absoluteContainer}>
          {isJoined ? (
            <React.Fragment key={switchCam ? remoteUid : 0}>
              {!muteLocalVideo ? (
                <TouchableOpacity onPress={handleSwitchCam} disabled={true}>
                  <RtcSurfaceView
                    canvas={{ uid: switchCam ? remoteUid : 0 }}
                    style={styles.myVideoView}
                  />
                </TouchableOpacity>
              ) : (
                <MyPlaceholder />
              )}
              <View style={styles.btnsContainer}>
                <TouchableOpacity
                  style={styles.actionBtnContainer}
                  onPress={handleAudioMute}
                >
                  <Image
                    source={muteLocalAudio ? MuteMicIcon : MicIcon}
                    style={styles.callActionBtn}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtnContainer}
                  onPress={handleStopLocalVid}
                >
                  <Image
                    source={muteLocalVideo ? VideoOffIcon : VideoOnIcon}
                    style={styles.callActionBtn}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtnContainer}
                  onPress={handleRotateCamera}
                >
                  <Image source={CamRotateIcon} style={styles.callActionBtn} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionBtnContainer,
                    { backgroundColor: 'rgb(228, 0, 61)' },
                  ]}
                  onPress={leave}
                >
                  <Image source={EndCallIcon} style={styles.callActionBtn} />
                </TouchableOpacity>
              </View>
            </React.Fragment>
          ) : null}
        </View>
      </View>
    </View>
  );
};

export default VideoCall;
