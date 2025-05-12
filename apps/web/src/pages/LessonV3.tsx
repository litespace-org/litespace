// import React, { useEffect } from "react";
// import {
//   RoomContext,
//   useConnectionState,
//   useRoomContext,
//   useTracks,
//   type TrackReference,
// } from "@livekit/components-react";
// import { Room } from "livekit-client";
// import { useState } from "react";

// const serverUrl = "ws://localhost:7880";
// const token =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDcxMjg2OTMsImlzcyI6ImRldmtleSIsIm5hbWUiOiJ0ZXN0X3VzZXIiLCJuYmYiOjE3NDcwNDIyOTMsInN1YiI6InRlc3RfdXNlciIsInZpZGVvIjp7InJvb20iOiJ0ZXN0X3Jvb20iLCJyb29tSm9pbiI6dHJ1ZX19.680Wx0ULtnwV3evvZlOnonbZdfNQ3-IOUzB0GglupaE";

// const LessonV3: React.FC = () => {
//   const [room] = useState(
//     () =>
//       new Room({
//         // Optimize video quality for each participant's screen
//         adaptiveStream: true,
//         // Enable automatic audio/video quality optimization
//         dynacast: true,
//       })
//   );

//   useEffect(() => {
//     room.connect(serverUrl, token);
//     return () => {
//       room.disconnect();
//     };
//   }, [room]);

//   return (
//     <RoomContext.Provider value={room}>
//       <Content />
//     </RoomContext.Provider>
//   );
// };

// const Content: React.FC = () => {
//   const state = useConnectionState();
//   const room = useRoomContext();
//   const tracks = useTracks();

//   return (
//     <div>
//       <p>{state}</p>
//       <button onClick={() => room.localParticipant.enableCameraAndMicrophone()}>
//         enable
//       </button>

//       {tracks.map((track: TrackReference) => {
//         if (track.publication.kind === "video")
//           console.log(track.publication.track.mediaStream);
//         return null;
//       })}
//     </div>
//   );
// };

// export default LessonV3;
import { useLogger } from "@litespace/headless/logger";
import { Replace } from "@litespace/types";
import { UrlParamsOf, Web } from "@litespace/utils/routes";
import { isInteger } from "lodash";
import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Content from "@/components/LessonV3/Content";
import { useUserContext } from "@litespace/headless/context/user";
import cn from "classnames";

type Params = Replace<UrlParamsOf<Web.LessonV3>, "id", string>;

const LessonV3: React.FC = () => {
  const params = useParams<Params>();
  const logger = useLogger();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const lessonId = useMemo(() => {
    const id = Number(params.id);
    if (!isInteger(id)) {
      logger.error(`invalid lesson id: ${params.id}`);
      return null;
    }
    return id;
  }, [logger, params.id]);

  useEffect(() => {
    if (!lessonId || !user) return navigate(Web.Root);
  }, [lessonId, navigate, user]);

  if (!lessonId || !user) return null;

  return (
    <div
      className={cn(
        // Standard page layout styles.
        "max-h-screen p-4",
        // The pre-session page is design to take the full screen.
        "flex-1 overflow-hidden"
      )}
    >
      <Content lessonId={lessonId} self={user} />
    </div>
  );
};

export default LessonV3;
