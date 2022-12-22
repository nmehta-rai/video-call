import React, { useRef, useState, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Image } from 'react-native';
import { PermissionsAndroid, Platform } from 'react-native';
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
import { useIsFocused } from '@react-navigation/native';
import useGoBackHandler from '../Hooks/useGoBack';
import { Api } from '../../Service/ApiSauce';

const LiveStream = ({ route, navigation }) => {
  const appId = 'c09951627d35448e8e28d93760f43e72';
  const channelName = route.params.channelName;
  const token = route.params.token;
  const uid = route.params.myId;
  const isHost = route.params.isHost;
  const refresh = route.params.refresh;
  const profilePic = route.params.profilePic;

  const agoraEngineRef = useRef<IRtcEngine>(); // Agora engine instance
  const [isJoined, setIsJoined] = useState(false); // Indicates if the local user has joined the channel
  const [remoteUid, setRemoteUid] = useState(0); // Uid of the remote user
  const [muteLocalAudio, setMuteLocalAudio] = useState(false);
  const [muteLocalVideo, setMuteLocalVideo] = useState(
    Platform.OS === 'android' ? true : false
  );
  const [displayRemote, setDisplayRemote] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    // Initialize Agora engine when the app starts
    setupVideoSDKEngine();
  });

  useEffect(() => {
    if (isFocused) {
      join();
    }
    if (refresh) {
      refresh();
    }
  }, [isFocused]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      setTimeout(join, 300);
      setTimeout(() => setMuteLocalVideo(false), 1000);
    }
  }, []);

  useGoBackHandler(() => {
    leave();
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
        onUserOffline: (_connection, Uid) => {
          setRemoteUid(0);
        },
        onRemoteVideoStateChanged: (connection, remoteUid, _state, reason) => {
          if (!isHost && reason === 7) {
            leave();
          } else if (!isHost && reason === 6) {
            setDisplayRemote(true);
          } else if (!isHost && reason === 5) {
            setDisplayRemote(false);
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
        ChannelProfileType.ChannelProfileLiveBroadcasting
      );
      if (isHost) {
        agoraEngineRef.current?.startPreview();
        agoraEngineRef.current?.joinChannel(token, channelName, uid, {
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        });
      } else {
        agoraEngineRef.current?.joinChannel(token, channelName, uid, {
          clientRoleType: ClientRoleType.ClientRoleAudience,
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const leave = async () => {
    try {
      agoraEngineRef.current?.leaveChannel();
      setRemoteUid(0);
      setIsJoined(false);
    } catch (e) {
      console.log(e);
    } finally {
      if (isHost) {
        let body = {
          groupId: channelName * 1,
          isStreaming: false,
          channelName: channelName,
        };
        await Api.updateStreaming(body);
      }
      navigation.goBack();
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

  const Placeholder = () => {
    return (
      <View style={styles.placeHolderContainer}>
        <Image
          source={{
            uri: profilePic
              ? profilePic
              : Image.resolveAssetSource(DummyProfileIcon).uri,
          }}
          style={styles.placeHolderPic}
        />
        <View style={styles.placeHolderTxtContainer}>
          <Text style={styles.videoPausedText}>
            The Live Stream has been paused by the host
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.main}>
      <View style={styles.scroll}>
        {isJoined && isHost ? (
          <React.Fragment key={0}>
            <RtcSurfaceView canvas={{ uid: 0 }} style={styles.myVideoView} />
          </React.Fragment>
        ) : null}
        {isJoined && !isHost && remoteUid !== 0 && displayRemote ? (
          <React.Fragment key={remoteUid}>
            <RtcSurfaceView
              canvas={{ uid: remoteUid }}
              style={styles.myVideoView}
            />
          </React.Fragment>
        ) : (
          <>{!isHost && <Placeholder />}</>
        )}
        <View style={styles.absoluteContainer}>
          <View style={styles.btnsContainer}>
            {isHost && (
              <TouchableOpacity
                style={styles.actionBtnContainer}
                onPress={handleAudioMute}
              >
                <Image
                  source={muteLocalAudio ? MuteMicIcon : MicIcon}
                  style={styles.callActionBtn}
                />
              </TouchableOpacity>
            )}
            {isHost && (
              <TouchableOpacity
                style={styles.actionBtnContainer}
                onPress={handleStopLocalVid}
              >
                <Image
                  source={muteLocalVideo ? VideoOffIcon : VideoOnIcon}
                  style={styles.callActionBtn}
                />
              </TouchableOpacity>
            )}
            {isHost && (
              <TouchableOpacity
                style={styles.actionBtnContainer}
                onPress={handleRotateCamera}
              >
                <Image source={CamRotateIcon} style={styles.callActionBtn} />
              </TouchableOpacity>
            )}
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
        </View>
      </View>
    </View>
  );
};

export default LiveStream;
