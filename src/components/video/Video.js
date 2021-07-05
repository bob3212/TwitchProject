import React, { useRef, useState } from "react";
import "./Video.css";
import VideoFooter from "../videoFooter/VideoFooter";
import VideoSidebar from "../videoSidebar/VideoSidebar";

function Video() {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);
  const onVideoPress = () => {
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  };
  return (
    <div className="video">
      <video
        className="video__player"
        src="https://v16m.tiktokcdn.com/00f8150467034acf33c0036f54dc624a/5f497764/video/tos/useast2a/tos-useast2a-pve-0068/5c92cd711b4c4d11a0f7560389ff3514/?a=1233&br=2200&bt=1100&cr=0&cs=0&dr=0&ds=3&er=&l=2020082815291201019018913720166B55&lr=tiktok_m&mime_type=video_mp4&qs=0&rc=Mzg8NjY0a2RodTMzPDczM0ApaTY8MzdnOWVlN2k4ZzVmOWdwcWdqLW5mNWNfLS0xMTZzc2AzNS0vMS41MDYwMWBhM2A6Yw%3D%3D&vl=&vr="
      ></video>
      {/*<VideoFooter />
          <VideoSidebar />*/}
    </div>
  );
}
export default Video;
